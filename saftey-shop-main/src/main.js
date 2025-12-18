import AOS from 'aos';
import 'aos/dist/aos.css';
import '../css/styles.css';

import { updateCartCount } from './cartCount.js';
import { renderDesktopMenu, renderMobileMenu, toggleMobileMenu } from './nav.js';
import { loadLatestProducts, loadBestSellingProducts } from './products.js';
import { loadReviews } from './reviews.js';
import { initBrands } from './brands.js';
import { renderFeatures } from './features.js';
import { HeaderWithNav, attachHeaderEvents } from './components/Header.js';
import { Footer } from './components/Footer.js';

AOS.init({ duration: 700, offset: 120, once: true });

document.addEventListener('DOMContentLoaded', async () => {
  // هدر و فوتر
  const headerEl = HeaderWithNav();
  document.body.prepend(headerEl);
  attachHeaderEvents();

  const footerEl = Footer();
  document.body.appendChild(footerEl);

  // منوها
  renderDesktopMenu();
  renderMobileMenu();

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenu = document.getElementById('closeMobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

  mobileMenuBtn?.addEventListener('click', () => toggleMobileMenu(true));
  closeMobileMenu?.addEventListener('click', () => toggleMobileMenu(false));
  mobileMenuOverlay?.addEventListener('click', () => toggleMobileMenu(false));

  // بارگذاری محتوا
  try {
    await loadLatestProducts();
    await loadBestSellingProducts();
    await loadReviews();
    await initBrands();
    renderFeatures();
  } catch (err) {
    console.error("❌ خطا در بارگذاری محتوا:", err);
  }

  // شمارنده سبد خرید
  updateCartCount();
});
