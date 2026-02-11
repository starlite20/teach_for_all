import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { geminiModel, generateAIImage } from "./ai";
import { insertStudentSchema, insertResourceSchema } from "@shared/schema";
import { getSystemPrompt, getFormatPrompt, getRegenerationPrompt } from "./promptLibrary";

// Helper for throttling
async function processInBatches<T>(items: T[], batchSize: number, processor: (item: T, index: number) => Promise<void>) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map((item, idx) => processor(item, i + idx)));
  }
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
      // PERSISTENCE FIX: Scan for base64 images and upload to Supabase
      const { uploadToSupabase } = await import("./ai");

      const processContentImages = async (content: any) => {
        if (!content) return;

        // Helper to check and upload
        const checkAndUpload = async (obj: any, key: string) => {
          if (obj[key] && obj[key].startsWith('data:image')) {
            console.log("Found base64 image in save payload. Uploading to Supabase...");
            // Extract base64 info
            const matches = obj[key].match(/^data:(.+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              const publicUrl = await uploadToSupabase(base64Data, mimeType);
              if (publicUrl) {
                obj[key] = publicUrl;
                console.log("Replaced base64 with:", publicUrl);
              }
            }
          }
        };

        if (content.type === 'story' && content.content?.steps) {
          for (const step of content.content.steps) {
            await checkAndUpload(step, 'image_url');
          }
        }
        if (content.type === 'pecs' && content.content?.cards) {
          for (const card of content.content.cards) {
            await checkAndUpload(card, 'image_url');
          }
        }
        if (content.type === 'worksheet' && content.content?.questions) {
          for (const q of content.content.questions) {
            if (q.choices) {
              for (const c of q.choices) {
                await checkAndUpload(c, 'image_url');
              }
            }
          }
        }
      };

      // Clone body to avoid mutating req.body unexpectedly if used elsewhere (though here it's fine)
      const body = JSON.parse(JSON.stringify(req.body));

      // The `content` field in the DB schema is a JSON column.
      // In the request, `body.content` usually contains the actual resource data (steps, etc).
      // Let's process it.
      await processContentImages({ type: body.type, content: body.content });

      const input = insertResourceSchema.parse(body);
      const resource = await storage.createResource(input);
      res.status(201).json(resource);
    } catch (e: any) {
      console.error("Save Resource Error:", e);
      res.status(400).json({ message: "Invalid input or upload failed" });
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

      const systemPrompt = getSystemPrompt(student, language, aetContext);
      const formatPrompt = getFormatPrompt(type, topic, student);

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
      // Process images with batch throttling
      const itemsToProcess = [];
      if (type === 'story' && content.steps) itemsToProcess.push(...content.steps);
      else if (type === 'pecs' && content.cards) itemsToProcess.push(...content.cards);
      else if (type === 'worksheet' && content.questions) itemsToProcess.push(...content.questions);

      if (itemsToProcess.length > 0) {
        console.log(`[AI] Generating ${itemsToProcess.length} images (Batch Limit: 5)...`);
        await processInBatches(itemsToProcess, 5, async (item: any) => {
          // Standard items (steps, cards)
          if (item.image_prompt) {
            item.image_url = await generateAIImage(item.image_prompt);
          }
          // Detailed scan for Worksheet Choices
          if (item.choices && Array.isArray(item.choices)) {
            for (const choice of item.choices) {
              if (choice.image_prompt) {
                choice.image_url = await generateAIImage(choice.image_prompt);
              }
            }
          }
        });
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
    const { text, type } = req.body; // Changed from 'prompt' to structured input
    if (!text) return res.status(400).json({ message: "Text required" });

    try {
      // Use centralized prompt library
      // const prompt = require("./promptLibrary").getRegenerationPrompt(text, type || 'symbol');
      const prompt = getRegenerationPrompt(text, (type as 'story' | 'pecs' | 'symbol') || 'symbol');
      const image_url = await generateAIImage(prompt);
      res.json({ image_url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
