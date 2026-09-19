import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "./config.js";

export type AppDatabase = Database.Database;

export function openDatabase(databasePath = config.databasePath) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  return database;
}

export function runMigrations(database: AppDatabase, migrationDirectory = config.migrationDirectory) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    database.prepare("SELECT version FROM schema_migrations").all().map((row) => (row as { version: string }).version),
  );
  const migrations = fs.readdirSync(migrationDirectory).filter((file) => file.endsWith(".sql")).sort();

  for (const migration of migrations) {
    if (applied.has(migration)) continue;
    const sql = fs.readFileSync(path.join(migrationDirectory, migration), "utf8");
    database.transaction(() => {
      database.exec(sql);
      database.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)").run(
        migration,
        new Date().toISOString(),
      );
    })();
  }
}

