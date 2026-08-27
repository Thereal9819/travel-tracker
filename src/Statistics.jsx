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
  tripsByYear,
  topCountriesList,
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
        <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 8, fontWeight: 600 }}>Grafici</div>
        <div className="tt-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <YearHistogram C={C} data={tripsByYear} />
          <TopCountriesBar C={C} data={topCountriesList} />
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

function YearHistogram({ C, data }) {
  const hasData = data && data.length > 0;
  const max = hasData ? Math.max(1, ...data.map((d) => d.count)) : 1;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>Viaggi per anno</div>
      {!hasData ? (
        <div style={{ fontSize: 13, color: C.inkSoft }}>—</div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 110 }}>
          {data.map((d) => (
            <div
              key={d.year}
              title={`${d.year}: ${d.count} viagg${d.count > 1 ? "i" : "io"}`}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 26,
                  height: `${Math.max(3, (d.count / max) * 100)}%`,
                  background: C.accent,
                  borderRadius: "4px 4px 0 0",
                }}
              />
              <div style={{ fontSize: 9, color: C.inkSoft, marginTop: 4, whiteSpace: "nowrap" }}>{d.year.slice(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TopCountriesBar({ C, data }) {
  const hasData = data && data.length > 0;
  const max = hasData ? Math.max(1, ...data.map((d) => d.count)) : 1;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>Top 5 paesi più visitati</div>
      {!hasData ? (
        <div style={{ fontSize: 13, color: C.inkSoft }}>—</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {data.map((d) => (
            <div key={d.name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                <span>{d.name}</span>
                <span style={{ color: C.inkSoft }}>{d.count}</span>
              </div>
              <div style={{ background: C.neutral, borderRadius: 999, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${(d.count / max) * 100}%`, height: "100%", background: C.accent, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      )}
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
