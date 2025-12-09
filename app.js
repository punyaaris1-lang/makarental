<script>
/* ================= DATABASE ================= */
const DB = {
  get users(){
    return JSON.parse(localStorage.getItem("maka_users") || "[]");
  },
  set users(val){
    localStorage.setItem("maka_users", JSON.stringify(val));
  },
  get activeUser(){
    return JSON.parse(localStorage.getItem("maka_active_user"));
  },
  set activeUser(val){
    localStorage.setItem("maka_active_user", JSON.stringify(val));
  }
};

/* ================= UTIL ================= */
function toDate(str){
  return new Date(str + "T00:00:00");
}

function formatIDR(n){
  return "Rp " + n.toLocaleString("id-ID");
}

/* ================= MAKA+ LOGIC ================= */
function isMakaPlusActiveOn(user, dateStr){
  if(!user.makaPlus || !user.makaPlus.active) return false;

  const activeDate = toDate(user.makaPlus.activatedAt);
  const checkDate = toDate(dateStr);

  // MAKA+ berlaku H+1
  activeDate.setDate(activeDate.getDate() + 1);

  return checkDate >= activeDate;
}

/* ================= LIBUR ================= */
function isHoliday(user, dateStr){
  const d = toDate(dateStr);
  const t = d.getDate();

  if(t === 31) return true;

  if(user.dpType === "355"){
    if(user.dpPaidCount < 6){
      return false; // 14 & 28 TIDAK LIBUR
    }
    return t === 14 || t === 28;
  }

  if(user.dpType === "755"){
    return t === 14 || t === 28;
  }

  return false;
}

/* ================= TARIF HARIAN ================= */
function getDailyRate(user, dateStr){
  let rate = 70000;
  if(isMakaPlusActiveOn(user, dateStr)) rate += 10000;
  return rate;
}
</script>
