import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { insertStudentSchema, insertResourceSchema } from "@shared/schema";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Use v1beta for gemini-3-flash-preview
const geminiModel = genAI?.getGenerativeModel({
  model: "gemini-3-flash-preview"
}, { apiVersion: "v1beta" });

if (!genAI) {
  console.log("Warning: GEMINI_API_KEY not found in environment variables.");
} else {
  console.log("Gemini AI successfully initialized (using gemini-3-flash-preview).");
}

const imageModel = genAI?.getGenerativeModel({
  model: "gemini-3-pro-image-preview"
}, { apiVersion: "v1beta" });

async function generateAIImage(prompt: string): Promise<string | null> {
  if (!imageModel) return null;
  try {
    const result = await imageModel.generateContent(prompt);
    const response = await result.response;
    const parts = response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
  } catch (err) {
    console.error("Image generation failed for prompt:", prompt, err);
  }
  return null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // === STUDENTS ===
  app.get(api.students.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;
    const students = await storage.getStudents(userId);
    res.json(students);
  });

  app.get(api.students.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const student = await storage.getStudent(Number(req.params.id));
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  });

  app.post(api.students.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = insertStudentSchema.parse(req.body);
      const userId = req.user!.id;
      const student = await storage.createStudent({ ...input, teacherId: userId });
      res.status(201).json(student);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ message: e.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.put(api.students.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(Number(req.params.id), input);
      res.json(student);
    } catch (e) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.delete(api.students.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteStudent(Number(req.params.id));
    res.sendStatus(204);
  });

  // === RESOURCES ===
  app.get(api.resources.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const resources = await storage.getResources(Number(req.params.studentId));
    res.json(resources);
  });

  app.get(api.resources.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const resource = await storage.getResource(Number(req.params.id));
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  });

  app.post(api.resources.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(input);
      res.status(201).json(resource);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.resources.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteResource(Number(req.params.id));
    res.sendStatus(204);
  });

  // === AI GENERATION ===
  app.post(api.ai.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { studentId, type, topic, language } = req.body;
      const student = await storage.getStudent(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });

      if (!geminiModel) {
        return res.status(503).json({ message: "AI services are currently unavailable (missing API key)" });
      }

      const systemPrompt = `You are an expert special education teacher assisting a student with autism.
      Student Profile:
      - Name: ${student.name}
      - Age: ${student.age}
      - Level: ${student.aetLevel}
      - Communication: ${student.communicationLevel}
      - Sensory: ${student.sensoryPreference}
      - Goals: ${student.learningGoals}

      Language: ${language === 'ar' ? 'Arabic' : 'English'}
      Task: Generate a ${type} about "${topic || 'general daily skills'}".
      Output Format: Return valid JSON only.
      
      Constraints:
      - Use simple, direct language.
      - Positive reinforcement.
      - Autism-friendly structure (clear steps).
      - If Arabic, ensure correct grammar and simple vocabulary.
      `;

      let formatPrompt = "";
      if (type === 'story') {
        formatPrompt = `Create a Social Story. JSON structure: { "title": "...", "steps": [{"text": "...", "image_prompt": "..."}] }`;
      } else if (type === 'worksheet') {
        formatPrompt = `Create a Worksheet. JSON structure: { "title": "...", "instructions": "...", "questions": [{"question": "...", "instructions": "...", "options": ["..."], "correct_answer": "..."}] }`;
      } else if (type === 'pecs') {
        formatPrompt = `Create a set of PECS cards. JSON structure: { "title": "...", "cards": [{"label": "...", "image_prompt": "..."}] }`;
      }

      const prompt = `${systemPrompt}\n\n${formatPrompt}\n\nStrictly return only JSON. No markdown formatting.`;

      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const response = await result.response;
      const text = response.text();

      // Attempt to clean text if it contains markdown blocks
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const content = JSON.parse(cleanJson);

      // Generate images for story steps or PECS cards
      if (type === 'story' && content.steps) {
        await Promise.all(content.steps.map(async (step: any) => {
          if (step.image_prompt) {
            step.image_url = await generateAIImage(step.image_prompt);
          }
        }));
      } else if (type === 'pecs' && content.cards) {
        await Promise.all(content.cards.map(async (card: any) => {
          if (card.image_prompt) {
            card.image_url = await generateAIImage(card.image_prompt);
          }
        }));
      }

      res.json({
        title: content.title || topic || "Generated Resource",
        content: content,
        type,
        language
      });

    } catch (error) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  return httpServer;
}
