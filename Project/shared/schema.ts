import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";
export * from "./models/chat";

// === STUDENTS ===
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  aetLevel: text("aet_level").notNull(), // 'expected', 'emerging', 'secure' etc.
  communicationLevel: text("communication_level").notNull(), // 'verbal', 'non-verbal', 'pecs'
  sensoryPreference: text("sensory_preference").notNull(),
  learningGoals: text("learning_goals").notNull(),
  teacherId: text("teacher_id").notNull(), // References users.id (which is varchar from auth schema)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({ 
  id: true, 
  createdAt: true,
  teacherId: true 
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;


// === RESOURCES ===
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'story', 'worksheet', 'pecs'
  content: jsonb("content").notNull(), // Structure depends on type
  language: text("language").notNull().default('en'), // 'en' or 'ar'
  studentId: integer("student_id").notNull(), // References students.id
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({ 
  id: true, 
  createdAt: true 
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

// === RELATIONS ===
export const studentsRelations = relations(students, ({ one, many }) => ({
  teacher: one(users, {
    fields: [students.teacherId],
    references: [users.id],
  }),
  resources: many(resources),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  student: one(students, {
    fields: [resources.studentId],
    references: [students.id],
  }),
}));
