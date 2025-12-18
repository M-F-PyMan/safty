// src/cartProductCard.js
export function createCartProductCard(item) {
  const price = Number(item.price);
  const quantity = Number(item.quantity);

  const card = document.createElement('div');
  card.className = `
    flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white rounded shadow-md border border-gray-300
    hover:shadow-lg transition duration-300
  `;

  card.innerHTML = `
    <!-- بخش مشخصات محصول -->
    <div class="flex-1 sm:flex-[5] text-right space-y-1">
      <img src="${item.image}" alt="${item.title}" class="w-24 h-24 object-cover rounded-lg mb-2 sm:mb-0 sm:mr-4 float-right" />
      <h3 class="text-lg font-semibold text-gray-900 truncate">${item.title}</h3>
      <p class="text-gray-600 text-sm">قیمت واحد: 
        <span class="text-orange-600 font-bold">${price.toLocaleString('fa-IR')} تومان</span>
      </p>
      <p class="text-gray-600 text-sm">تعداد: 
        <span class="font-medium">${quantity}</span>
      </p>
      <p class="text-orange-600 font-bold text-base">جمع: 
        ${(price * quantity).toLocaleString('fa-IR')} تومان
      </p>
    </div>

    <!-- بخش دکمه تکمیل سفارش و جمع کل محصول -->
    <div class="flex flex-col justify-between items-center sm:flex-[7] p-4 bg-gray-50 rounded-lg w-full sm:w-auto">
      <button class="bg-green-600 text-white rounded-md px-6 py-2 hover:bg-green-700 transition-colors duration-300 mb-4 w-full sm:w-auto">
        تکمیل سفارش
      </button>
      <p class="text-right text-gray-700 font-bold text-lg w-full sm:w-auto">
        کل مبلغ: 
        <span class="text-orange-600">${(price * quantity).toLocaleString('fa-IR')} تومان</span>
      </p>
    </div>
  `;

  // هندلر کلیک تکمیل سفارش → اتصال به بک‌اند
  const checkoutBtn = card.querySelector('button');
  checkoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product: item.id,
          quantity: quantity,
          total_price: price * quantity
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'ثبت سفارش ناموفق بود');
      }

      const data = await res.json();
      alert(`✅ سفارش ${item.title} با موفقیت ثبت شد! شماره سفارش: ${data.id}`);
      // می‌تونی اینجا ریدایرکت به صفحه سفارش‌ها یا پرداخت بزنی
      // window.location.href = '/orders.html';
    } catch (err) {
      console.error('❌ خطا در ثبت سفارش:', err);
      alert(err.message || 'مشکلی در ثبت سفارش پیش آمد.');
    }
  });

  return card;
}
