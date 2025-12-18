// src/slugify.js
export function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')                // فاصله‌ها به -
    .replace(/[^\p{L}\d\-]+/gu, '')      // حذف کاراکترهای غیر مجاز (پشتیبانی از یونیکد)
    .replace(/\-\-+/g, '-')              // چند - پشت سر هم
    .replace(/^-+/, '')                  // حذف - ابتدای متن
    .replace(/-+$/, '');                 // حذف - انتهای متن
}
