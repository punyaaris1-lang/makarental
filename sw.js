const CACHE_NAME = "maka-rental-v1.0.8"; // Versi cache terbaru
const FILES_TO_CACHE = [
  // Halaman Utama
  "./",
  "./index.html",
  "./dashboard.html",
  "./calendar.html",
  "./history.html",
  "./settings.html",
  "./daftar_antrian.html",
  
  // Halaman Menu (MLU)
  "./part_tracker.html",
  "./tips_maka.html",
  "./info_mlu.html",
  "./maka_plus.html",
  
  // Halaman Lokasi & SOS
  "./lokasi_fc.html",

  // Halaman Admin
  "./admin_login.html",
  "./admin_user.html",
  "./admin_finance.html",
  // Tambahkan admin_antrian.html jika Anda masih menggunakannya sebagai file terpisah
  
  // Assets & Audio (Wajib)
  "./1763947427555.jpg" // Gambar background Anda
  // Catatan: Audio file (white noise/siren) di-load dari URL eksternal, jadi tidak perlu di-cache di sini
];

// 1. Instalasi: Menyimpan semua file ke cache
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("PWA: Caching semua file aplikasi.");
      return cache.addAll(FILES_TO_CACHE).catch(error => {
        console.error('Failed to cache files:', error);
      });
    })
  );
  self.skipWaiting(); // Memaksa service worker baru untuk segera aktif
});

// 2. Strategi Cache: Mengambil dari cache (offline first)
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((res) => {
      // Jika ada di cache, pakai cache. Jika tidak, ambil dari network (internet).
      return res || fetch(evt.request);
    })
  );
});

// 3. Aktivasi: Menghapus cache lama
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('PWA: Menghapus cache lama:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Ambil alih kontrol klien yang ada
});
