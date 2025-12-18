import { HomePage } from './pages/HomePage.js';
import { CartPage } from './pages/cartPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';

const routes = {
  '/': HomePage,
  '/cart.html': CartPage,
  '/product-detail.html': ProductDetailPage
};

export function router() {
  // نرمالایز مسیر
  let path = window.location.pathname.replace(/\/$/, '');
  const page = routes[path] || HomePage;

  try {
    page();
  } catch (err) {
    console.error('⛔ خطا در اجرای صفحه:', err);
    HomePage();
  }
}

// اجرای اولیه
window.addEventListener('DOMContentLoaded', router);

// مدیریت برگشت/جلو مرورگر
window.addEventListener('popstate', router);

// هندل کردن کلیک روی لینک‌های داخلی برای SPA
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-link]');
  if (link) {
    e.preventDefault();
    const href = link.getAttribute('href');
    window.history.pushState({}, '', href);
    router();
  }
});
