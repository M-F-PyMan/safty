import { HeaderWithNav, attachHeaderEvents } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { updateCartCount } from './cartCount.js';
import '../css/styles.css';

// 🟢 گرفتن محصول از API
async function loadProduct(id) {
  try {
    const res = await fetch(`/api/products/${id}/`);
    if (!res.ok) throw new Error('خطا در دریافت محصول');
    const product = await res.json();
    renderProductDetail(product);
  } catch (e) {
    console.error(e);
    showToast('❌ خطا در بارگذاری محصول');
  }
}

// 🧱 رندر کامل صفحه محصول
function renderProductDetail(product) {
  const container = document.getElementById('product-detail');
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col md:flex-row gap-8">
      <!-- گالری عکس -->
      <div class="w-full md:w-1/2">
        <img id="mainImage" src="${product.mainImage}" alt="${product.title}" 
          class="w-full max-w-md mx-auto rounded-lg shadow hover:scale-105 transition-transform duration-300" />
        <div class="flex justify-center gap-2 mt-4 flex-wrap">
          ${(product.gallery||[]).map(img => `<img src="${img}" class="thumbnail w-20 h-20 rounded cursor-pointer border hover:border-orange-500 transition" />`).join('')}
        </div>
      </div>

      <!-- مشخصات -->
      <div class="grow pt-4">
        <h4 class="text-gray-500 text-lg mb-1">${product.category}</h4>
        <h2 class="text-3xl font-bold mb-1">${product.title}</h2>
        <h3 class="text-xl font-semibold mb-2">${product.brand}</h3>
        <div class="flex items-center gap-4 mb-4">
          ${product.discountPrice ? `<span class="line-through text-gray-400">${product.discountPrice.toLocaleString()} تومان</span>` : ''}
          <span class="text-red-500 text-2xl">${product.price.toLocaleString()} تومان</span>
        </div>

        <!-- انتخاب سایز -->
        ${product.sizes && product.sizes.length ? `
        <div class="flex gap-2 mb-4">
          ${product.sizes.map(s => `<button class="size-btn border px-3 py-1 rounded">${s}</button>`).join('')}
        </div>` : ''}

        <!-- تعداد و افزودن -->
        <div class="flex items-center gap-4 my-4">
          <button id="decQty" class="border px-3 py-1 rounded">-</button>
          <input id="qtyInput" type="number" min="1" value="1"
            class="w-16 text-center border rounded py-2" />
          <button id="incQty" class="border px-3 py-1 rounded">+</button>
          <button id="addToCartBtn"
            class="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded text-lg transition">
            افزودن به سبد خرید 🛒
          </button>
        </div>

        <h4 class="text-xl font-bold mt-6 mb-2">جزئیات محصول</h4>
        <p class="text-base leading-8 text-gray-700">${product.description||''}</p>
      </div>
    </div>

    <!-- مشخصات فنی -->
    <section class="bg-white rounded-lg shadow p-4 mt-12 max-w-3xl mx-auto">
      <h3 class="text-2xl font-bold mb-4">مشخصات فنی</h3>
      <div class="space-y-2">
        ${(product.specs||[]).map(s => `
          <div class="grid grid-cols-[1fr_2fr] border-b border-gray-100 pb-2">
            <span class="font-semibold text-gray-700">${s.label}</span>
            <span class="text-gray-600">${s.value}</span>
          </div>`).join('')}
      </div>
    </section>
  `;

  // تغییر عکس اصلی
  document.querySelectorAll('.thumbnail').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.getElementById('mainImage').src = thumb.src;
    });
  });

  // مدیریت تعداد
  const qtyInput = document.getElementById('qtyInput');
  document.getElementById('incQty').addEventListener('click',()=>qtyInput.value=parseInt(qtyInput.value)+1);
  document.getElementById('decQty').addEventListener('click',()=>qtyInput.value=Math.max(1,parseInt(qtyInput.value)-1));

  // افزودن به سبد خرید
  document.getElementById('addToCartBtn').addEventListener('click', () => {
    const qty = parseInt(qtyInput.value);
    const selectedSize = document.querySelector('.size-btn.selected')?.textContent || null;
    addToCart(product, qty, selectedSize);
  });

  // انتخاب سایز
  document.querySelectorAll('.size-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('selected','bg-orange-500','text-white'));
      btn.classList.add('selected','bg-orange-500','text-white');
    });
  });
}

// 🛍 ذخیره در لوکال استورج
function addToCart(product, qty=1, size=null) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find((item) => item.id === product.id && item.size===size);

  if (existing) existing.qty += qty;
  else cart.push({ ...product, qty, size });

  localStorage.setItem('cart', JSON.stringify(cart));

  updateCartCount();
  showToast('محصول با موفقیت به سبد خرید اضافه شد ✅');
}

// 🔔 نوتیف توست ساده
function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.className =
    'fixed top-5 right-5 bg-orange-600 text-white py-3 px-6 rounded shadow-lg z-50 opacity-0 transition-opacity';
  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = '1', 50);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(()=>toast.remove(),500); }, 2500);
}

// 🔧 اجرای اولیه
document.addEventListener('DOMContentLoaded', () => {
  const headerElement = HeaderWithNav();
  document.body.prepend(headerElement);
  attachHeaderEvents();
  updateCartCount();

  // گرفتن محصول واقعی از API
  loadProduct(1);

  document.body.appendChild(Footer());
});
