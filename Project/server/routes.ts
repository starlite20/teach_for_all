import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { geminiModel, generateAIImage } from "./ai";
import { insertStudentSchema, insertResourceSchema } from "@shared/schema";

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

  app.patch("/api/students/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const student = await storage.updateStudent(id, req.body);
    res.json(student);
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
      const { studentId, type, topic, language, aetContext } = req.body;
      const student = await storage.getStudent(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });

      if (!geminiModel) {
        return res.status(503).json({ message: "AI services are currently unavailable (missing API key)" });
      }

      const systemPrompt = `
        You are a specialized AET (Autism Education Trust) Resource Creator. 
        Student Profile:
        - Name: ${student.name}
        - AET Level: ${student.aetLevel}
        - Communication: ${student.communicationLevel}
        - Primary Interest: ${student.primaryInterest}
        - Language Preference: ${language || student.preferredLanguage}
        - Target Area: ${aetContext?.area || "General Development"}
        - Target Sub-Topic: ${aetContext?.subTopic || "Functional Skills"}
        - Target Learning Intention: ${aetContext?.intention || "Holistic progress"}

        Tone: Concrete, literal, and high-support.
        Personalization: ALWAYS anchor narratives in the student's interest: "${student.primaryInterest}".
        Objective: The resource must specifically address the skills required to move the student forward in the Learning Intention: "${aetContext?.intention || 'specified target'}". Use "${student.primaryInterest}" as the vehicle for the lesson.
        
        Bilingual Requirement:
        - If language is "bilingual", you MUST provide BOTH "text_en" AND "text_ar" for every element.
        - If "en", only "text_en" is required (but "text_ar" can be empty).
        - If "ar", only "text_ar" is required (but "text_en" can be empty).
        - Use simple, direct language. No metaphors.

        Return ONLY a JSON object.
      `;

      let formatPrompt = "";
      if (type === 'story') {
        formatPrompt = `Topic: ${topic || 'Daily Skills'}. 
        JSON: { 
          "title": "Clear Title", 
          "steps": [
            {
              "text_ar": "Arabic translation...", 
              "image_prompt": "Widgit/PCS style symbol, simple vector, thick bold outlines, flat colors, white background, no shading, ${student.primaryInterest} context if applicable: ${topic}"
            }
          ] 
        } (Exactly 4 steps)`;
      } else if (type === 'pecs') {
        formatPrompt = `Topic: ${topic || 'Objects'}. 
        JSON: { 
          "title": "Category Name", 
          "cards": [
            {
              "label_en": "Word", 
              "label_ar": "Word in Arabic", 
              "image_prompt": "Widgit/PCS style symbol, single isolated object, thick bold outlines, flat colors, white background, no shading"
            }
          ] 
        } (Exactly 6 cards)`;
      } else {
        formatPrompt = `Topic: ${topic || 'Learning'}. 
        JSON: { 
          "title": "Worksheet Title", 
          "instructions": "Simple task", 
          "questions": [
            {
              "text_en": "Question?", 
              "text_ar": "Question in Arabic?",
              "image_prompt": "Widgit/PCS style symbol, visual cue, simple vector, thick bold outlines, white background"
            }
          ] 
        } (Exactly 3 questions)`;
      }

      console.log(`Generating content for ${type}...`);
      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + formatPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const response = await result.response;
      const text = response.text();
      console.log("Text generation completed.");

      // Attempt to clean text if it contains markdown blocks
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const content = JSON.parse(cleanJson);

      // Generate images for story steps or PECS cards (SEQUENTIALLY)
      if (type === 'story' && content.steps) {
        console.log(`Generating ${content.steps.length} images for Social Story steps sequentially...`);
        for (let i = 0; i < content.steps.length; i++) {
          const step = content.steps[i];
          if (step.image_prompt) {
            console.log(`Step ${i + 1}: Generating image for prompt: "${step.image_prompt}"`);
            step.image_url = await generateAIImage(step.image_prompt);
            if (step.image_url) {
              console.log(`Step ${i + 1}: Image generated successfully(base64 length: ${step.image_url.length})`);
              console.log(`Step ${i + 1}: Image Data Start: ${step.image_url.substring(0, 100)}...`);
            } else {
              console.log(`Step ${i + 1}: Image generation failed.`);
            }
          }
        }
      } else if (type === 'pecs' && content.cards) {
        console.log(`Generating ${content.cards.length} images for PECS cards sequentially...`);
        for (let i = 0; i < content.cards.length; i++) {
          const card = content.cards[i];
          if (card.image_prompt) {
            console.log(`Card ${i + 1}: Generating image for prompt: "${card.image_prompt}"`);
            card.image_url = await generateAIImage(card.image_prompt);
            if (card.image_url) {
              console.log(`Card ${i + 1}: Image generated successfully(base64 length: ${card.image_url.length})`);
              console.log(`Card ${i + 1}: Image Data Start: ${card.image_url.substring(0, 100)}...`);
            } else {
              console.log(`Card ${i + 1}: Image generation failed.`);
            }
          }
        }
      }

      res.json({
        title: content.title || topic || "Generated Resource",
        content,
        type,
        language: language || student.preferredLanguage,
        studentId
      });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/regenerate-image", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt required" });

    try {
      const image_url = await generateAIImage(prompt);
      res.json({ image_url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
