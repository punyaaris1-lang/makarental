const Database = require('better-sqlite3');
const moment = require('moment');

const db = new Database('maka_rental_app.db');

const setupDatabase = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            nama_lengkap TEXT NOT NULL,
            tgl_mulai_sewa TEXT NOT NULL,  
            opsi_dp TEXT NOT NULL,        
            tarif_harian INTEGER NOT NULL,
            tgl_mulai_dp TEXT,            
            tgl_selesai_dp TEXT           
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS log_pembayaran (
            log_id INTEGER PRIMARY KEY,
            user_id INTEGER,
            tgl_pembayaran TEXT NOT NULL UNIQUE, 
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    `);
    
    console.log("[Setup] Database berhasil diinisiasi.");
};

const calculateDPCycle = (tglMulaiSewa) => {
    let tglMulaiDP = moment(tglMulaiSewa).add(1, 'month').startOf('month');
    let tglSelesaiDP = moment(tglMulaiDP).add(3, 'months').date(28);

    return {
        tgl_mulai_dp: tglMulaiDP.format('YYYY-MM-DD'),
        tgl_selesai_dp: tglSelesaiDP.format('YYYY-MM-DD')
    };
};

module.exports = { db, setupDatabase, calculateDPCycle };
