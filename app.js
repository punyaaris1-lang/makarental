/***********************
 * MAKA RENTAL APP CORE
 ***********************/

const DB_KEY = 'MAKA_DB_V1';

const DEFAULT_DB = {
  users: [
    {
      id: 'USR001',
      nama: 'USER DEMO',
      plat: 'B 1234 XYZ',
      startDate: '2025-09-18', // tgl ambil motor

      dpType: '355', // '355' | '755'
      dpPaidCount: 0, // max 6 (70rb x 6)

      makaPlus: {
        active: false,
        activatedAt: null
      },

      payments: {
        // '2025-09-19': { paid:true, amount:70000 }
      },

      freeParts: []
    }
  ],

  config: {
    baseDaily: 70000,
    makaPlusDaily: 10000
  },

  activeUserId: 'USR001'
};

/* INIT */
function loadDB() {
  return JSON.parse(localStorage.getItem(DB_KEY)) || DEFAULT_DB;
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
  return d.toISOString().slice(0,10);
}

/* USER */
function getActiveUser(){
  return DB.users.find(u=>u.id===DB.activeUserId);
}

/* MAKA PLUS */
function isMakaPlusActive(user, dateStr){
  if(!user.makaPlus.active) return false;
  const d = new Date(dateStr);
  const act = new Date(user.makaPlus.activatedAt);
  act.setDate(act.getDate()+1); // H+1
  return d >= act;
}

/* DP LOGIC */
function dpHolidayBlocked(user){
  if(user.dpType==='355' && user.dpPaidCount < 6){
    return ['14','28']; // blm libur
  }
  return [];
}

/* HOLIDAY */
function isHoliday(user, dateStr){
  const d = new Date(dateStr);
  const day = d.getDate().toString();

  if(day === '31') return true;

  if(user.dpType === '755'){
    if(day==='14'||day==='28') return true;
  }

  if(dpHolidayBlocked(user).includes(day)) return false;
  if(day==='14'||day==='28') return true;

  return false;
}

/* DAILY RATE */
function getDailyRate(user, dateStr){
  if(isHoliday(user, dateStr)) return 0;

  let rate = DB.config.baseDaily;

  if(isMakaPlusActive(user, dateStr)){
    rate += DB.config.makaPlusDaily;
  }

  return rate;
}

/* TAGIHAN TOTAL */
function getTotalBillUntilToday(user){
  const start = new Date(user.startDate);
  start.setDate(start.getDate()+1); // H+1 mulai tagihan

  let total = 0;
  const today = new Date();

  for(let d=new Date(start); d<=today; d.setDate(d.getDate()+1)){
    const ds = dateOnly(d);
    if(user.payments[ds]?.paid) continue;
    total += getDailyRate(user, ds);
  }
  return total;
}

/* PAY */
function payDate(user, dateStr){
  const rate = getDailyRate(user, dateStr);
  if(rate===0) return;

  user.payments[dateStr] = {
    paid:true,
    amount:rate
  };

  if(user.dpType==='355' && (new Date(dateStr).getDate()==14 || new Date(dateStr).getDate()==28)){
    if(user.dpPaidCount < 6){
      user.dpPaidCount++;
    }
  }

  saveDB(DB);
}
