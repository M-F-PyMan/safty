export function renderFeatures() {
  const features = [
    { icon: 'pi pi-truck', title: 'ارسال رایگان', subtitle: 'برای سفارشات بالای ۵۰۰ هزار تومان' },
    { icon: 'pi pi-cog', title: 'تضمین کیفیت', subtitle: 'تضمین بهترین کیفیت محصول' },
    { icon: 'pi pi-phone', title: 'پشتیبانی ۲۴ ساعته', subtitle: 'پشتیبانی آنلاین و تلفنی' },
    { icon: 'pi pi-thumbs-up', title: 'رضایت مشتری', subtitle: 'مشتریان راضی و بازگشت خرید' }
  ];

  const container = document.getElementById('featuresContainer');
  if (!container) return;

  // پاک کردن محتوای قبلی
  container.innerHTML = '';

  features.forEach(({ icon, title, subtitle }) => {
    const div = document.createElement('div');
    div.className = 'flex flex-col justify-center items-center text-center gap-2 h-full';

    // استفاده از template literal برای خوانایی بیشتر
    div.innerHTML = `
      <span class="text-5xl text-orange-700"><i class="${icon}"></i></span>
      <h3 class="text-lg font-semibold text-orange-800">${title}</h3>
      <p class="text-gray-500">${subtitle}</p>
    `;

    container.appendChild(div);
  });
}
