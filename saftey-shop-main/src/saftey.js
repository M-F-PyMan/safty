import { fetchProducts } from './common.js';
import { createProductCard } from './productCard.js';
import { updateCartCount } from './cartCount.js';

(async function () {
  const categoryTitleEl = document.getElementById('categoryTitle');
  const productListEl = document.getElementById('product-list');

  // حالت بارگذاری
  productListEl.innerHTML = '<p class="col-span-full text-center text-gray-400">⏳ در حال بارگذاری...</p>';

  let products = [];
  try {
    products = await fetchProducts();
  } catch (err) {
    console.error('❌ خطا در بارگذاری محصولات:', err);
    categoryTitleEl.textContent = 'خطا در بارگذاری محصولات';
    productListEl.innerHTML = '<p class="col-span-full text-center text-red-600">❌ مشکلی در دریافت محصولات رخ داد.</p>';
    updateCartCount();
    return;
  }

  if (!products || products.length === 0) {
    categoryTitleEl.textContent = 'هیچ محصولی موجود نیست';
    productListEl.innerHTML = '<p class="col-span-full text-center text-gray-500">محصولی یافت نشد.</p>';
    updateCartCount();
    return;
  }

  categoryTitleEl.textContent = 'ملزومات ایمنی';

  productListEl.innerHTML = ''; // پاک کردن حالت بارگذاری
  products.forEach(product => {
    const card = createProductCard(product);
    productListEl.appendChild(card);
  });

  updateCartCount();
})();
