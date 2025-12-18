// فایل: forgot-password.js
import '../css/styles.css';

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value.trim();
  const result = document.getElementById("result");

  if (!email) {
    result.textContent = "لطفاً ایمیل خود را وارد کنید.";
    result.classList.add("text-red-600");
    return;
  }

  try {
    const res = await fetch('/api/auth/forgot-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!res.ok) throw new Error('خطا در ارسال درخواست');

    result.textContent = "لینک بازیابی رمز عبور به ایمیل شما ارسال شد.";
    result.classList.remove("text-red-600");
    result.classList.add("text-green-600");
  } catch (err) {
    console.error(err);
    result.textContent = "خطا در ارسال ایمیل بازیابی.";
    result.classList.remove("text-green-600");
    result.classList.add("text-red-600");
  }
});
