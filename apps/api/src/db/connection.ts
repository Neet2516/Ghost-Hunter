import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export type AppDatabase = BetterSQLite3Database<typeof schema>;

function findWorkspaceRoot(startDir: string): string {
  let curr = startDir;
  while (curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, 'pnpm-workspace.yaml'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return startDir;
}

function resolveDatabasePath(dbPath?: string): string {
  if (dbPath) return dbPath;
  if (process.env.DATABASE_URL) {
    const raw = process.env.DATABASE_URL.replace(/^file:/, '');
    if (path.isAbsolute(raw)) return raw;
  }
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = findWorkspaceRoot(__dirname);
  return path.join(rootDir, 'sqlite.db');
}

export function createDatabaseConnection(dbPath?: string): {
  sqlite: Database.Database;
  db: AppDatabase;
} {
  const filePath = resolveDatabasePath(dbPath);

  const sqlite = new Database(filePath);

  // Enable WAL mode and foreign keys for SQLite performance and integrity
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  return { sqlite, db };
}

// Default application database instance
let defaultInstance: { sqlite: Database.Database; db: AppDatabase } | null = null;

export function getDatabase(): { sqlite: Database.Database; db: AppDatabase } {
  if (!defaultInstance) {
    defaultInstance = createDatabaseConnection();
  }
  return defaultInstance;
}
