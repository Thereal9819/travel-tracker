// Helper di accesso al database Turso per i Viaggi.
// Nessuna route qui dentro (solo export nominati) — Vercel non lo tratta
// come endpoint. La route vera è in api/trips.js.

export async function ensureTable(db) {
  await db.execute(
    "CREATE TABLE IF NOT EXISTS trips (id TEXT PRIMARY KEY, country_a3 TEXT NOT NULL, country_raw TEXT NOT NULL, region TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', date_start TEXT NOT NULL, date_end TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))"
  );
}

function rowToTrip(row) {
  return {
    id: row.id,
    countryA3: row.country_a3,
    countryRaw: row.country_raw,
    region: row.region,
    city: row.city,
    notes: row.notes,
    dateStart: row.date_start,
    dateEnd: row.date_end,
  };
}

export async function listTrips(db) {
  const rs = await db.execute(
    "SELECT id, country_a3, country_raw, region, city, notes, date_start, date_end FROM trips ORDER BY date_start"
  );
  return rs.rows.map(rowToTrip);
}

export async function insertTrip(db, fields) {
  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO trips (id, country_a3, country_raw, region, city, notes, date_start, date_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      id,
      fields.countryA3,
      fields.countryRaw,
      fields.region || "",
      fields.city || "",
      fields.notes || "",
      fields.dateStart,
      fields.dateEnd || "",
    ],
  });
  return id;
}

export async function updateTrip(db, id, fields) {
  const rs = await db.execute({
    sql: "UPDATE trips SET country_a3 = ?, country_raw = ?, region = ?, city = ?, notes = ?, date_start = ?, date_end = ? WHERE id = ?",
    args: [
      fields.countryA3,
      fields.countryRaw,
      fields.region || "",
      fields.city || "",
      fields.notes || "",
      fields.dateStart,
      fields.dateEnd || "",
      id,
    ],
  });
  return rs.rowsAffected > 0;
}

export async function deleteTrip(db, id) {
  await db.execute({ sql: "DELETE FROM trips WHERE id = ?", args: [id] });
}
