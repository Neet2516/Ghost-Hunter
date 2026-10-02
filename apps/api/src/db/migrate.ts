import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDatabase, AppDatabase } from './connection.js';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runMigrations(database?: AppDatabase, migrationsFolder?: string): void {
  const { db } = database ? { db: database } : getDatabase();
  const folder = migrationsFolder || path.resolve(__dirname, '../../drizzle');

  if (fs.existsSync(folder)) {
    console.log(`Running migrations from: ${folder}`);
    migrate(db, { migrationsFolder: folder });
    console.log('Migrations completed successfully.');
  } else {
    console.warn(`Migrations folder not found at ${folder}.`);
  }
}

// Run directly when called via CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    runMigrations();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
