import { db } from "./db";
import { 
  students, resources, 
  type Student, type InsertStudent, 
  type Resource, type InsertResource 
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Students
  getStudents(teacherId: string): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent & { teacherId: string }): Promise<Student>;
  updateStudent(id: number, updates: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  // Resources
  getResources(studentId: number): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  deleteResource(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Student Methods
  async getStudents(teacherId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.teacherId, teacherId));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async createStudent(student: InsertStudent & { teacherId: string }): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, updates: Partial<InsertStudent>): Promise<Student> {
    const [updated] = await db.update(students)
      .set(updates)
      .where(eq(students.id, id))
      .returning();
    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Resource Methods
  async getResources(studentId: number): Promise<Resource[]> {
    return await db.select()
      .from(resources)
      .where(eq(resources.studentId, studentId))
      .orderBy(desc(resources.createdAt));
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async deleteResource(id: number): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }
}

export const storage = new DatabaseStorage();
