// src/showToast.js
export function showToast(message = 'عملیات با موفقیت انجام شد', type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // متن پیام
  toast.textContent = message;

  // کلاس نوع پیام (success, error, warning)
  toast.className = `toast ${type}`;

  // نمایش با انیمیشن
  toast.classList.remove('hidden', 'animate-slide-fade-in');
  void toast.offsetWidth; // ریست انیمیشن
  toast.classList.add('animate-slide-fade-in');

  // پاک کردن تایمر قبلی
  if (toast.hideTimeout) clearTimeout(toast.hideTimeout);

  // مخفی کردن بعد از ۳ ثانیه
  toast.hideTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}
