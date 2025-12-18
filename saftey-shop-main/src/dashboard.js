import { fetchCarts, fetchProducts, fetchUsers } from './api.js';
import { seededDateFromId, toToman, debounce } from './utils.js';
import '../css/styles.css';

let ORDERS = [];
let chartInstance = null;
let profitChartInstance = null;
let filterFrom = null;
let filterTo = null;
let currentQuery = '';
let monthlyCacheKey = '';
let monthlyCache = null;

const searchInput =
  document.querySelector('input[placeholder^="جستجو"]') ||
  document.querySelector('input[type="search"]');

const fromInput = document.getElementById('fromDate');
const toInput = document.getElementById('toDate');
const chartCanvas = document.getElementById('revenueChart');

/* ------------------ ابزار کمکی برای کارت‌ها ------------------ */
function setCardValueByLabel(labelStartsWith, valueText) {
  const nodes = document.querySelectorAll('section .bg-white p.text-gray-400');
  nodes.forEach(p => {
    if (p?.textContent?.trim().startsWith(labelStartsWith)) {
      const h2 = p.nextElementSibling;
      if (h2) h2.textContent = valueText;
    }
  });
}

/* ------------------ درج بلوک آمار سریع ------------------ */
function ensureStatsAreaInserted() {
  if (document.getElementById('dashboardQuickStats')) return;
  const main = document.querySelector('main') || document.body;
  const container = document.createElement('div');
  container.id = 'dashboardQuickStats';
  container.className = 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-6';
  container.innerHTML = `
    <div class="bg-white shadow-md rounded-2xl p-4 text-center">
      <h3 class="text-sm text-gray-500">فروش این هفته</h3>
      <p id="weekRevenue" class="text-2xl font-bold text-orange-600 mt-2">—</p>
      <small id="weekCount" class="text-xs text-gray-400 block mt-1"></small>
    </div>
    <div class="bg-white shadow-md rounded-2xl p-4 text-center">
      <h3 class="text-sm text-gray-500">فروش این ماه</h3>
      <p id="monthRevenue" class="text-2xl font-bold text-orange-600 mt-2">—</p>
      <small id="monthCount" class="text-xs text-gray-400 block mt-1"></small>
    </div>
    <div class="bg-white shadow-md rounded-2xl p-4 text-center">
      <h3 class="text-sm text-gray-500">فروش سالانه</h3>
      <p id="yearRevenue" class="text-2xl font-bold text-orange-600 mt-2">—</p>
      <small id="yearCount" class="text-xs text-gray-400 block mt-1"></small>
    </div>
  `;
  const firstSection = document.querySelector('section.grid');
  if (firstSection) firstSection.parentNode.insertBefore(container, firstSection);
  else main.prepend(container);
}

/* ------------------ لود داده‌ها ------------------ */
async function loadData() {
  const [carts, products, users] = await Promise.all([
    fetchCarts(),
    fetchProducts(),
    fetchUsers()
  ]);

  ORDERS = (carts || []).map(cart => {
    const date = seededDateFromId(cart.id);
    const total = cart.total ?? (cart.products || [])
      .reduce((s, p) => s + (Number(p.price) * (Number(p.quantity) || 1)), 0);

    const items = cart.totalProducts ?? (cart.products || [])
      .reduce((s, p) => s + (Number(p.quantity) || 1), 0);

    const titles = (cart.products || []).map(p => {
      const prod = (products || []).find(x => x.id === p.id);
      return prod ? prod.title : (p.title || 'محصول');
    });

    const user = (users || []).find(u => u.id === cart.userId) || {};
    const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `کاربر ${cart.userId}`;

    return { id: cart.id, date, total, items, customer: customerName, products: titles };
  });
}

/* ------------------ محاسبه آمار دوره‌ها ------------------ */
function computePeriodStats(orders = []) {
  const now = new Date();
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const inRange = (d, a, b) => d >= a && d <= b;

  const thisWeek = orders.filter(o => inRange(o.date, startOfDay(weekAgo), endOfDay(now)));
  const thisMonth = orders.filter(o => o.date.getMonth() === now.getMonth() && o.date.getFullYear() === now.getFullYear());
  const thisYear = orders.filter(o => o.date.getFullYear() === now.getFullYear());

  const sum = arr => arr.reduce((s, o) => s + (o.total || 0), 0);

  return {
    week: { revenue: sum(thisWeek), count: thisWeek.length },
    month: { revenue: sum(thisMonth), count: thisMonth.length },
    year: { revenue: sum(thisYear), count: thisYear.length },
  };
}

