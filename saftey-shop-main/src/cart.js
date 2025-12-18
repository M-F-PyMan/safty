import '../css/styles.css';
import { HeaderWithNav, attachHeaderEvents } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { faToEnDigits, updateCartCount } from './cartCount.js';

const cartContainer = document.getElementById('cart-container');
const totalPriceEl = document.getElementById('total-price');
const totalItemsEl = document.getElementById('total-items');
const clearBtn = document.getElementById('clear-cart');

// گرفتن سبد خرید از بک‌اند
async function fetchCart() {
  const res = await fetch('/api/cart/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!res.ok) throw new Error('خطا در گرفتن سبد خرید');
  return await res.json();
}

// رندر جدول سبد خرید
async function renderCartTable() {
  try {
    const cart = await fetchCart();
    cartContainer.innerHTML = '';

    if (!cart.length) {
      cartContainer.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-gray-500">سبد خرید شما خالی است.</td>
        </tr>`;
      updateTotal([]);
      updateCartCount();
      return;
    }

    cart.forEach(item => {
      const price = Number(faToEnDigits(String(item.product_price))) || 0; // بهتره از فیلد قیمت محصول استفاده کنیم
      const quantity = Number(faToEnDigits(item.quantity)) || 0;

      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-gray-50';
      row.innerHTML = `
        <td class="px-4 py-3">
          <img src="${item.product_image}" alt="${item.product_title}" class="w-16 h-16 object-cover rounded" />
        </td>
        <td class="px-4 py-3 font-medium">${item.product_title}</td>
        <td class="px-4 py-3 text-sm text-gray-800">${price.toLocaleString('fa-IR')} تومان</td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-center gap-2">
            <button class="decrease-qty bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-full w-8 h-8 transition" data-id="${item.id}">-</button>
            <span class="quantity-display font-bold text-gray-900">${quantity.toLocaleString('fa-IR')}</span>
            <button class="increase-qty bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-full w-8 h-8 transition" data-id="${item.id}">+</button>
          </div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-800">
          ${(price * quantity).toLocaleString('fa-IR')} تومان
        </td>
        <td class="px-4 py-3">
          <button class="remove-btn w-full bg-orange-500 text-white hover:border-2 border-orange-700 hover:bg-slate-50 hover:text-orange-700 py-2 rounded-lg text-sm transition mt-2" data-id="${item.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;

      // رویدادها
      row.querySelector('.remove-btn').addEventListener('click', () => removeItemFromCart(item.id));
      row.querySelector('.increase-qty').addEventListener('click', () => updateQuantity(item.id, quantity + 1));
      row.querySelector('.decrease-qty').addEventListener('click', () => {
        if (quantity > 1) updateQuantity(item.id, quantity - 1);
      });

      cartContainer.appendChild(row);
    });

    updateTotal(cart);
    updateCartCount();
  } catch (err) {
    console.error('❌ خطا در بارگذاری سبد خرید:', err);
    cartContainer.innerHTML = `<tr><td colspan="6" class="text-center text-red-500">خطا در بارگذاری سبد خرید</td></tr>`;
  }
}

// تغییر تعداد
async function updateQuantity(cartId, newQty) {
  await fetch(`/api/cart/${cartId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ quantity: newQty })
  });
  renderCartTable();
}

// حذف آیتم
async function removeItemFromCart(cartId) {
  await fetch(`/api/cart/${cartId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  renderCartTable();
}

// پاک کردن کل سبد
async function clearCart() {
  await fetch('/api/cart/clear/', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  renderCartTable();
}

// محاسبه مجموع
function updateTotal(cart) {
  if (!totalPriceEl || !totalItemsEl) return;

  let total = 0;
  let totalItems = 0;

  cart.forEach(item => {
    const price = Number(faToEnDigits(item.product_price)) || 0;
    const quantity = Number(faToEnDigits(item.quantity)) || 0;
    total += price * quantity;
    totalItems += quantity;
  });

  totalPriceEl.textContent = `${total.toLocaleString('fa-IR')} تومان`;
  totalItemsEl.textContent = totalItems.toLocaleString('fa-IR');
}

// رویداد پاک کردن
clearBtn.addEventListener('click', () => clearCart());

// بارگذاری اولیه
document.addEventListener('DOMContentLoaded', () => {
  const headerElement = HeaderWithNav();
  document.body.prepend(headerElement);
  attachHeaderEvents();
  renderCartTable();
  document.body.appendChild(Footer());
});
