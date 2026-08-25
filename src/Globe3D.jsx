import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import * as THREE from "three";
import { COUNTRY_META, a3FromGeo } from "./countries.js";

const BG = "#0d1b2a";
const LINE = "#26415c";
const ACCENT = "#5bc0be";
const NEUTRAL = "#2a4258";
const VISITED = "#f4a259";
const VISITED_MID = "#f28c3a";
const VISITED_HOT = "#e76f51";

function heatColor(count) {
  if (count >= 3) return VISITED_HOT;
  if (count === 2) return VISITED_MID;
  return VISITED;
}

export default function Globe3D({ geoData, byCountry, heatmap, selected, onSelect, onHover, milestones }) {
  const containerRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 600, height: 460 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setSize({ width: Math.max(280, w), height: Math.max(360, Math.min(520, w * 0.72)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Evita che il tooltip resti visibile dopo lo smontaggio del componente.
  useEffect(() => () => onHover(null), []);

  const countries = useMemo(() => {
    if (!geoData) return [];
    return feature(geoData, geoData.objects.countries).features;
  }, [geoData]);

  const globeMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({ color: new THREE.Color(BG) }),
    []
  );

  const colorFor = useCallback((polygon) => {
    const a3 = a3FromGeo(polygon);
    const visits = a3 ? byCountry[a3]?.length || 0 : 0;
    if (visits === 0) return NEUTRAL;
    return heatmap ? heatColor(visits) : VISITED;
  }, [byCountry, heatmap]);

  const strokeFor = useCallback((polygon) => {
    return a3FromGeo(polygon) === selected ? ACCENT : LINE;
  }, [selected]);

  const sideColor = useMemo(() => () => "rgba(13,27,42,0.6)", []);

  const showPointerCursor = useCallback((objType, d) => {
    if (objType !== "polygon") return false;
    const a3 = a3FromGeo(d);
    return !!(a3 && byCountry[a3]?.length);
  }, [byCountry]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
      onMouseMove={(e) => { posRef.current = { x: e.clientX, y: e.clientY }; }}
      onMouseLeave={() => onHover(null)}
    >
      <Globe
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial}
        showAtmosphere
        atmosphereColor={ACCENT}
        atmosphereAltitude={0.2}
        polygonsData={countries}
        polygonAltitude={0.008}
        polygonCapColor={colorFor}
        polygonSideColor={sideColor}
        polygonStrokeColor={strokeFor}
        polygonsTransitionDuration={200}
        showPointerCursor={showPointerCursor}
        onPolygonClick={(polygon) => {
          const a3 = a3FromGeo(polygon);
          if (a3 && byCountry[a3]?.length) onSelect(a3);
        }}
        onPolygonHover={(polygon) => {
          if (!polygon) { onHover(null); return; }
          const a3 = a3FromGeo(polygon);
          const visits = a3 ? byCountry[a3]?.length || 0 : 0;
          const name = a3 ? COUNTRY_META[a3]?.name || polygon.properties?.name : polygon.properties?.name;
          onHover({ name, count: visits, ...posRef.current });
        }}
        pointsData={milestones || []}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => ACCENT}
        pointRadius={0.35}
        pointAltitude={0.01}
        onPointHover={(point) => {
          if (!point) { onHover(null); return; }
          onHover({ name: point.name, kind: "milestone", ...posRef.current });
        }}
      />
    </div>
  );
}
