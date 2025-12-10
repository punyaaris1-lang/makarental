const CACHE_NAME = "maka-rental-v1.1.1"; // Versi cache DITINGKATKAN
const REPO_NAME = "/makarental"; // Nama repositori Anda

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
  `${REPO_NAME}/1763947427555.jpg`,
  `${REPO_NAME}/manifest.json` // Tambahkan manifest agar terjamin di-cache
];

// 1. Instalasi: Menyimpan semua file ke cache
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("PWA: Caching semua file aplikasi.");
      return cache.addAll(FILES_TO_CACHE).catch(error => {
        // Jika ada error di sini, berarti file hilang atau path salah
        console.error('PWA ERROR: Gagal mencache file. Cek nama file di atas!', error);
      });
    })
  );
  self.skipWaiting(); 
});

// 2. Strategi Cache: Mengambil dari cache (offline first)
self.addEventListener("fetch", (evt) => {
  // Hanya melayani permintaan dari cache untuk file-file statis yang kita butuhkan
  if (FILES_TO_CACHE.includes(new URL(evt.request.url).pathname)) {
      evt.respondWith(
          caches.match(evt.request).then((res) => {
              return res || fetch(evt.request);
          })
      );
  }
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
