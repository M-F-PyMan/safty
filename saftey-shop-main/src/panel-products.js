import { toToman, debounce } from './utils.js';

let PRODUCTS = [];
let filtered = [];
let currentPage = 1;
const perPage = 10;
let editingProductId = null;

// 🟢 بارگذاری محصولات از API
async function loadProducts() {
  try {
    const res = await fetch('/api/products/');
    PRODUCTS = await res.json();
    filtered = [...PRODUCTS];
    fillFilterOptions();
    renderTable(filtered);
  } catch (e) {
    console.error('خطا در بارگذاری محصولات', e);
  }
}

// 🟢 پر کردن جدول
function renderTable(data) {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageData = data.slice(start, end);

  pageData.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-2">${p.id}</td>
      <td class="border p-2">${p.title}</td>
      <td class="border p-2">${p.category}</td>
      <td class="border p-2">${toToman(p.price)}</td>
      <td class="border p-2">${p.stock}</td>
      <td class="border p-2 flex gap-2 justify-center">
        <button class="edit-btn px-2 py-1 text-green-700" data-id="${p.id}">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="delete-btn px-2 py-1 text-red-500" data-id="${p.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination(data);
  initRowEvents();
}

// 🟢 فیلتر
function fillFilterOptions() {
  const cats = [...new Set(PRODUCTS.map(p => p.category))];
  const brands = [...new Set(PRODUCTS.map(p => p.brand))];

  const catSel = document.getElementById('filterCategory');
  const brandSel = document.getElementById('filterBrand');

  if (!catSel || !brandSel) return;

  catSel.innerHTML = '<option value="">دسته‌بندی</option>';
  brandSel.innerHTML = '<option value="">برند</option>';

  cats.forEach(c => catSel.insertAdjacentHTML('beforeend', `<option>${c}</option>`));
  brands.forEach(b => brandSel.insertAdjacentHTML('beforeend', `<option>${b}</option>`));
}

// 🟢 اعمال فیلتر
function applyFilters() {
  const cat = document.getElementById('filterCategory').value;
  const brand = document.getElementById('filterBrand').value;
  const discount = document.getElementById('filterDiscount').value;
  const q = document.getElementById('searchProductInput').value.toLowerCase();

  filtered = PRODUCTS.filter(p => {
    let ok = true;
    if (cat) ok = ok && p.category === cat;
    if (brand) ok = ok && p.brand === brand;
    if (discount) {
      const d = p.discountPercentage || 0;
      if (discount === 'بدون تخفیف') ok = ok && d === 0;
      else if (discount === 'زیر ۱۰٪') ok = ok && d < 10;
      else if (discount === '۱۰ تا ۳۰٪') ok = ok && d >= 10 && d <= 30;
      else if (discount === 'بالای ۳۰٪') ok = ok && d > 30;
    }
    if (q) ok = ok && p.title.toLowerCase().includes(q);
    return ok;
  });

  currentPage = 1;
  renderTable(filtered);
}

// 🟢 مرتب‌سازی
function applySort() {
  const sortPrice = document.getElementById('sortPrice').value;
  const sortDate = document.getElementById('sortDate').value;
  const sortDiscount = document.getElementById('sortDiscount').value;
  let sorted = [...filtered];

  if (sortPrice.includes('کم')) sorted.sort((a, b) => a.price - b.price);
  else if (sortPrice.includes('زیاد')) sorted.sort((a, b) => b.price - a.price);

  if (sortDiscount.includes('کم')) sorted.sort((a, b) => (a.discountPercentage || 0) - (b.discountPercentage || 0));
  else if (sortDiscount.includes('بیش')) sorted.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));

  if (sortDate.includes('جدید')) sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  currentPage = 1;
  renderTable(sorted);
}

// 🟢 افزودن محصول جدید
async function saveProduct() {
  const title = document.getElementById('productTitle').value.trim();
  const category = document.getElementById('productCategory').value.trim();
  const brand = document.getElementById('productBrand').value.trim();
  const price = parseInt(document.getElementById('productPrice').value);
  const discount = parseFloat(document.getElementById('productDiscount').value) || 0;
  const stock = parseInt(document.getElementById('productStock').value);
  const description = document.getElementById('productDescription').value.trim();

  if (!title || !category || !price) {
    alert('لطفاً فیلدهای ضروری را پر کنید.');
    return;
  }

  const newP = { title, category, brand, price, discountPercentage: discount, stock, description };

  try {
    const res = await fetch('/api/products/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newP)
    });
    if (res.ok) {
      await loadProducts();
      alert('✅ محصول جدید اضافه شد.');
    } else {
      alert('❌ خطا در افزودن محصول');
    }
  } catch (e) {
    console.error('خطا در افزودن محصول', e);
  }
}

// 🟢 حذف محصول
async function deleteProduct(id) {
  if (!confirm('آیا از حذف محصول مطمئن هستید؟')) return;
  try {
    const res = await fetch(`/api/products/${id}/`, { method: 'DELETE' });
    if (res.ok) {
      await loadProducts();
      alert('✅ محصول حذف شد.');
    } else {
      alert('❌ خطا در حذف محصول');
    }
  } catch (e) {
    console.error('خطا در حذف محصول', e);
  }
}

// 🟢 modal ویرایش
function openEditModal(product) {
  editingProductId = product.id;
  document.getElementById('editProductTitle').value = product.title;
  document.getElementById('editProductCategory').value = product.category;
  document.getElementById('editProductBrand').value = product.brand;
  document.getElementById('editProductPrice').value = product.price;
  document.getElementById('editProductDiscount').value = product.discountPercentage || 0;
  document.getElementById('editProductStock').value = product.stock;
  document.getElementById('editProductDescription').value = product.description || '';

  document.getElementById('editProductModal').classList.remove('hidden');
}

// 🟢 ذخیره تغییرات ویرایش
async function saveEditProduct() {
  const product = {
    title: document.getElementById('editProductTitle').value.trim(),
    category: document.getElementById('editProductCategory').value.trim(),
    brand: document.getElementById('editProductBrand').value.trim(),
    price: parseInt(document.getElementById('editProductPrice').value),
    discountPercentage: parseFloat(document.getElementById('editProductDiscount').value) || 0,
    stock: parseInt(document.getElementById('editProductStock').value),
    description: document.getElementById('editProductDescription').value.trim()
  };

  try {
    const res = await fetch(`/api/products/${editingProductId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (res.ok) {
      document.getElementById('editProductModal').classList.add('hidden');
      editingProductId = null;
      await loadProducts();
      alert('✅ تغییرات ذخیره شد');
    } else {
      alert('❌ خطا در ذخیره تغییرات');
    }
  } catch (e) {
    console.error('خطا در ذخیره تغییرات', e);
  }
}
document.getElementById('saveEditProduct').addEventListener('click', saveEditProduct);
document.getElementById('closeEditModal').add