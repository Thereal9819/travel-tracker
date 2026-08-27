// Vista "Statistiche": percentuali di paesi/milestone visitati e alcune
// curiosità sui viaggi. Componente puramente presentazionale — nessun
// fetch o side-effect proprio, riceve tutti i dati già calcolati da
// TravelTracker.jsx (stesso pattern già usato da Milestones.jsx).

export default function Statistics({
  C,
  continentStats,
  worldVisited,
  worldTotal,
  milestonesChecked,
  milestonesTotal,
  totalTrips,
  topCountry,
  topYear,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="tt-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <ProgressStat C={C} label="Mondo visitato" count={worldVisited} total={worldTotal} />
        <ProgressStat C={C} label="Milestone completate" count={milestonesChecked} total={milestonesTotal} />
      </div>

      <div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 8, fontWeight: 600 }}>Per continente</div>
        <div className="tt-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {continentStats.map((c) => (
            <ProgressStat key={c.continent} C={C} label={c.continent} count={c.visited} total={c.total} />
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 8, fontWeight: 600 }}>Curiosità</div>
        <div className="tt-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          <SimpleStat C={C} label="Viaggi totali" value={`${totalTrips}`} />
          <SimpleStat
            C={C}
            label="Paese più visitato"
            value={topCountry ? topCountry.name : "—"}
            sub={topCountry ? `${topCountry.count} viagg${topCountry.count > 1 ? "i" : "io"}` : undefined}
          />
          <SimpleStat
            C={C}
            label="Anno con più viaggi"
            value={topYear ? topYear.year : "—"}
            sub={topYear ? `${topYear.count} viagg${topYear.count > 1 ? "i" : "io"}` : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function ProgressStat({ C, label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : null;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 600, marginBottom: 8 }}>
        {pct === null ? "—" : `${count} / ${total} (${pct}%)`}
      </div>
      <div style={{ background: C.neutral, borderRadius: 999, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct ?? 0}%`, height: "100%", background: C.accent, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function SimpleStat({ C, label, value, sub }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 600 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
