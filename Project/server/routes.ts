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

      const systemPrompt = `You are a Specialist SEN Teacher at Al Karamah School. 
      Generate a ${type} in a BILINGUAL (Arabic/English) format.
      
      Student Profile:
      - Name: ${student.name}
      - AET Level: ${student.aetLevel}
      - Communication: ${student.communicationLevel}
      - Primary Interest: ${student.primaryInterest}
      - Target Areas: ${student.learningGoals?.replaceAll('|', ', ')}

      Tone: Concrete, literal, and high-support.
      Personalization: Incorporate the student's interest in "${student.primaryInterest}" as the primary narrative anchor.
      
      Structure:
      - English on the top/left, Arabic on the bottom/right.
      - If Social Story: Exactly 4 distinct steps. Each step must have "text_en" and "text_ar".
      - If PECS: 6 cards. Each card must have "label_en" and "label_ar".
      - If Worksheet: 3 questions. Each question must have "text_en" and "text_ar".
      `;

      let formatPrompt = "";
      if (type === 'story') {
        formatPrompt = `Create a Social Story about ${topic || 'daily skills'}. 
        JSON structure: { 
          "title": "Bilingual Title", 
          "steps": [
            {
              "title": "Step Title",
              "text_en": "English text...", 
              "text_ar": "Arabic translation...", 
              "image_prompt": "Visual description including ${student.primaryInterest}"
            }
          ] 
        }`;
      } else if (type === 'worksheet') {
        formatPrompt = `Create a Worksheet about ${topic || 'learning'}. 
        JSON structure: { 
          "title": "Bilingual Title", 
          "instructions": "Simple instructions", 
          "questions": [
            {
              "text_en": "English question...", 
              "text_ar": "Arabic translation...",
              "type": "matching"
            }
          ] 
        }`;
      } else if (type === 'pecs') {
        formatPrompt = `Create PECS cards. 
        JSON structure: { 
          "title": "Bilingual Title", 
          "cards": [
            {
              "label_en": "English label", 
              "label_ar": "Arabic label", 
              "image_prompt": "Simple icon style of [label] with ${student.primaryInterest} elements"
            }
          ] 
        }`;
      }

      const prompt = `${systemPrompt}\n\n${formatPrompt}\n\nReturn valid JSON only. No markdown. Ensure Arabic is high-quality but simple.`;

      console.log(`Generating BILINGUAL SEN content for ${type}...`);
      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
              console.log(`Step ${i + 1}: Image generated successfully (base64 length: ${step.image_url.length})`);
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
              console.log(`Card ${i + 1}: Image generated successfully (base64 length: ${card.image_url.length})`);
              console.log(`Card ${i + 1}: Image Data Start: ${card.image_url.substring(0, 100)}...`);
            } else {
              console.log(`Card ${i + 1}: Image generation failed.`);
            }
          }
        }
      }

      const finalResult = {
        title: content.title || topic || "Generated Resource",
        content: content,
        type,
        language
      };

      console.log("Final generated resource object:", JSON.stringify(finalResult, null, 2));
      res.json(finalResult);

    } catch (error) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  return httpServer;
}
