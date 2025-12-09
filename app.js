/***********************
 * MAKA RENTAL APP CORE (REVISI LOGIKA 3 BULAN)
 ***********************/

const DB_KEY = 'MAKA_DB_V1';

const DEFAULT_DB = {
  users: [
    {
      id: 'USR001',
      nama: 'USER DEMO',
      plat: 'B 1234 XYZ',
      startDate: '2025-09-01', // tgl ambil motor
      progressHari: 0, // Total hari yang sudah dibayar (Maks 1009)

      dpType: '355', // '355' | '755'
      
      makaPlus: {
        active: false,
        activatedAt: '2025-10-15' // Contoh tanggal dapat MAKA+
      },

      payments: {
        // '2025-09-02': { paid:true, amount:70000, type: 'harian' }
        // '2025-10-14': { paid:true, amount:70000, type: 'cicil_dp' }
      },

      freeParts: []
    }
  ],

  config: {
    baseDaily: 70000,
    makaPlusDaily: 10000,
    totalRentalDays: 1009
  },

  activeUserId: 'USR001'
};

/* INIT */
function loadDB() {
  const stored = JSON.parse(localStorage.getItem(DB_KEY));
  if (stored) {
    // Pastikan progressHari ada, jika tidak, inisialisasi
    stored.users.forEach(u => u.progressHari = u.progressHari || 0);
  }
  return stored || DEFAULT_DB;
}
function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const DB = loadDB();

/* UTIL */
function formatIDR(n){
  return 'Rp ' + n.toLocaleString('id-ID');
}
function dateOnly(d){
  // Memastikan output selalu YYYY-MM-DD
  return d.toISOString().slice(0,10);
}
function getActiveUser(){
  return DB.users.find(u=>u.id===DB.activeUserId);
}

// ================= LOGIC RTO UTAMA =================

/* DP LOGIC */
function getDPCicilStatus(user, dateStr) {
  if (user.dpType !== '355') return { isDP: false, isLibur: false, isCicilDay: false };

  const d = new Date(dateStr);
  const startDate = new Date(user.startDate);
  
  // Tanggal ambil motor (misal 1 Sept)
  // Cicilan DP dimulai bulan berikutnya (misal 1 Okt)
  const dpStart = new Date(startDate);
  dpStart.setMonth(dpStart.getMonth() + 1); 
  dpStart.setDate(1); // Mulai tgl 1 bulan berikutnya
  
  // Akhir 3 bulan cicilan (misal Sept ambil, Cicilan Okt, Nov, Des)
  const dpEnd = new Date(startDate);
  dpEnd.setMonth(dpEnd.getMonth() + 4); 
  dpEnd.setDate(0); // Akhir bulan ketiga

  const isWithin3Months = d >= dpStart && d <= dpEnd;
  const day = d.getDate();

  if (isWithin3Months) {
    if (day === 14 || day === 28) {
      // Selama 3 bulan, tgl 14 & 28 adalah Hari Cicilan DP
      return { isDP: true, isLibur: false, isCicilDay: true };
    }
    // Tgl 31 tetap Libur Sewa Harian
    return { isDP: false, isLibur: (day === 31), isCicilDay: false };
  } 
  
  // Setelah 3 bulan, tidak ada lagi status DP Cicil
  return { isDP: false, isLibur: false, isCicilDay: false };
}

/* MAKA PLUS */
function isMakaPlusActive(user, dateStr){
  if(!user.makaPlus.active || !user.makaPlus.activatedAt) return false;
  const d = new Date(dateStr);
  const act = new Date(user.makaPlus.activatedAt);
  
  // Tagihan Maka+ dimulai H+1
  act.setDate(act.getDate() + 1); 
  
  // Hapus jam, menit, detik untuk perbandingan yang adil
  d.setHours(0,0,0,0);
  act.setHours(0,0,0,0);

  return d >= act;
}

/* HOLIDAY */
function isHoliday(user, dateStr){
  const d = new Date(dateStr);
  const day = d.getDate();

  // 1. Cek Libur Tgl 31 (Aturan tetap)
  if (day === 31) return true;

  // 2. Cek Logic DP Cicil (355rb)
  if (user.dpType === '355') {
      const dpStatus = getDPCicilStatus(user, dateStr);
      if (dpStatus.isLibur) return true; // Libur Tgl 31 di masa cicil
      if (dpStatus.isCicilDay) return false; // Tgl 14/28 saat cicil BUKAN libur sewa harian
      
      // Jika sudah melewati masa 3 bulan cicil, maka berlaku aturan normal 755
      if (!dpStatus.isWithin3Months) {
        if (day === 14 || day === 28) return true;
      }
  }

  // 3. Cek DP Lunas (755rb)
  if (user.dpType === '755') {
    if (day === 14 || day === 28) return true;
  }

  return false;
}

/* DAILY RATE */
function getDailyRate(user, dateStr){
  // Jika hari libur, tarif harian sewa 0
  if(isHoliday(user, dateStr)) return 0;

  let rate = DB.config.baseDaily; // 70.000

  // Jika hari Cicilan DP (hanya 355rb), tarif harian sewa tetap 70.000
  // Karena user membayar cicilan DP terpisah (70rb x 2/bln)
  
  // Cek Maka Plus
  if(isMakaPlusActive(user, dateStr)){
    rate += DB.config.makaPlusDaily; // + 10.000
  }

  return rate;
}

/* TAGIHAN TOTAL (Tunggakan) */
function getTotalTunggakan(user){
  // Tagihan dimulai H+1 setelah ambil motor
  const start = new Date(user.startDate);
  start.setDate(start.getDate()+1); 

  let totalNominal = 0;
  let totalHari = 0;
  const today = new Date();
  today.setHours(0,0,0,0);

  for(let d=new Date(start); d<today; d.setDate(d.getDate()+1)){
    const ds = dateOnly(d);
    
    // Jangan hitung jika sudah dibayar
    if(user.payments[ds]?.paid) continue;
    
    // Jangan hitung jika hari Libur
    const rate = getDailyRate(user, ds);
    if (rate > 0) {
        totalNominal += rate;
        totalHari += 1;
    }
  }
  return { nominal: totalNominal, hari: totalHari };
}


/* PEMBAYARAN: Mark Paid */
function markPaid(user, dateStr){
  const rate = getDailyRate(user, dateStr);
  if(rate===0) return; // Tidak bisa bayar di hari Libur Sewa Harian

  user.payments[dateStr] = {
    paid: true,
    amount: rate,
    type: getDPCicilStatus(user, dateStr).isCicilDay ? 'cicil_dp' : 'harian',
    paidAt: new Date().toISOString()
  };
  
  // Update total hari yang sudah dibayar (Progress Bar)
  user.progressHari += 1;

  saveDB(DB);
}

// Panggil fungsi-fungsi ini di file lain
// Contoh: Dashboard.html memanggil getTotalTunggakan(user)
// Calendar.html memanggil markPaid(user, dateStr)
