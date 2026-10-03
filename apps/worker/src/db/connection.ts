import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export type WorkerDatabase = BetterSQLite3Database<typeof schema>;

let defaultInstance: { sqlite: Database.Database; db: WorkerDatabase } | null = null;

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
  db: WorkerDatabase;
} {
  const filePath = resolveDatabasePath(dbPath);

  const sqlite = new Database(filePath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });
  return { sqlite, db };
}

export function getDatabase(): { sqlite: Database.Database; db: WorkerDatabase } {
  if (!defaultInstance) {
    defaultInstance = createDatabaseConnection();
  }
  return defaultInstance;
}

export function setDatabaseInstance(
  instance: { sqlite: Database.Database; db: WorkerDatabase } | null
): void {
  defaultInstance = instance;
}
