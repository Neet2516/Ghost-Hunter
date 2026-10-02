import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export type AppDatabase = BetterSQLite3Database<typeof schema>;

export function createDatabaseConnection(dbPath?: string): {
  sqlite: Database.Database;
  db: AppDatabase;
} {
  const filePath =
    dbPath ||
    process.env.DATABASE_URL?.replace(/^file:/, '') ||
    './sqlite.db';

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
