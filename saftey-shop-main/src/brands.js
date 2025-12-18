import Swiper from 'swiper';

export async function initBrands() {
  const container = document.getElementById('brands-wrapper');
  if (!container) return;

  try {
    // گرفتن برندها از بک‌اند
    const res = await fetch('/api/brands/');
    if (!res.ok) throw new Error(`خطا در گرفتن برندها: ${res.status}`);
    const brands = await res.json();

    // پاکسازی قبلی
    container.innerHTML = '';

    // ساخت اسلایدها بر اساس داده‌های API
    brands.forEach(brand => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide flex justify-center items-center';
      slide.innerHTML = `
        <img src="${brand.logo}" alt="${brand.name}" 
             class="w-24 h-24 object-contain" 
             title="${brand.name}" />
      `;
      container.appendChild(slide);
    });

    // فعال‌سازی Swiper بعد از ایجاد برندها
    new Swiper('.brandSwiper', {
      loop: true,
      slidesPerView: 2,
      spaceBetween: 20,
      breakpoints: {
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
      },
      autoplay: { delay: 2500, disableOnInteraction: false },
      navigation: {
        nextEl: '.brand-swiper-nex',
        prevEl: '.brand-swiper-pre',
      },
    });
  } catch (err) {
    console.error('❌ خطا در بارگذاری برندها:', err);
    container.innerHTML = `<p class="text-center text-red-500">خطا در بارگذاری برندها</p>`;
  }
}
