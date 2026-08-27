// Vercel Serverless Function: GET/POST /api/milestones
// Stato di "quali Milestone ho segnato come visitate", salvato su Turso.
import { makeClient, ensureTable, getChecked, setChecked } from "./_milestones-db.js";

export default async function handler(req, res) {
  try {
    const db = makeClient(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN);
    await ensureTable(db);

    if (req.method === "GET") {
      return res.status(200).json({ checked: await getChecked(db) });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const { id, checked } = typeof body === "string" ? JSON.parse(body || "{}") : body;
      if (!id || typeof id !== "string" || id.length > 64 || !/^[a-z0-9-]+$/.test(id) || typeof checked !== "boolean") {
        return res.status(400).json({ error: "invalid body: expected { id: string, checked: boolean }" });
      }
      await setChecked(db, id, checked);
      return res.status(200).json({ checked: await getChecked(db) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  } catch (err) {
    return res.status(500).json({ error: String((err && err.message) || err) });
  }
}
