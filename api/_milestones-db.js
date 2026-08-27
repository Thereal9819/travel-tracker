// Helper di accesso al database Turso per lo stato delle Milestone.
// Nessuna route qui dentro (solo export nominati) — Vercel non lo tratta
// come endpoint. La route vera è in api/milestones.js.

import { createClient } from "@libsql/client";

export function makeClient(url, authToken) {
  return createClient({ url, authToken });
}

export async function ensureTable(db) {
  await db.execute(
    "CREATE TABLE IF NOT EXISTS milestones_checked (id TEXT PRIMARY KEY, checked_at TEXT NOT NULL DEFAULT (datetime('now')))"
  );
}

export async function getChecked(db) {
  const rs = await db.execute("SELECT id FROM milestones_checked ORDER BY id");
  return rs.rows.map((r) => r.id);
}

export async function setChecked(db, id, checked) {
  if (checked) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO milestones_checked (id) VALUES (?)",
      args: [id],
    });
  } else {
    await db.execute({
      sql: "DELETE FROM milestones_checked WHERE id = ?",
      args: [id],
    });
  }
}
