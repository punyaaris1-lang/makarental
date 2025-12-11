// ================================
// PWA SERVICE WORKER MAKA RENTAL
// ================================
const REPO = "/makarental-main"; 
const CACHE_NAME = "maka-rental-v1"; 

const FILES_TO_CACHE = [
  `${REPO}/`,
  `${REPO}/index.html`,
  `${REPO}/dashboard.html`,
  `${REPO}/calendar.html`,
  `${REPO}/history.html`,
  `${REPO}/settings.html`,
  `${REPO}/daftar_antrian.html`,
  `${REPO}/lokasi_fc.html`,
  `${REPO}/maka_plus.html`,
  `${REPO}/admin_login.html`,

  // Assets
  `${REPO}/manifest.json`,
  `${REPO}/icon-512.png`,
  `${REPO}/1763947427555.jpg`,

  // Scripts
  `${REPO}/app.js`,
  `${REPO}/index.js`
];

// ================================
// INSTALL - CACHE FILE
// ================================
self.addEventListener("install", (e) => {
  console.log("[SW] Installing…");

  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app shell…");
      return Promise.allSettled(
        FILES_TO_CACHE.map(file => cache.add(file))
      );
    })
  );

  self.skipWaiting();
});


// ================================
// FETCH STRATEGY
// Network First, Cache Fallback
// ================================
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (!e.request.url.startsWith("http")) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Simpan ke cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, response.clone());
        });
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});


// ================================
// ACTIVATE - HAPUS CACHE LAMA
// ================================
self.addEventListener("activate", (e) => {
  console.log("[SW] Activating…");

  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Hapus cache lama:", key);
            return caches.delete(key);
          })
      );
    })
  );

  self.clients.claim();
});
