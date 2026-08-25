import { useMemo, useState } from "react";
import { MILESTONES } from "./milestones.js";

export default function Milestones({ C, checkedIds, syncState, onToggle }) {
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? MILESTONES.filter((m) =>
          m.name.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q) ||
          m.continent.toLowerCase().includes(q)
        )
      : MILESTONES;
    const byContinent = {};
    for (const m of filtered) {
      if (!byContinent[m.continent]) byContinent[m.continent] = [];
      byContinent[m.continent].push(m);
    }
    return byContinent;
  }, [search]);

  const inp = { background: C.bg, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 14, flex: "1 1 220px", minWidth: 140 };

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca milestone, paese, continente…" style={inp} />
        <div style={{ fontSize: 13, color: C.inkSoft }}>
          {MILESTONES.filter((m) => checkedIds.has(m.id)).length} / {MILESTONES.length} completate
        </div>
        {syncState !== "idle" && (
          <span style={{ fontSize: 12, color: syncState === "ok" ? C.accent : syncState === "loading" ? C.inkSoft : "#e76f51" }}>
            {syncState === "loading" && "Sincronizzazione…"}
            {syncState === "ok" && "Salvate su Sheets ✓"}
            {syncState === "error" && "Errore di sincronizzazione (solo locale)"}
          </span>
        )}
      </div>
      {Object.keys(grouped).length === 0 && (
        <div style={{ color: C.inkSoft, fontSize: 14 }}>Nessuna milestone trovata.</div>
      )}
      {Object.entries(grouped).map(([continent, items]) => (
        <div key={continent} style={{ marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, margin: "0 0 10px" }}>{continent}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
            {items.map((m) => {
              const checked = checkedIds.has(m.id);
              return (
                <label key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 10, background: C.panelSoft,
                  border: `1px solid ${checked ? C.accent : C.line}`, borderRadius: 10, padding: "9px 12px",
                  cursor: "pointer", fontSize: 14,
                }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onToggle(m.id, e.target.checked)}
                    style={{ accentColor: C.accent, width: 16, height: 16, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ color: C.ink }}>{m.name}</div>
                    <div style={{ color: C.inkSoft, fontSize: 12 }}>{m.country}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
