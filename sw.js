const CACHE_NAME = "maka-rental-v1.1.2"; // VERSI DITINGKATKAN LAGI
const REPO_NAME = "/makarental"; // Pastikan ini benar

const FILES_TO_CACHE = [
  // Path UTAMA
  `${REPO_NAME}/`,
  `${REPO_NAME}/index.html`,
  
  // Halaman Aplikasi
  `${REPO_NAME}/dashboard.html`,
  `${REPO_NAME}/calendar.html`,
  `${REPO_NAME}/history.html`,
  `${REPO_NAME}/settings.html`,
  `${REPO_NAME}/daftar_antrian.html`,
  `${REPO_NAME}/lokasi_fc.html`,
  
  // Files yang ADA di folder Anda
  `${REPO_NAME}/icon-512.png`, 
  `${REPO_NAME}/manifest.json`,
  `${REPO_NAME}/1763947427555.jpg`,
  
  // Pastikan file CSS/JS yang tidak terpisah sudah tercover (jika ada)
  `${REPO_NAME}/app.js`,
  `${REPO_NAME}/index.js`,
  // ... Tambahkan file CSS/JS lain jika ada link eksternal di HTML.
];

// 1. Instalasi: Menyimpan semua file ke cache
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("PWA: Caching semua file aplikasi.");
      return cache.addAll(FILES_TO_CACHE).catch(error => {
        // Ini akan menangkap error jika path salah
        console.error('PWA ERROR: Gagal mencache file. Cek nama file di atas!', error);
      });
    })
  );
  self.skipWaiting(); 
});

// 2. Strategi Cache: Cache First, Network Fallback
self.addEventListener("fetch", (evt) => {
    // Abaikan requests eksternal (Firebase SDK, Fonts)
    if (evt.request.url.startsWith('http') && !evt.request.url.startsWith(self.location.origin)) return;

    // Untuk semua file internal, coba dari Cache dulu
    evt.respondWith(
        caches.match(evt.request).then((response) => {
            // Jika ada di cache, langsung kembalikan
            if (response) {
                return response;
            }
            // Jika tidak ada di cache, coba dari network (Internet)
            return fetch(evt.request);
        }).catch(() => {
            // Jika cache dan network gagal (offline), bisa kembalikan halaman offline khusus
            // Di sini kita biarkan browser menampilkan error koneksi.
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
                       