/* ------------------ کارت‌های اصلی ------------------ */
function updateExistingCards(orders) {
  const totals = orders.reduce((s, o) => s + (o.total || 0), 0);
  const uniqueCustomers = new Set(orders.map(o => o.customer)).size;

  setCardValueByLabel('کل فروش', orders.length.toLocaleString('fa-IR'));
  setCardValueByLabel('مشتریان جدید', uniqueCustomers.toLocaleString('fa-IR'));
  setCardValueByLabel('محصولات مرجوعی', '0'); // اگر داده واقعی داری اینجا جایگزین کن
  setCardValueByLabel('درآمد کل', toToman(totals));
}

/* ------------------ خلاصه سریع ------------------ */
function renderQuickStats(orders) {
  const stats = computePeriodStats(orders);
  const weekRevenueEl = document.getElementById('weekRevenue');
  const weekCountEl = document.getElementById('weekCount');
  const monthRevenueEl = document.getElementById('monthRevenue');
  const monthCountEl = document.getElementById('monthCount');
  const yearRevenueEl = document.getElementById('yearRevenue');
  const yearCountEl = document.getElementById('yearCount');

  if (weekRevenueEl) weekRevenueEl.textContent = toToman(stats.week.revenue);
  if (weekCountEl) weekCountEl.textContent = `تعداد سفارش: ${stats.week.count}`;
  if (monthRevenueEl) monthRevenueEl.textContent = toToman(stats.month.revenue);
  if (monthCountEl) monthCountEl.textContent = `تعداد سفارش: ${stats.month.count}`;
  if (yearRevenueEl) yearRevenueEl.textContent = toToman(stats.year.revenue);
  if (yearCountEl) yearCountEl.textContent = `تعداد سفارش: ${stats.year.count}`;
}

/* ------------------ داده ۶ ماه اخیر (با کش) ------------------ */
function buildMonthlySeries(orders) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }

  // Cache by order ids + month anchor
  const cacheKey = JSON.stringify({
    ids: orders.map(o => o.id),
    anchor: `${months[0].getFullYear()}-${months[0].getMonth()}`
  });

  if (monthlyCache && monthlyCacheKey === cacheKey) {
    return monthlyCache;
  }

  const totals = new Array(6).fill(0);
  orders.forEach(o => {
    const first = months[0];
    const monthIndex =
      (o.date.getFullYear() - first.getFullYear()) * 12 +
      (o.date.getMonth() - first.getMonth());
    if (monthIndex >= 0 && monthIndex < 6) totals[monthIndex] += (o.total || 0);
  });

  const labels = months.map(d => {
    try {
      return new persianDate(d).format('MMMM');
    } catch {
      const monthNames = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
      return monthNames[d.getMonth()];
    }
  });

  monthlyCacheKey = cacheKey;
  monthlyCache = { labels, totals };
  return monthlyCache;
}

