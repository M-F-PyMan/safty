export function faToEnDigits(str) {
  if (typeof str !== 'string') return String(str);
  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  const enDigits = '0123456789';
  return str.replace(/[۰-۹]/g, d => enDigits[faDigits.indexOf(d)]);
}

export async function updateCartCount() {
  const cartCountSpan = document.getElementById('cartCount');
  if (!cartCountSpan) return;

  try {
    const res = await fetch('/api/cart/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('خطا در گرفتن سبد خرید');
    const cart = await res.json();

    const count = cart.reduce((sum, item) => sum + Number(faToEnDigits(item.quantity || '0')), 0);

    if (count > 0) {
      cartCountSpan.textContent = count;
      cartCountSpan.classList.remove('hidden');
    } else {
      cartCountSpan.classList.add('hidden');
    }
  } catch (err) {
    console.error('❌ خطا در بروزرسانی تعداد سبد خرید:', err);
    cartCountSpan.classList.add('hidden');
  }
}
