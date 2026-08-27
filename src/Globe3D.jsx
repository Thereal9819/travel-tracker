import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import * as THREE from "three";
import { COUNTRY_META, a3FromGeo } from "./countries.js";
import { MILESTONE_EMOJIS, DEFAULT_MILESTONE_EMOJI } from "./milestoneEmojis.js";

const BG = "#0d1b2a";
const LINE = "#0d1b2a";
const ACCENT = "#5bc0be";
const MILESTONE_RED = "#ef4444";
const NEUTRAL = "#2a4258";
const VISITED = "#f4a259";
const VISITED_MID = "#f28c3a";
const VISITED_HOT = "#e76f51";

// Altitudine della fotocamera (react-globe.gl) sotto la quale il puntino
// di una Milestone si trasforma nella sua emoji. Valore di partenza da
// verificare/aggiustare a occhio: più basso = bisogna zoomare di più
// prima che appaia l'emoji.
const ZOOM_EMOJI_THRESHOLD = 0.6;

function heatColor(count) {
  if (count >= 3) return VISITED_HOT;
  if (count === 2) return VISITED_MID;
  return VISITED;
}

export default function Globe3D({ geoData, byCountry, heatmap, selected, onSelect, onHover, milestones }) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 600, height: 460 });
  const [cameraAltitude, setCameraAltitude] = useState(2.5);

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

  // Traccia l'altitudine della fotocamera per decidere quando mostrare
  // l'emoji al posto del pallino sulle Milestone. Usa setTimeout (non
  // requestAnimationFrame) per il throttle: in alcuni ambienti browser
  // sandboxed usati per verificare questo progetto, i callback rAF non
  // vengono eseguiti in modo affidabile.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    if (!controls) return;

    const THROTTLE_MS = 100;
    let lastRun = 0;
    let pendingTimeout = null;

    const readAltitude = () => {
      lastRun = Date.now();
      pendingTimeout = null;
      setCameraAltitude(globe.pointOfView().altitude);
    };

    const handleChange = () => {
      const elapsed = Date.now() - lastRun;
      if (elapsed >= THROTTLE_MS) {
        readAltitude();
      } else if (!pendingTimeout) {
        pendingTimeout = setTimeout(readAltitude, THROTTLE_MS - elapsed);
      }
    };

    handleChange(); // valore iniziale, non solo al primo movimento
    // Forza un ricalcolo iniziale della visibilità degli elementi HTML
    // (three-globe/CSS2DRenderer la aggiorna solo dentro l'evento "change"
    // dei controlli, mai automaticamente al mount) — altrimenti il
    // puntino/emoji della Milestone resta invisibile finché l'utente non
    // interagisce almeno una volta col globo. Ripassare il valore attuale
    // della camera è un no-op visivo (nessun movimento reale, durata 0),
    // serve solo a far scattare quel ricalcolo interno.
    globe.pointOfView(globe.pointOfView(), 0);
    controls.addEventListener("change", handleChange);
    return () => {
      controls.removeEventListener("change", handleChange);
      if (pendingTimeout) clearTimeout(pendingTimeout);
    };
  }, []);

  // Applica/rimuove la classe che fa scattare il CSS dot↔emoji per tutti
  // i marcatori Milestone in una volta sola.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.classList.toggle("gl-zoomed-in", cameraAltitude < ZOOM_EMOJI_THRESHOLD);
  }, [cameraAltitude]);

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
    const a3 = a3FromGeo(polygon);
    return a3 && a3 === selected ? ACCENT : LINE;
  }, [selected]);

  const sideColor = useMemo(() => () => "rgba(13,27,42,0.6)", []);

  const showPointerCursor = useCallback((objType, d) => {
    if (objType !== "polygon") return false;
    const a3 = a3FromGeo(d);
    return !!(a3 && byCountry[a3]?.length);
  }, [byCountry]);

  const milestoneElement = useCallback((d) => {
    const el = document.createElement("div");
    el.className = "milestone-marker";
    el.style.pointerEvents = "auto";
    el.style.cursor = "default";

    const dot = document.createElement("div");
    dot.className = "milestone-marker-dot";

    const emoji = document.createElement("div");
    emoji.className = "milestone-marker-emoji";
    emoji.textContent = MILESTONE_EMOJIS[d.id] || DEFAULT_MILESTONE_EMOJI;

    el.appendChild(dot);
    el.appendChild(emoji);

    el.addEventListener("mouseenter", () => {
      onHover({ name: d.name, kind: "milestone", ...posRef.current });
    });
    el.addEventListener("mouseleave", () => onHover(null));

    // Il layer HTML (CSS2DRenderer) su cui vive questo elemento ha
    // pointer-events: none di default, quindi normalmente gli eventi
    // del mouse "passano attraverso" fino al canvas WebGL sottostante,
    // dove OrbitControls gestisce zoom/drag. Abbiamo riattivato
    // pointer-events sopra (per il tooltip in hover), ma questo crea
    // una "zona morta": il canvas è un fratello DOM del layer HTML, non
    // un antenato, quindi un evento wheel/drag che atterra qui non lo
    // raggiunge più da solo. Lo inoltriamo manualmente al canvas.
    const forwardToCanvas = (e) => {
      const canvas = containerRef.current?.querySelector("canvas");
      if (!canvas) return;
      canvas.dispatchEvent(new WheelEvent(e.type, e));
    };
    el.addEventListener("wheel", forwardToCanvas, { passive: true });

    return el;
  }, [onHover]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
      onMouseMove={(e) => { posRef.current = { x: e.clientX, y: e.clientY }; }}
      onMouseLeave={() => onHover(null)}
    >
      <Globe
        ref={globeRef}
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
        htmlElementsData={milestones || []}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.01}
        htmlElement={milestoneElement}
        htmlTransitionDuration={0}
      />
      <style>{`
        .milestone-marker-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${MILESTONE_RED};
          box-shadow: 0 0 4px rgba(239, 68, 68, 0.8);
        }
        .milestone-marker-emoji {
          display: none;
          font-size: 22px;
          line-height: 1;
          filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.6));
        }
        .gl-zoomed-in .milestone-marker-dot { display: none; }
        .gl-zoomed-in .milestone-marker-emoji { display: block; }
      `}</style>
    </div>
  );
}
