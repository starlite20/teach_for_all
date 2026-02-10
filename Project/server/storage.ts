import { eq, desc } from "drizzle-orm";
import { db, sqliteDb } from "./db";
import session from "express-session";
import createMemoryStore from "memorystore";
import * as pgSchema from "@shared/schema";
import * as sqliteSchema from "@shared/sqlite-schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;

  // Students
  getStudents(teacherId: string): Promise<any[]>;
  getStudent(id: number): Promise<any | undefined>;
  createStudent(student: any & { teacherId: string }): Promise<any>;
  updateStudent(id: number, updates: any): Promise<any>;
  deleteStudent(id: number): Promise<void>;

  // Resources
  getResources(studentId: number): Promise<any[]>;
  getResource(id: number): Promise<any | undefined>;
  createResource(resource: any): Promise<any>;
  deleteResource(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<any> {
    const [user] = await db!.select().from(pgSchema.users).where(eq(pgSchema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<any> {
    const [user] = await db!.select().from(pgSchema.users).where(eq(pgSchema.users.username, username));
    return user;
  }

  async createUser(insertUser: any): Promise<any> {
    const [user] = await db!.insert(pgSchema.users).values(insertUser).returning();
    return user;
  }

  async getStudents(teacherId: string): Promise<any[]> {
    return await db!.select().from(pgSchema.students).where(eq(pgSchema.students.teacherId, teacherId));
  }

  async getStudent(id: number): Promise<any> {
    const [student] = await db!.select().from(pgSchema.students).where(eq(pgSchema.students.id, id));
    return student;
  }

  async createStudent(student: any): Promise<any> {
    const [newStudent] = await db!.insert(pgSchema.students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, updates: any): Promise<any> {
    const [updated] = await db!.update(pgSchema.students)
      .set(updates)
      .where(eq(pgSchema.students.id, id))
      .returning();
    if (!updated) throw new Error("Student not found");
    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    await db!.delete(pgSchema.students).where(eq(pgSchema.students.id, id));
  }

  async getResources(studentId: number): Promise<any[]> {
    return await db!.select()
      .from(pgSchema.resources)
      .where(eq(pgSchema.resources.studentId, studentId))
      .orderBy(desc(pgSchema.resources.createdAt));
  }

  async getResource(id: number): Promise<any> {
    const [resource] = await db!.select().from(pgSchema.resources).where(eq(pgSchema.resources.id, id));
    return resource;
  }

  async createResource(resource: any): Promise<any> {
    const [newResource] = await db!.insert(pgSchema.resources).values(resource).returning();
    return newResource;
  }

  async deleteResource(id: number): Promise<void> {
    await db!.delete(pgSchema.resources).where(eq(pgSchema.resources.id, id));
  }
}

export class SqliteStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<any> {
    const [user] = sqliteDb.select().from(sqliteSchema.users).where(eq(sqliteSchema.users.id, id)).all();
    return user;
  }

  async getUserByUsername(username: string): Promise<any> {
    const [user] = sqliteDb.select().from(sqliteSchema.users).where(eq(sqliteSchema.users.username, username)).all();
    return user;
  }

  async createUser(insertUser: any): Promise<any> {
    const id = insertUser.id || Math.random().toString(36).substring(2, 9);
    const [user] = sqliteDb.insert(sqliteSchema.users).values({ ...insertUser, id }).returning().all();
    return user;
  }

  async getStudents(teacherId: string): Promise<any[]> {
    return sqliteDb.select().from(sqliteSchema.students).where(eq(sqliteSchema.students.teacherId, teacherId)).all();
  }

  async getStudent(id: number): Promise<any> {
    const [student] = sqliteDb.select().from(sqliteSchema.students).where(eq(sqliteSchema.students.id, id)).all();
    return student;
  }

  async createStudent(student: any): Promise<any> {
    const [newStudent] = sqliteDb.insert(sqliteSchema.students).values(student).returning().all();
    return newStudent;
  }

  async updateStudent(id: number, updates: any): Promise<any> {
    const [updated] = sqliteDb.update(sqliteSchema.students)
      .set(updates)
      .where(eq(sqliteSchema.students.id, id))
      .returning()
      .all();
    if (!updated) throw new Error("Student not found");
    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    sqliteDb.delete(sqliteSchema.students).where(eq(sqliteSchema.students.id, id)).run();
  }

  async getResources(studentId: number): Promise<any[]> {
    return sqliteDb.select()
      .from(sqliteSchema.resources)
      .where(eq(sqliteSchema.resources.studentId, studentId))
      .orderBy(desc(sqliteSchema.resources.createdAt))
      .all();
  }

  async getResource(id: number): Promise<any> {
    const [resource] = sqliteDb.select().from(sqliteSchema.resources).where(eq(sqliteSchema.resources.id, id)).all();
    return resource;
  }

  async createResource(resource: any): Promise<any> {
    const [newResource] = sqliteDb.insert(sqliteSchema.resources).values(resource).returning().all();
    return newResource;
  }

  async deleteResource(id: number): Promise<void> {
    sqliteDb.delete(sqliteSchema.resources).where(eq(sqliteSchema.resources.id, id)).run();
  }
}

export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new SqliteStorage();
