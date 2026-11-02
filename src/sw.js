// Service worker : l'app s'ouvre hors connexion une fois visitée.
// - la page (données comprises) : réseau d'abord, copie en cache en secours ;
// - icônes, d3 (cdnjs) et polices Google : cache d'abord, mis à jour en arrière-plan ;
// - images Wikimedia : non mises en cache (trop lourdes), elles s'affichent seulement en ligne.
const VERSION = "__BUILD_VERSION__";
const CACHE = "patrimoine-" + VERSION;
const CORE = ["./", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("patrimoine-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./", copy)); return res; })
      .catch(() => caches.match("./", { ignoreSearch: true })));
    return;
  }
  const sameOrigin = url.origin === self.location.origin;
  const cdn = url.host === "cdnjs.cloudflare.com" || url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com";
  if (!sameOrigin && !cdn) return;
  e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => {
    const net = fetch(req).then((res) => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
