import '../css/styles.css';

let CATEGORIES = [];
let editingCategory = null;

const container = document.getElementById('categoriesContainer');
const searchInput = document.getElementById('searchCategoryInput');
const addBtn = document.getElementById('addCategoryBtn');
const modal = document.getElementById('categoryModal');
const cancelModal = document.getElementById('cancelModal');
const confirmAdd = document.getElementById('confirmAddCategory');
const nameInput = document.getElementById('newCategoryName');
const prodInput = document.getElementById('newCategoryProducts');
const modalTitle = document.getElementById('modalTitle');
const deleteBtn = document.getElementById('deleteCategoryBtn');

// ---------- گرفتن داده‌ها از API ----------
async function loadCategories() {
  try {
    const res = await fetch('/api/categories/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('خطا در گرفتن دسته‌بندی‌ها');
    CATEGORIES = await res.json();
    renderCategories(CATEGORIES);
  } catch (err) {
    console.error('❌ خطا در بارگذاری دسته‌بندی‌ها:', err);
    container.innerHTML = `<p class="text-center text-red-500">خطا در بارگذاری دسته‌بندی‌ها</p>`;
  }
}

// ---------- رندر کارت‌ها ----------
function renderCategories(data) {
  container.innerHTML = '';
  if (!data.length) {
    container.innerHTML = `<p class="text-center text-gray-500">هیچ دسته‌بندی یافت نشد.</p>`;
    return;
  }

  data.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card relative p-4 border rounded shadow-sm hover:shadow-md transition';

    card.innerHTML = `
      <!-- دکمه ویرایش -->
      <button class="absolute top-3 left-3 w-10 h-10 flex items-center justify-center bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full shadow-sm transition edit-icon" title="ویرایش">
        <i class="fa-solid fa-pen text-sm"></i>
      </button>

      <!-- محتوای کارت -->
      <h3 class="text-lg font-semibold text-gray-800 mb-2 mt-6">${cat.name}</h3>
      <p class="text-sm text-gray-500">${cat.products ? cat.products.slice(0, 3).map(p => p.title).join(', ') : ''}</p>
    `;

    card.querySelector('.edit-icon').addEventListener('click', () => openEditModal(cat));
    container.appendChild(card);
  });
}

// ---------- جستجو ----------
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = CATEGORIES.filter(c => c.name.toLowerCase().includes(q));
  renderCategories(filtered);
});

// ---------- افزودن دسته‌بندی ----------
addBtn.addEventListener('click', () => openAddModal());
cancelModal.addEventListener('click', () => closeModal());

confirmAdd.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  if (!name) return alert('نام دسته‌بندی الزامی است.');

  try {
    if (editingCategory) {
      // ویرایش دسته
      await fetch(`/api/categories/${editingCategory.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name })
      });
    } else {
      // افزودن جدید
      await fetch('/api/categories/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name })
      });
    }
    await loadCategories();
    closeModal();
  } catch (err) {
    console.error('❌ خطا در ذخیره دسته‌بندی:', err);
    alert('مشکلی در ذخیره دسته‌بندی پیش آمد.');
  }
});

// ---------- ویرایش دسته ----------
function openEditModal(cat) {
  editingCategory = cat;
  modalTitle.textContent = `ویرایش دسته "${cat.name}"`;
  nameInput.value = cat.name;
  prodInput.value = cat.products ? cat.products.map(p => p.title).join(', ') : '';
  deleteBtn.classList.remove('hidden');
  modal.classList.add('active');
}

// ---------- افزودن دسته جدید ----------
function openAddModal() {
  editingCategory = null;
  modalTitle.textContent = 'افزودن دسته‌بندی جدید';
  nameInput.value = '';
  prodInput.value = '';
  deleteBtn.classList.add('hidden');
  modal.classList.add('active');
}

// ---------- حذف دسته ----------
deleteBtn.addEventListener('click', async () => {
  if (!editingCategory) return;
  if (confirm(`آیا از حذف "${editingCategory.name}" مطمئنی؟`)) {
    try {
      await fetch(`/api/categories/${editingCategory.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      editingCategory = null;
      await loadCategories();
      closeModal();
    } catch (err) {
      console.error('❌ خطا در حذف دسته‌بندی:', err);
      alert('مشکلی در حذف دسته‌بندی پیش آمد.');
    }
  }
});

// ---------- بستن مودال ----------
function closeModal() {
  modal.classList.remove('active');
  editingCategory = null;
}

// ---------- شروع ----------
loadCategories();
