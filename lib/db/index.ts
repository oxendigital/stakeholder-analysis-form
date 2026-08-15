import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:stakeholder_analysis.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

// Auto-initialize SQLite tables on start if not already present
let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS evaluations (
          id TEXT PRIMARY KEY,
          venture_name TEXT NOT NULL,
          entrepreneur_name TEXT NOT NULL,
          industry TEXT NOT NULL,
          date TEXT NOT NULL,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'completed',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.execute(`
        CREATE TABLE IF NOT EXISTS stakeholder_responses (
          id TEXT PRIMARY KEY,
          evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
          stakeholder_key TEXT NOT NULL,
          stakeholder_name TEXT NOT NULL,
          category TEXT DEFAULT 'General',
          triple_impact_dimension TEXT DEFAULT 'Transversal',
          is_custom INTEGER NOT NULL DEFAULT 0,
          is_related INTEGER NOT NULL,
          importance TEXT,
          impact_on_venture TEXT,
          impact_of_venture TEXT,
          priority TEXT,
          priority_score INTEGER DEFAULT 0,
          strategic_action TEXT,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error("Database initialization notice/error:", error);
    }
  })();

  return initPromise;
}
