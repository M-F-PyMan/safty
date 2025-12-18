// src/utils.js

// تبدیل عدد به تومان فارسی
export function toToman(num = 0) {
  if (typeof num !== 'number') num = Number(num);
  if (isNaN(num)) num = 0;
  return num.toLocaleString('fa-IR') + ' تومان';
}

// تاریخ تولید‌شدهٔ ثابت براساس id (برای تست: توزیع در 365 روز گذشته)
export function seededDateFromId(id) {
  const now = new Date();
  const seed = Number(id);
  if (isNaN(seed)) return now; // اگر id معتبر نبود، تاریخ فعلی
  const days = (seed * 37) % 365;
  const d = new Date(now);
  d.setDate(now.getDate() - days);
  d.setHours((seed * 13) % 24, (seed * 7) % 60, 0, 0);
  return d;
}

// تبدیل به تاریخ شمسی (با persianDate موجود در صفحه)
export function formatPersian(date) {
  try {
    return new persianDate(date).format('YYYY/MM/DD');
  } catch (e) {
    // fallback: تاریخ میلادی استاندارد
    return date.toLocaleDateString('fa-IR');
  }
}

// debounce ساده با امکان immediate
export function debounce(fn, wait = 300, immediate = false) {
  let t;
  return (...args) => {
    const callNow = immediate && !t;
    clearTimeout(t);
    t = setTimeout(() => {
      t = null;
      if (!immediate) fn(...args);
    }, wait);
    if (callNow) fn(...args);
  };
}