/* ------------------ چارت تحلیل درآمد (ستونی نارنجی) ------------------ */
function renderChartForOrders(orders) {
  const ctx = chartCanvas;
  if (!ctx || typeof Chart === 'undefined') return;

  const { labels, totals } = buildMonthlySeries(orders);
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'درآمد ماهانه (تومان)',
        data: totals,
        backgroundColor: '#F95509',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `درآمد: ${toToman(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#444',
            callback: v => v ? v.toLocaleString('fa-IR') : v
          },
          grid: { color: 'rgba(249,115,22,0.08)' }
        },
        x: {
          ticks: { color: '#555' },
          grid: { display: false }
        }
      }
    }
  });
}

/* ------------------ چارت سود و زیان دو ستونه ------------------ */
function renderProfitChart(orders, canvasId) {
  const ctxEl = document.getElementById(canvasId);
  if (!ctxEl || typeof Chart === 'undefined') return;

  const { labels, totals } = buildMonthlySeries(orders);

  // سود را به‌صورت درصدی از درآمد ماهانه مدل کنیم؛ زیان درصد کوچکتر
  const profits = totals.map(v => Math.max(0, v * 0.25)); // 25% سود فرضی از درآمد
  const losses  = totals.map(v => Math.max(0, v * 0.06)); // 6% زیان فرضی از درآمد

  if (profitChartInstance) profitChartInstance.destroy();

  profitChartInstance = new Chart(ctxEl, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'سود (تومان)',
          data: profits,
          backgroundColor: '#F97316',
          borderWidth: 2,
          borderRadius: 10
        },
        {
          label: 'زیان (تومان)',
          data: losses,
          backgroundColor: '#14054D',
          borderWidth: 2,
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#333', boxWidth: 15, font: { size: 13 } }
        },
        tooltip: {
          backgroundColor: '#fef3c7',
          titleColor: '#000',
          bodyColor: '#000',
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${toToman(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#555', font: { size: 12 } },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#444',
            callback: v => v.toLocaleString('fa-IR')
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });
}

/* ------------------ خلاصه فیلتر ------------------ */
function renderFilteredSummary(filtered) {
  let el = document.getElementById('filteredSummary');
  if (!el) {
    el = document.createElement('div');
    el.id = 'filteredSummary';
    el.className = 'max-w-5xl mx-auto mt-4 text-sm text-gray-600 text-right';
    const chartParent = chartCanvas ? chartCanvas.parentNode : document.body;
    chartParent.insertAdjacentElement('afterend', el);
  }
  const total = (filtered || []).reduce((s, o) => s + (o.total || 0), 0);
  el.innerHTML = `نتایج فیلتر: <strong>${(filtered || []).length}</strong> سفارش — مجموع: <strong>${toToman(total)}</strong>`;
}

/* ------------------ فیلترها ------------------ */
function applyFiltersAndRender() {
  let filtered = ORDERS.slice();

  // شروع/پایان روز برای فیلتر دقیق
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  if (filterFrom) filtered = filtered.filter(o => o.date >= startOfDay(filterFrom));
  if (filterTo) filtered = filtered.filter(o => o.date <= endOfDay(filterTo));

  if (currentQuery && currentQuery.trim().length) {
    const q = currentQuery.trim().toLocaleLowerCase();
    filtered = filtered.filter(o => {
      const inCust = (o.customer || '').toLocaleLowerCase().includes(q);
      const inProd = (o.products || []).some(t => (t || '').toLocaleLowerCase().includes(q));
      return inCust || inProd;
    });
  }

  renderChartForOrders(filtered);
  renderProfitChart(filtered, 'profitChart');
  renderFilteredSummary(filtered);
  renderQuickStats(filtered);
  updateExistingCards(filtered);
}

/* ------------------ datepicker ------------------ */
function initDatepickers() {
  // اگر jQuery یا persianDate وجود نداشت، بی‌سروصدا رد شو
  if (typeof $ === 'undefined' || typeof persianDate === 'undefined') return;

  $(fromInput).persianDatepicker({
    format: 'YYYY/MM/DD',
    autoClose: true,
    onSelect: unix => {
      try { filterFrom = new persianDate(unix).toDate(); } catch { filterFrom = null; }
      applyFiltersAndRender();
    }
  });

  $(toInput).persianDatepicker({
    format: 'YYYY/MM/DD',
    autoClose: true,
    onSelect: unix => {
      try { filterTo = new persianDate(unix).toDate(); } catch { filterTo = null; }
      applyFiltersAndRender();
    }
  });
}

/* ------------------ سرچ ------------------ */
function initSearchInput() {
  if (!searchInput) return;
  const onInput = debounce(e => {
    currentQuery = e.target.value || '';
    applyFiltersAndRender();
  }, 300);
  searchInput.addEventListener('input', onInput);
}

/* ------------------ شروع ------------------ */
(async function init() {
  try {
    ensureStatsAreaInserted();
    await loadData();
    updateExistingCards(ORDERS);
    renderQuickStats(ORDERS);
    renderChartForOrders(ORDERS);
    renderProfitChart(ORDERS, 'profitChart');
    renderFilteredSummary(ORDERS);
    initDatepickers();
    initSearchInput();
  } catch (err) {
    console.error('Dashboard init error', err);
  }
})();
