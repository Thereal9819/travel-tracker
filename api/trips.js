// Vercel Serverless Function: GET/POST/PUT/DELETE /api/trips
// Elenco dei viaggi, salvato su Turso.
import { makeClient } from "./_turso.js";
import { ensureTable, listTrips, insertTrip, updateTrip, deleteTrip } from "./_trips-db.js";
import { checkWriteAuth } from "./_auth.js";

function parseBody(req) {
  const body = req.body || {};
  return typeof body === "string" ? JSON.parse(body || "{}") : body;
}

function validateFields(body) {
  if (!body || typeof body !== "object") return "invalid body";
  if (!body.countryA3 || typeof body.countryA3 !== "string") return "countryA3 is required";
  if (!body.countryRaw || typeof body.countryRaw !== "string") return "countryRaw is required";
  if (!body.dateStart || typeof body.dateStart !== "string") return "dateStart is required";
  return null;
}

const WRITE_METHODS = ["POST", "PUT", "DELETE"];

export default async function handler(req, res) {
  if (WRITE_METHODS.includes(req.method) && !checkWriteAuth(req, res)) return;

  try {
    const db = makeClient(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN);
    await ensureTable(db);

    if (req.method === "GET") {
      return res.status(200).json({ trips: await listTrips(db) });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const err = validateFields(body);
      if (err) return res.status(400).json({ error: err });
      await insertTrip(db, body);
      return res.status(200).json({ trips: await listTrips(db) });
    }

    if (req.method === "PUT") {
      const body = parseBody(req);
      if (!body.id || typeof body.id !== "string") {
        return res.status(400).json({ error: "id is required" });
      }
      const err = validateFields(body);
      if (err) return res.status(400).json({ error: err });
      const existed = await updateTrip(db, body.id, body);
      if (!existed) return res.status(404).json({ error: "trip not found" });
      return res.status(200).json({ trips: await listTrips(db) });
    }

    if (req.method === "DELETE") {
      const body = parseBody(req);
      if (!body.id || typeof body.id !== "string") {
        return res.status(400).json({ error: "id is required" });
      }
      await deleteTrip(db, body.id);
      return res.status(200).json({ trips: await listTrips(db) });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).end();
  } catch (err) {
    return res.status(500).json({ error: String((err && err.message) || err) });
  }
}
