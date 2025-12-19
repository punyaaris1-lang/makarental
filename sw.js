const CACHE_NAME = 'maka-app-v3-force-update'; // Ganti nama cache agar browser reset
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './calendar.html',
  './history.html',
  './settings.html',
  './part_tracker.html',
  './info_mlu.html',
  './tips_maka.html',
  './maka_plus.html',
  './lokasi_fc.html',
  './daftar_antrian.html' // Pastikan file ini ada atau hapus baris ini
];

// INSTALL: Cache file baru
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Paksa update segera
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ACTIVATE: Hapus cache lama
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim(); // Ambil alih kontrol halaman segera
});

// FETCH: Network First (Utamakan internet, baru cache)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});
