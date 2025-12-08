const moment = require('moment');
const { db, setupDatabase, calculateDPCycle } = require('./src/data/db');
const RentalCalculator = require('./src/logic/RentalCalculator');

// --- FUNGSI UTAMA APP ---

const registerUser = (data) => {
    let dpDates = { tgl_mulai_dp: null, tgl_selesai_dp: null };
    if (data.opsi_dp === '355') {
        dpDates = calculateDPCycle(data.tgl_mulai_sewa);
    }

    const insert = db.prepare(`
        INSERT INTO users (nama_lengkap, tgl_mulai_sewa, opsi_dp, tarif_harian, tgl_mulai_dp, tgl_selesai_dp) 
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = insert.run(
        data.nama_lengkap, data.tgl_mulai_sewa, data.opsi_dp, data.tarif_harian, 
        dpDates.tgl_mulai_dp, dpDates.tgl_selesai_dp
    );

    console.log(`\n[DAFTAR] ✅ User ${data.nama_lengkap} berhasil didaftarkan.`);
    return db.prepare('SELECT * FROM users WHERE user_id = ?').get(info.lastInsertRowid);
};

const recordPayment = (userId, tglPembayaran, keterangan = 'QRIS Transaction') => {
    try {
        const insert = db.prepare(`
            INSERT INTO log_pembayaran (user_id, tgl_pembayaran, keterangan) 
            VALUES (?, ?, ?)
        `);
        insert.run(userId, tglPembayaran, keterangan);
    } catch (e) {
        // Tanggal sudah ada, diabaikan.
    }
};

const initExternalFeatures = () => {
    console.log("\n--- SIMULASI TOMBOL FITUR EKSTERNAL ---");
    console.log(`[SOS CHAT] 📞 Membuka: whatsapp://send?phone=6287722285445`);
    console.log(`[Cek ETLE] 🚨 Membuka: https://etle-pmj.info/`);
    console.log(`[FC Location] ⚡ Memuat data peta lokal.`);
};


// ======== RUN APLIKASI ========

const runSimulation = () => {
    setupDatabase(); 

    // A. DATA PENGGUNA (Parameter Anda)
    const user1Data = registerUser({
        nama_lengkap: "Adi Wijaya",
        tgl_mulai_sewa: "2025-11-18",
        opsi_dp: "355",
        tarif_harian: 80000 
    });
    const userId = user1Data.user_id;

    // B. SIMULASI PEMBAYARAN: Dibayar dari 18 Nov - 3 Des (Tunggakan mulai 4 Des)
    console.log("\n[PEMBAYARAN] Mencatat pembayaran 18 Nov - 3 Des...");
    let tgl = moment("2025-11-18");
    const tglTerbayarAkhir = moment("2025-12-03");

    while (tgl.isSameOrBefore(tglTerbayarAkhir)) {
        recordPayment(userId, tgl.format('YYYY-MM-DD'));
        tgl.add(1, 'day');
    }
    
    // C. REKAP DASHBOARD
    const hariIni = moment("2025-12-07"); 
    console.log(`\n==============================================`);
    console.log(` DASHBOARD REKAP (Simulasi Tgl: ${hariIni.format('YYYY-MM-DD')})`);
    console.log(`==============================================`);

    const calculator = new RentalCalculator(user1Data);
    const rekap = calculator.calculateOutstanding(hariIni);

    console.log(`Status Hari Ini (${hariIni.format('YYYY-MM-DD')}): ${calculator.getDayStatus(hariIni)}`);
    console.log(`\n>>> HASIL REKAP TUNGGAKAN <<<`);
    console.log(`Total Hari Tertunggak: ${rekap.tunggakan_hari} hari`);
    console.log(`Total Nominal Tunggakan: Rp ${rekap.tunggakan_nominal.toLocaleString('id-ID')}`);
    console.log(`\n==============================================`);
    
    // D. FITUR EKSTERNAL
    initExternalFeatures();
};

runSimulation();
