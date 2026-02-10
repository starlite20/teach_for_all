import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import pg from "pg";
import * as pgSchema from "@shared/schema";
import * as sqliteSchema from "@shared/sqlite-schema";
import path from "path";

const { Pool } = pg;

// PostgreSQL Initialization
export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool
  ? drizzlePg(pool, { schema: pgSchema })
  : null;

// SQLite Initialization (Fallback for local persistence)
const sqliteFile = path.resolve(process.cwd(), "sqlite.db");
const sqlite = new Database(sqliteFile);
export const sqliteDb = drizzleSqlite(sqlite, { schema: sqliteSchema });

// Run migrations/tables creation for SQLite if doesn't exist
// This is a simple way for local dev.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    aet_level TEXT NOT NULL,
    communication_level TEXT NOT NULL,
    sensory_preference TEXT NOT NULL,
    primary_interest TEXT NOT NULL DEFAULT '',
    teacher_id TEXT NOT NULL,
    created_at INTEGER
  );
  
  -- Add primary_interest if it doesn't exist (migration)
  BEGIN;
  SELECT count(*) FROM pragma_table_info('students') WHERE name='primary_interest';
  -- Note: Better-sqlite3 handles single-line migrations better, but for a simple fix:
  -- We'll just try to add it and ignore error if it already exists in a separate catch block in code if needed,
  -- but SQLite doesn't have a clean 'ADD COLUMN IF NOT EXISTS'.
  -- A safer way is to use a try-catch in the TS code below.
  COMMIT;
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    student_id INTEGER NOT NULL,
    created_at INTEGER
  );
`);

// Migration for existing students table
try {
  sqlite.exec(`ALTER TABLE students ADD COLUMN primary_interest TEXT NOT NULL DEFAULT ''`);
} catch (e) {
  // Column likely already exists or table doesn't exist yet
}
