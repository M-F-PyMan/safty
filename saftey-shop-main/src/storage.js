// src/storage.js
import { faToEnDigits } from "./cartCount";

export async function getCart() {
  try {
    const res = await fetch('/api/cart/', { method: 'GET' });
    if (!res.ok) throw new Error('خطا در دریافت سبد خرید');
    return await res.json();
  } catch (err) {
    console.error('❌ خطا در گرفتن سبد خرید:', err);
    return [];
  }
}

export async function addToCart(product, qty = 1) {
  try {
    const basePrice = Number(faToEnDigits(product.price));
    const discounted = product.discountPrice ? Number(faToEnDigits(product.discountPrice)) : null;
    const finalPrice = discounted || basePrice;

    const payload = {
      ...product,
      price: finalPrice,
      originalPrice: discounted ? basePrice : null,
      quantity: qty,
    };

    const res = await fetch('/api/cart/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('خطا در افزودن محصول به سبد');
    return await res.json();
  } catch (err) {
    console.error('❌ خطا در افزودن به سبد:', err);
  }
}

export async function removeFromCart(productId, size = null) {
  try {
    const url = size ? `/api/cart/${productId}/remove/?size=${size}` : `/api/cart/${productId}/remove/`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در حذف محصول از سبد');
    return await res.json();
  } catch (err) {
    console.error('❌ خطا در حذف از سبد:', err);
  }
}

export async function clearCart() {
  try {
    const res = await fetch('/api/cart/clear/', { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در پاک کردن سبد');
    return await res.json();
  } catch (err) {
    console.error('❌ خطا در پاک کردن سبد:', err);
  }
}
