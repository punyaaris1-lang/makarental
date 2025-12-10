const CACHE_NAME = "maka-rental-v1.1.0"; // Versi cache ditingkatkan
const REPO_NAME = "/makarental"; // <<< SUDAH DIGANTI DENGAN NAMA REPO ANDA

const FILES_TO_CACHE = [
  // Path UTAMA harus menggunakan nama repositori
  `${REPO_NAME}/`,
  `${REPO_NAME}/index.html`,
  
  // Halaman Aplikasi
  `${REPO_NAME}/dashboard.html`,
  `${REPO_NAME}/calendar.html`,
  `${REPO_NAME}/history.html`,
  `${REPO_NAME}/settings.html`,
  `${REPO_NAME}/daftar_antrian.html`,
  
  // Halaman Menu & Admin
  `${REPO_NAME}/part_tracker.html`,
  `${REPO_NAME}/tips_maka.html`,
  `${REPO_NAME}/info_mlu.html`,
  `${REPO_NAME}/maka_plus.html`,
  `${REPO_NAME}/lokasi_fc.html`,
  `${REPO_NAME}/admin_login.html`,
  `${REPO_NAME}/admin_user.html`,
  `${REPO_NAME}/admin_finance.html`,
  
  // Assets
  `${REPO_NAME}/1763947427555.jpg`
];

// 1. Instalasi: Menyimpan semua file ke cache
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("PWA: Caching semua file aplikasi.");
      return cache.addAll(FILES_TO_CACHE).catch(error => {
        console.error('PWA ERROR: Gagal mencache file. Pastikan nama file di atas sudah benar.', error);
      });
    })
  );
  self.skipWaiting(); 
});

// 2. Strategi Cache: Mengambil dari cache (offline first)
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((res) => {
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
  self.clients.claim();
});
