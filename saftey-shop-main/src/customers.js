import { toToman, formatPersian, debounce } from './utils.js';

// داده‌ها
let USERS = [];
let filteredUsers = [];

// المنت‌ها
const searchInput = document.getElementById('searchInput');
const filterInput = document.getElementById('filterInput');
const statusFilter = document.getElementById('statusFilter');
const tableBody = document.getElementById('customerTable');

// کارت‌ها
const totalCustomersEl = document.getElementById('totalCustomers');
const newCustomersEl = document.getElementById('newCustomers');
const activeCustomersEl = document.getElementById('activeCustomers');

// ------------------ گرفتن داده‌ها از API ------------------
async function fetchUsers() {
  const res = await fetch('/api/users/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!res.ok) throw new Error('خطا در گرفتن کاربران');
  return await res.json();
}

async function loadUsers() {
  try {
    const users = await fetchUsers();
    USERS = users.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      country: u.country || 'نامشخص',
      createdAt: new Date(u.date_joined),
      lastPurchase: u.last_purchase ? new Date(u.last_purchase) : null,
      totalSpend: u.total_spend || 0,
      status: u.status || 'active'
    }));
    filteredUsers = USERS;
    renderCards();
    renderTable(filteredUsers);
  } catch (err) {
    console.error('❌ loadUsers error:', err);
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-red-500">خطا در بارگذاری مشتری‌ها</td></tr>`;
  }
}

// ------------------ کارت‌ها ------------------
function renderCards() {
  totalCustomersEl.textContent = USERS.length.toLocaleString('fa-IR');

  // جدیدترین مشتری‌ها (۳۰ روز اخیر)
  const now = new Date();
  const last30 = USERS.filter(u => (now - u.createdAt) / (1000 * 60 * 60 * 24) <= 30);
  newCustomersEl.textContent = last30.length.toLocaleString('fa-IR');

  const activeCount = USERS.filter(u => u.status === 'active').length;
  activeCustomersEl.textContent = activeCount.toLocaleString('fa-IR');
}

// ------------------ جدول ------------------
const STATUS_MAP = {
  active: { label: 'فعال', color: 'text-green-600 bg-green-50' },
  inactive: { label: 'غیرفعال', color: 'text-gray-600 bg-gray-50' },
  blocked: { label: 'مسدود', color: 'text-red-600 bg-red-50' }
};

function renderTable(data) {
  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500">هیچ مشتری یافت نشد.</td></tr>`;
    return;
  }

  data.forEach(u => {
    const { label, color } = STATUS_MAP[u.status] || STATUS_MAP.inactive;

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-orange-50 transition';
    tr.innerHTML = `
      <td class="py-3 px-4">${u.id}</td>
      <td class="py-3 px-4">
        <p class="font-semibold">${u.name}</p>
        <p class="text-xs text-gray-400">${u.email}</p>
      </td>
      <td class="py-3 px-4">${u.country}</td>
      <td class="py-3 px-4">${formatPersian(u.createdAt)}</td>
      <td class="py-3 px-4">${u.lastPurchase ? formatPersian(u.lastPurchase) : '-'}</td>
      <td class="py-3 px-4">${toToman(u.totalSpend)}</td>
      <td class="py-3 px-4">
        <span class="px-3 py-1 rounded-full text-xs font-medium ${color}">${label}</span>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// ------------------ فیلتر و جستجو ------------------
function applyFilters() {
  const q = searchInput?.value.trim().toLowerCase() || '';
  const country = filterInput?.value.trim().toLowerCase() || '';
  const status = statusFilter?.value || '';

  filteredUsers = USERS.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchCountry = !country || u.country.toLowerCase().includes(country);
    const matchStatus = !status || u.status === status;
    return matchSearch && matchCountry && matchStatus;
  });

  renderTable(filteredUsers);
  renderCards(); // کارت‌ها همزمان آپدیت بشن
}

// ------------------ لیسنرها ------------------
function initFilters() {
  if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
  if (filterInput) filterInput.addEventListener('input', debounce(applyFilters, 300));
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
}

// ------------------ شروع ------------------
(async function init() {
  await loadUsers();
  initFilters();
})();
