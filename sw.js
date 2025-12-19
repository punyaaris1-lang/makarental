const CACHE_NAME = 'maka-v4-force-reset'; // Ganti versi biar browser sadar ada baru
const urlsToCache = [
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
  './daftar_antrian.html'
];

// 1. Install & Paksa Browser Pakai File Baru
self.addEventListener('install', event => {
  self.skipWaiting(); // PENTING: Langsung aktifkan SW baru
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 2. Hapus Cache Lama (File Sampah)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Ambil alih semua halaman segera
});

// 3. Strategi Network First (Cek Internet Dulu, Baru Cache)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
