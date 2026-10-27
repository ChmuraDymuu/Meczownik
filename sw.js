// Meczownik – service worker: aplikacja działa offline, dane zawsze najpierw z sieci
const CACHE = "meczownik-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // sieć najpierw, przy braku sieci – ostatnia zapisana wersja
  // cache:"no-cache" — zawsze pytaj serwer o nowszą wersję (omija 10-minutowy cache przeglądarki)
  e.respondWith(fetch(e.request.url, {cache: "no-cache"}).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request.url.split("?")[0], copy)); return r; })
    .catch(() => caches.match(e.request.url.split("?")[0]).then(r => r || caches.match("index.html"))));
});
