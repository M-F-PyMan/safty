// src/register.js
import '../css/styles.css';

// گرفتن فرم ثبت‌نام و باکس پیام
const registerForm = document.getElementById('registerForm');
const messageBox = document.getElementById('messageBox'); // در HTML یک div با این id قرار بده

registerForm?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // اعتبارسنجی
  if (password !== confirmPassword) {
    return showMessage("❌ رمزها یکسان نیستند!", "error");
  }
  if (password.length < 6) {
    return showMessage("❌ رمز عبور باید حداقل ۶ کاراکتر باشد", "error");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return showMessage("❌ ایمیل معتبر وارد کنید", "error");
  }

  try {
    // نمایش حالت بارگذاری
    showMessage("⏳ در حال ارسال اطلاعات...", "loading");

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://example.com/api';
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "خطایی رخ داده است");
    }

    showMessage("✅ ثبت‌نام موفق بود، حالا وارد شوید.", "success");
    setTimeout(() => window.location.href = "/login.html", 2000);

  } catch (err) {
    console.error('⛔ ثبت‌نام ناموفق:', err);
    showMessage(`⛔ خطا: ${err.message}`, "error");
  }
});

// 🟢 تابع نمایش پیام در UI
function showMessage(msg, type) {
  if (!messageBox) return alert(msg);
  messageBox.textContent = msg;
  messageBox.className =
    type === "error" ? "text-red-600 font-bold" :
    type === "success" ? "text-green-600 font-bold" :
    "text-gray-600";
}
