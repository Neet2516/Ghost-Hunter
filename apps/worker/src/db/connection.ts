import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export type WorkerDatabase = BetterSQLite3Database<typeof schema>;

let defaultInstance: { sqlite: Database.Database; db: WorkerDatabase } | null = null;

export function createDatabaseConnection(dbPath?: string): {
  sqlite: Database.Database;
  db: WorkerDatabase;
} {
  const filePath =
    dbPath ||
    process.env.DATABASE_URL?.replace(/^file:/, '') ||
    './sqlite.db';

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
