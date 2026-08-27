// Calcolo puro della dimensione del puntino Milestone sulla Mappa 3D, in
// base all'altitudine della fotocamera. Vive in un file separato (invece
// di restare inline in Globe3D.jsx) per poter essere testato senza dover
// montare un componente React/Three.js.

export const FAR_ALTITUDE = 2.5;
export const MIN_DOT_SIZE = 6;
export const MAX_DOT_SIZE = 14;

// altitude: altitudine attuale della fotocamera (react-globe.gl).
// nearAltitude: altitudine alla quale il puntino raggiunge MAX_DOT_SIZE
//   (nel chiamante coincide con ZOOM_EMOJI_THRESHOLD di Globe3D.jsx).
// Ritorna la dimensione in px, sempre compresa tra MIN_DOT_SIZE e
// MAX_DOT_SIZE inclusi, anche se altitude esce dall'intervallo
// [nearAltitude, FAR_ALTITUDE] in una direzione o nell'altra.
export function dotSizeForAltitude(altitude, nearAltitude) {
  if (!Number.isFinite(altitude)) return MIN_DOT_SIZE;
  const range = FAR_ALTITUDE - nearAltitude;
  const t = range === 0 ? 1 : (FAR_ALTITUDE - altitude) / range;
  const clamped = Math.min(1, Math.max(0, t));
  return MIN_DOT_SIZE + (MAX_DOT_SIZE - MIN_DOT_SIZE) * clamped;
}
