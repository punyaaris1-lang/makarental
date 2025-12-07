const moment = require('moment');
const { db } = require('../data/db');

class RentalCalculator {
    constructor(userData) {
        this.user = userData;
        this.tarif = userData.tarif_harian;
        this.opsiDP = userData.opsi_dp;
        this.mulaiSewa = moment(userData.tgl_mulai_sewa);
        this.mulaiDP = userData.tgl_mulai_dp ? moment(userData.tgl_mulai_dp) : null;
        this.selesaiDP = userData.tgl_selesai_dp ? moment(userData.tgl_selesai_dp) : null;
    }

    getDayStatus(tanggal) {
        const D = moment(tanggal);
        const dayOfMonth = D.date();

        // 1. ATURAN TETAP: HARI LIBUR TGL 31
        if (dayOfMonth === 31) {
            return 'HLB'; 
        }

        // Cek hanya jika opsi DP adalah 355rb
        if (this.opsiDP === '355' && this.mulaiDP && this.selesaiDP) {
            
            // 2. ATURAN CICILAN DP (CDP)
            if (D.isBetween(this.mulaiDP, this.selesaiDP, 'days', '[]')) {
                
                if (dayOfMonth === 14 || dayOfMonth === 28) {
                    return 'CDP'; // Cicilan DP (Libur Sewa Harian)
                }
            }
        }

        // 3. ATURAN DEFAULT: HARI WAJIB BAYAR (HWB)
        return 'HWB';
    }

    calculateOutstanding(hariIni = moment()) {
        let totalTunggakan = 0;
        let totalHariTunggak = 0;
        
        const paidLogs = db.prepare('SELECT tgl_pembayaran FROM log_pembayaran WHERE user_id = ?').all(this.user.user_id);
        const paidDates = new Set(paidLogs.map(log => log.tgl_pembayaran));

        let currentDay = moment(this.mulaiSewa);
        
        while (currentDay.isSameOrBefore(hariIni, 'day')) {
            const dateStr = currentDay.format('YYYY-MM-DD');
            const status = this.getDayStatus(currentDay);
            
            if (status === 'HWB') {
                if (!paidDates.has(dateStr)) {
                    totalTunggakan += this.tarif;
                    totalHariTunggak += 1;
                }
            }
            
            currentDay.add(1, 'day');
        }
        
        return {
            tunggakanNominal: totalTunggakan,
            tunggakanHari: totalHariTunggak
        };
    }
}

module.exports = RentalCalculator;
