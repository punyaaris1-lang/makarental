// --- PERBAIKAN: Gunakan path relatif. Asumsi semua file PWA di-deploy di root PWA ---
const CACHE_NAME = `maka-rental-v20251211`; // Gunakan tanggal/versi tetap
// const REPO_NAME = "/makarental"; // Hapus atau jadikan "" jika PWA di-deploy di root domain
const REPO_NAME = ""; // Diganti menjadi kosong untuk path yang lebih universal

// List file statis yang harus di-cache untuk offline access
const FILES_TO_CACHE = [
  // Halaman utama (root)
  `${REPO_NAME}/`, 
  `${REPO_NAME}/index.html`,
  
  // Halaman lain
  `${REPO_NAME}/dashboard.html`,
  `${REPO_NAME}/calendar.html`,
  `${REPO_NAME}/history.html`,
  `${REPO_NAME}/settings.html`,
  `${REPO_NAME}/daftar_antrian.html`,
  `${REPO_NAME}/lokasi_fc.html`,
  `${REPO_NAME}/maka_plus.html`,
  `${REPO_NAME}/admin_login.html`,
  
  // Assets dan Manifest
  `${REPO_NAME}/manifest.json`,
  `${REPO_NAME}/icon-512.png`, 
  `${REPO_NAME}/1763947427555.jpg`, // Background
  
  // File JS/CSS Tambahan
  `${REPO_NAME}/app.js`,
  `${REPO_NAME}/index.js`,
  `${REPO_NAME}/sw.js`, // Meng-cache service worker itu sendiri
];


// 1. Instalasi (Tidak ada perubahan mendasar, logika allSettled sudah bagus)
self.addEventListener("install", (evt) => {
// ... kode install tetap sama
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("PWA: Memulai caching file aplikasi.");
      return Promise.allSettled(
        FILES_TO_CACHE.map(file => {
          // Normalisasi path jika menggunakan REPO_NAME
          const path = file.startsWith('/') ? file : `${file}`;
          return cache.add(path);
        })
      ).then(results => {
        results.forEach(result => {
          if (result.status === 'rejected') {
            console.warn(`PWA: Gagal mencache file: ${result.reason.url || result.reason}`);
          }
        });
        console.log("PWA: Proses caching selesai. Lanjut aktivasi.");
      });
    })
  );
  self.skipWaiting(); 
});


// 2. Strategi Fetch: Tetap Network First, Cache Fallback.
// ... kode fetch tetap sama
self.addEventListener("fetch", (evt) => {
// ...
// Kode di bawah ini sudah bagus untuk Network First, Cache Fallback
// ...
    if (evt.request.method !== "GET") return; 
    if (!evt.request.url.startsWith('http')) return;

    evt.respondWith(
        fetch(evt.request)
        .then((response) => {
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME).then(cache => {
                cache.put(evt.request, responseToCache);
            });
            return response;
        })
        .catch(() => {
            // Jika Network gagal, coba ambil dari Cache
            return caches.match(evt.request);
        })
    );
});


// 3. Aktivasi (Tidak ada perubahan mendasar)
// ... kode activate tetap sama
self.addEventListener("activate", (evt) => {
// ...
});
