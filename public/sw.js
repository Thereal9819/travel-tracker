// Travel Tracker — service worker
// Strategia: rende l'app installabile e utilizzabile offline con gli ultimi
// dati/asset visti. Non c'è un build-time manifest (niente Workbox): la cache
// si popola "al volo" mentre navighi online, e viene riusata quando sei offline.

const CACHE_VERSION = "tt-v2";
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.addAll(["/", "/manifest.webmanifest"]).catch(() => {})
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("tt-") && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSheetData = url.hostname.includes("docs.google.com") || url.hostname.includes("googleusercontent.com");
  const isNavigation = request.mode === "navigate";

  if (isSheetData) {
    // Dati live del foglio: prova la rete (dati aggiornati), se offline
    // usa l'ultima copia salvata in cache.
    event.respondWith(networkFirst(request));
    return;
  }

  if (isNavigation) {
    // Pagina dell'app: prova la rete, altrimenti serviamo la shell in cache.
    event.respondWith(networkFirst(request, "/"));
    return;
  }

  const isWorldMap = url.hostname === "cdn.jsdelivr.net";

  if (url.origin === self.location.origin || isWorldMap) {
    // Asset statici (JS/CSS/icone) e confini mondiali (non cambiano mai): cache-first.
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (fallbackUrl) {
      const shell = await cache.match(fallbackUrl);
      if (shell) return shell;
    }
    throw e;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    // Aggiorna la cache in background senza far aspettare l'utente.
    fetch(request).then((res) => { if (res && res.ok) cache.put(request, res); }).catch(() => {});
    return cached;
  }
  const fresh = await fetch(request);
  if (fresh && fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}
