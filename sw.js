// Menggunakan timestamp untuk versi cache yang unik dan selalu baru
const CACHE_NAME = `maka-rental-${Date.now()}`; 
const REPO_NAME = "/makarental"; // Pastikan nama repositori Anda benar!

// List file statis yang harus di-cache untuk offline access
const FILES_TO_CACHE = [
  `${REPO_NAME}/`,
  `${REPO_NAME}/index.html`,
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
  `${REPO_NAME}/icon-512.png`, // Asumsi ikon di root repo
  `${REPO_NAME}/1763947427555.jpg`, // Background
  
  // File JS/CSS Tambahan (Contoh dari folder Anda)
  `${REPO_NAME}/app.js`,
  `${REPO_NAME}/index.js`,
];


// 1. Instalasi: Menggunakan Promise.allSettled untuk mencegah instalasi total gagal
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("PWA: Memulai caching file aplikasi.");
      
      // Menggunakan allSettled: 1 file gagal, file lain tetap masuk
      return Promise.allSettled(
        FILES_TO_CACHE.map(file => cache.add(file))
      ).then(results => {
        results.forEach(result => {
          if (result.status === 'rejected') {
            console.warn(`PWA: Gagal mencache file: ${result.reason.url}`);
          }
        });
        console.log("PWA: Proses caching selesai. Lanjut aktivasi.");
      });
    })
  );
  self.skipWaiting(); 
});


// 2. Strategi Fetch: Network First, Cache Fallback (Solusi ANTI OFFLINE PALSU)
self.addEventListener("fetch", (evt) => {
    // Abaikan permintaan yang tidak menggunakan GET (seperti POST ke API)
    if (evt.request.method !== "GET") return; 
    
    // ABAIKAN jika request bukan HTTP/HTTPS (Misalnya Chrome extension)
    if (!evt.request.url.startsWith('http')) return;

    evt.respondWith(
        // 1. Coba ambil dari Network (Internet) DULU
        fetch(evt.request)
        .then((response) => {
            // Jika network berhasil, kembalikan response.
            // Kita kloning response agar bisa disimpan ke cache tanpa merusak yang asli.
            const responseToCache = response.clone();
            
            // Simpan response yang sukses ke cache untuk update versi
            caches.open(CACHE_NAME).then(cache => {
                cache.put(evt.request, responseToCache);
            });
            return response;
        })
        .catch(() => {
            // 2. Jika Network gagal (offline), coba ambil dari Cache
            return caches.match(evt.request);
        })
    );
});


// 3. Aktivasi: Menghapus cache lama (Script sudah benar)
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // Hanya hapus cache yang bukan versi terbaru
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
