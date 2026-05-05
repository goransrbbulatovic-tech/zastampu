// ── CURRENCY CONFIG ───────────────────────────────────────────
const CURRENCIES = {
  EUR: { symbol: '€',   name: 'Euro',             pos: 'after'  },
  USD: { symbol: '$',   name: 'US Dollar',         pos: 'before' },
  BAM: { symbol: 'KM',  name: 'Bosanska Marka',    pos: 'after'  },
  GBP: { symbol: '£',   name: 'British Pound',     pos: 'before' },
  CHF: { symbol: 'Fr',  name: 'Swiss Franc',       pos: 'after'  },
  RSD: { symbol: 'din', name: 'Srpski Dinar',      pos: 'after'  },
  HUF: { symbol: 'Ft',  name: 'Forint',            pos: 'after'  },
  CZK: { symbol: 'Kč',  name: 'Česká Koruna',      pos: 'after'  },
  PLN: { symbol: 'zł',  name: 'Polski Złoty',      pos: 'after'  },
  NOK: { symbol: 'kr',  name: 'Norsk Krone',       pos: 'after'  },
  SEK: { symbol: 'kr',  name: 'Svensk Krona',      pos: 'after'  },
  DKK: { symbol: 'kr',  name: 'Dansk Krone',       pos: 'after'  },
  TRY: { symbol: '₺',   name: 'Türk Lirası',       pos: 'before' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar',   pos: 'before' },
  AUD: { symbol: 'A$',  name: 'Australian Dollar', pos: 'before' },
  JPY: { symbol: '¥',   name: 'Japanski Jen',      pos: 'before' },
  CNY: { symbol: '¥',   name: 'Kineski Juan',      pos: 'before' },
};

// ── STATE ─────────────────────────────────────────────────────
let currentType = 'zarada';
let currentCurrency = 'EUR';
let chartMonthly = null, chartCategory = null, chartProfit = null;

// ── CURRENCY HELPERS ──────────────────────────────────────────
function fmt(amount) {
  const c = CURRENCIES[currentCurrency] || CURRENCIES['EUR'];
  const num = Number(amount).toFixed(2).replace('.', ',');
  return c.pos === 'before' ? `${c.symbol} ${num}` : `${num} ${c.symbol}`;
}

function currencySymbol() {
  return (CURRENCIES[currentCurrency] || CURRENCIES['EUR']).symbol;
}

function updateCurrencyLabels() {
  // Update all inline currency labels
  document.querySelectorAll('.currency-label-inline').forEach(el => {
    el.textContent = currencySymbol();
  });
}

async function changeCurrency(code) {
  currentCurrency = code;
  await window.api.setCurrency(code);
  updateCurrencyLabels();
  // Refresh current page data
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    const pageId = activePage.id;
    if (pageId === 'page-dashboard') await loadDashboard();
    else if (pageId === 'page-transactions') await loadTransactions();
    else if (pageId === 'page-statistics') await loadStatistics();
  }
  showToast(`Valuta promijenjena na ${code} (${currencySymbol()})`, 'info');
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  setTodayDate();
  setDefaultDate();

  const licensed = await window.api.checkLicense();
  if (!licensed) {
    showLicenseScreen();
  } else {
    hideLicenseScreen();
    await initApp();
  }
});

async function initApp() {
  // Load saved currency
  const savedCurrency = await window.api.getCurrency();
  if (savedCurrency && CURRENCIES[savedCurrency]) {
    currentCurrency = savedCurrency;
    const select = document.getElementById('currency-select');
    if (select) select.value = savedCurrency;
  }
  updateCurrencyLabels();
  await loadDashboard();
}

// ── LICENSE ───────────────────────────────────────────────────
async function showLicenseScreen() {
  document.getElementById('license-screen').style.display = 'flex';
  const machineId = await window.api.getMachineId();
  document.getElementById('machine-id-display').textContent = machineId;
}
function hideLicenseScreen() {
  document.getElementById('license-screen').style.display = 'none';
}
function formatKeyInput(input) {
  let v = input.value.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  let formatted = '';
  for (let i = 0; i < v.length && i < 16; i++) {
    if (i > 0 && i % 4 === 0) formatted += '-';
    formatted += v[i];
  }
  input.value = formatted;
}
async function activateLicense() {
  const key = document.getElementById('license-key-input').value.trim();
  const errEl = document.getElementById('license-error');
  if (key.length < 4) { errEl.textContent = 'Unesite licencni ključ.'; return; }
  errEl.textContent = 'Provjera...';
  const result = await window.api.activateLicense(key);
  if (result.success) {
    hideLicenseScreen();
    await initApp();
    showToast('Licenca aktivirana! Dobrodošli.', 'success');
  } else {
    errEl.textContent = result.message || 'Nevažeći ključ.';
  }
}
function copyMachineId() {
  const id = document.getElementById('machine-id-display').textContent;
  navigator.clipboard.writeText(id).then(() => showToast('ID kopiran u clipboard!', 'info'));
}

// ── NAVIGATION ────────────────────────────────────────────────
function navigate(page, el) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  else document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  document.getElementById(`page-${page}`).classList.add('active');
  if (page === 'dashboard') loadDashboard();
  else if (page === 'transactions') loadTransactions();
  else if (page === 'statistics') loadStatistics();
}

// ── DASHBOARD ─────────────────────────────────────────────────
async function loadDashboard() {
  const stats = await window.api.getStats();
  if (!stats) return;
  const { total, thisMonth } = stats;

  document.getElementById('kpi-zarada').textContent = fmt(total.totalZarada);
  document.getElementById('kpi-trosak').textContent = fmt(total.totalTrosak);
  document.getElementById('kpi-profit').textContent = fmt(total.profit);
  document.getElementById('kpi-margin').textContent = total.margin + '%';
  document.getElementById('kpi-count').textContent = 'Br. transakcija: ' + total.count;
  document.getElementById('kpi-zarada-month').textContent = 'Ovaj mj.: ' + fmt(thisMonth.zarada);
  document.getElementById('kpi-trosak-month').textContent = 'Ovaj mj.: ' + fmt(thisMonth.trosak);
  document.getElementById('kpi-profit-month').textContent = 'Ovaj mj.: ' + fmt(thisMonth.zarada - thisMonth.trosak);

  const recent = await window.api.getTransactions({ limit: 10 });
  const list = document.getElementById('recent-list');
  if (!recent.length) { list.innerHTML = '<div class="empty-state">Nema transakcija</div>'; return; }
  list.innerHTML = recent.map(t => `
    <div class="recent-item">
      <div class="recent-left">
        <div class="recent-dot ${t.type}"></div>
        <div class="recent-info">
          <span class="recent-cat">${t.category}</span>
          <span class="recent-desc">${t.description || '—'}</span>
        </div>
      </div>
      <div class="recent-right">
        <span class="recent-amount ${t.type}">${t.type === 'zarada' ? '+' : '-'}${fmt(t.amount)}</span>
        <span class="recent-date">${formatDate(t.date)}</span>
      </div>
    </div>
  `).join('');
}

// ── QUICK ADD ─────────────────────────────────────────────────
function setType(type) {
  currentType = type;
  const zBtn = document.getElementById('type-zarada');
  const tBtn = document.getElementById('type-trosak');
  zBtn.className = 'type-btn' + (type === 'zarada' ? ' active zarada-active' : '');
  tBtn.className = 'type-btn' + (type === 'trosak' ? ' active trosak-active' : '');
}
async function quickAdd() {
  const amount = parseFloat(document.getElementById('quick-amount').value);
  const category = document.getElementById('quick-category').value;
  const description = document.getElementById('quick-desc').value;
  const date = document.getElementById('quick-date').value;
  const msg = document.getElementById('quick-add-msg');
  if (!amount || amount <= 0) { showMsg(msg, 'Unesite validan iznos!', 'error'); return; }
  if (!date) { showMsg(msg, 'Unesite datum!', 'error'); return; }
  const result = await window.api.addTransaction({ type: currentType, amount, category, description, date });
  if (result.success) {
    showMsg(msg, '✓ Transakcija dodana!', 'success');
    document.getElementById('quick-amount').value = '';
    document.getElementById('quick-desc').value = '';
    setDefaultDate();
    await loadDashboard();
    showToast(`${currentType === 'zarada' ? '💰' : '💸'} ${fmt(amount)} dodano!`, currentType === 'zarada' ? 'success' : 'error');
  } else {
    showMsg(msg, 'Greška pri dodavanju.', 'error');
  }
}

// ── TRANSACTIONS ──────────────────────────────────────────────
async function loadTransactions() {
  const filters = {
    type: document.getElementById('filter-type').value,
    dateFrom: document.getElementById('filter-from').value,
    dateTo: document.getElementById('filter-to').value,
    category: document.getElementById('filter-cat').value
  };
  const transactions = await window.api.getTransactions(filters);
  const tbody = document.getElementById('transactions-tbody');
  if (!transactions.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nema transakcija</td></tr>';
    document.getElementById('transactions-total').innerHTML = '';
    return;
  }
  tbody.innerHTML = transactions.map(t => `
    <tr>
      <td style="color:var(--text-dim)">#${t.id}</td>
      <td><span class="badge ${t.type}">${t.type === 'zarada' ? 'Zarada' : 'Trošak'}</span></td>
      <td style="font-weight:700;color:${t.type === 'zarada' ? 'var(--zarada)' : 'var(--trosak)'}">
        ${t.type === 'zarada' ? '+' : '-'}${fmt(t.amount)}
      </td>
      <td>${t.category}</td>
      <td style="color:var(--text-muted)">${t.description || '—'}</td>
      <td>${formatDate(t.date)}</td>
      <td><button class="btn-delete" onclick="deleteTransaction(${t.id})">Obriši</button></td>
    </tr>
  `).join('');
  const totalZ = transactions.filter(t=>t.type==='zarada').reduce((s,t)=>s+t.amount,0);
  const totalT = transactions.filter(t=>t.type==='trosak').reduce((s,t)=>s+t.amount,0);
  document.getElementById('transactions-total').innerHTML = `
    <span>Zarada: <b style="color:var(--zarada)">${fmt(totalZ)}</b></span>
    <span>Troškovi: <b style="color:var(--trosak)">${fmt(totalT)}</b></span>
    <span>Profit: <b style="color:var(--gold)">${fmt(totalZ-totalT)}</b></span>
    <span style="color:var(--text-dim)">${transactions.length} transakcija</span>
  `;
}
async function deleteTransaction(id) {
  if (!confirm('Obrisati transakciju?')) return;
  const r = await window.api.deleteTransaction(id);
  if (r.success) { await loadTransactions(); await loadDashboard(); showToast('Transakcija obrisana.', 'info'); }
}
function clearFilters() {
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-from').value = '';
  document.getElementById('filter-to').value = '';
  document.getElementById('filter-cat').value = '';
  loadTransactions();
}

// ── STATISTICS ────────────────────────────────────────────────
async function loadStatistics() {
  const stats = await window.api.getStats();
  if (!stats) return;
  const { byMonth, byCategory } = stats;
  const sym = currencySymbol();
  const monthLabels = byMonth.map(m => formatMonth(m.month));

  destroyChart(chartMonthly);
  chartMonthly = new Chart(document.getElementById('chart-monthly'), {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [
        { label: 'Zarada', data: byMonth.map(m=>m.zarada), backgroundColor:'rgba(39,174,96,0.7)', borderColor:'#27ae60', borderWidth:1, borderRadius:4 },
        { label: 'Troškovi', data: byMonth.map(m=>m.trosak), backgroundColor:'rgba(231,76,60,0.7)', borderColor:'#e74c3c', borderWidth:1, borderRadius:4 }
      ]
    },
    options: chartOptions(sym)
  });

  const cats = byCategory.filter(c => c.zarada > 0);
  destroyChart(chartCategory);
  chartCategory = new Chart(document.getElementById('chart-category'), {
    type: 'doughnut',
    data: {
      labels: cats.map(c=>c.category),
      datasets: [{ data: cats.map(c=>c.zarada),
        backgroundColor:['#C9A84C','#27ae60','#2980b9','#8e44ad','#e74c3c','#e67e22','#1abc9c','#95a5a6','#f39c12'],
        borderColor:'#1a1a1a', borderWidth:2 }]
    },
    options: { responsive:true, maintainAspectRatio:true, plugins:{ legend:{ labels:{ color:'#888', font:{ size:12 } } } } }
  });

  destroyChart(chartProfit);
  chartProfit = new Chart(document.getElementById('chart-profit'), {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{ label:'Profit', data: byMonth.map(m=>m.zarada-m.trosak),
        borderColor:'#C9A84C', backgroundColor:'rgba(201,168,76,0.1)',
        pointBackgroundColor:'#C9A84C', tension:0.3, fill:true, borderWidth:2 }]
    },
    options: chartOptions(sym)
  });
}
function destroyChart(chart) { if (chart) chart.destroy(); }
function chartOptions(unit) {
  return {
    responsive:true, maintainAspectRatio:true,
    plugins:{ legend:{ labels:{ color:'#888', font:{ size:12 } } } },
    scales:{
      x:{ ticks:{ color:'#888' }, grid:{ color:'rgba(255,255,255,0.05)' } },
      y:{ ticks:{ color:'#888', callback: v => v + ' ' + unit }, grid:{ color:'rgba(255,255,255,0.05)' } }
    }
  };
}

// ── EXPORT ────────────────────────────────────────────────────
async function exportExcel() {
  const msg = document.getElementById('excel-msg');
  showMsg(msg, 'Izvoz u toku...', '');
  const result = await window.api.exportExcel();
  if (result.success) { showMsg(msg, '✓ Excel fajl sačuvan!', 'success'); showToast('Excel izvještaj uspješno izvezen!', 'success'); }
  else { showMsg(msg, result.message || 'Greška pri izvozu.', 'error'); }
}

async function exportPdf() {
  const msg = document.getElementById('pdf-msg');
  showMsg(msg, 'Kreiranje PDF-a...', '');
  try {
    const data = await window.api.getPdfData();
    if (!data) { showMsg(msg, 'Nema podataka.', 'error'); return; }
    const sym = (CURRENCIES[data.currency] || CURRENCIES['EUR']).symbol;
    const fmtPdf = (amount) => {
      const c = CURRENCIES[data.currency] || CURRENCIES['EUR'];
      const num = Number(amount).toFixed(2);
      return c.pos === 'before' ? `${c.symbol} ${num}` : `${num} ${c.symbol}`;
    };

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(10,10,10);
    doc.rect(0,0,210,40,'F');
    doc.setTextColor(201,168,76);
    doc.setFontSize(22); doc.setFont('helvetica','bold');
    doc.text('ZA STAMPU', 20, 20);
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.setTextColor(136,136,136);
    doc.text(`Izvještaj generisan: ${new Date().toLocaleDateString('bs-BA')}  |  Valuta: ${data.currency} (${sym})`, 20, 30);

    const profit = data.stats.totalZarada - data.stats.totalTrosak;
    const margin = data.stats.totalZarada > 0 ? ((profit/data.stats.totalZarada)*100).toFixed(1) : 0;

    doc.setFillColor(26,26,26);
    doc.roundedRect(15,45,180,35,3,3,'F');
    doc.setFontSize(9); doc.setTextColor(136,136,136);
    doc.text('UKUPNA ZARADA', 20, 55);
    doc.text('UKUPNI TROŠKOVI', 65, 55);
    doc.text('UKUPAN PROFIT', 110, 55);
    doc.text('PROFITNA MARŽA', 155, 55);
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.setTextColor(39,174,96);  doc.text(fmtPdf(data.stats.totalZarada), 20, 65);
    doc.setTextColor(231,76,60);  doc.text(fmtPdf(data.stats.totalTrosak), 65, 65);
    doc.setTextColor(201,168,76); doc.text(fmtPdf(profit), 110, 65);
    doc.setTextColor(41,128,185); doc.text(margin + '%', 155, 65);

    doc.setTextColor(240,240,240); doc.setFont('helvetica','bold'); doc.setFontSize(11);
    doc.text('Pregled Transakcija', 15, 92);

    doc.autoTable({
      startY: 97,
      head: [['#', 'Tip', `Iznos (${sym})`, 'Kategorija', 'Opis', 'Datum']],
      body: data.transactions.map(t => [
        t.id, t.type==='zarada'?'Zarada':'Trošak',
        (t.type==='trosak'?'-':'+')+t.amount.toFixed(2),
        t.category, (t.description||'').substring(0,25), t.date
      ]),
      theme: 'grid',
      styles: { fillColor:[26,26,26], textColor:[200,200,200], fontSize:9, lineColor:[40,40,40] },
      headStyles: { fillColor:[40,40,40], textColor:[201,168,76], fontStyle:'bold' },
      alternateRowStyles: { fillColor:[22,22,22] },
      columnStyles: { 2:{ halign:'right' } }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i=1; i<=pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(80,80,80);
      doc.text(`Za Stampu — Stranica ${i} od ${pageCount}`, 15, 287);
    }

    const result = await window.api.savePdf(new Uint8Array(doc.output('arraybuffer')));
    if (result.success) { showMsg(msg,'✓ PDF sačuvan!','success'); showToast('PDF izvještaj uspješno kreiran!','success'); }
    else { showMsg(msg,'Greška pri čuvanju.','error'); }
  } catch(e) { showMsg(msg,'Greška: '+e.message,'error'); }
}

// ── HELPERS ───────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('bs-BA', { day:'2-digit', month:'2-digit', year:'numeric' });
}
function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${y}`;
}
function setTodayDate() {
  const today = new Date().toLocaleDateString('bs-BA', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const el = document.getElementById('today-date');
  if (el) el.textContent = today.charAt(0).toUpperCase() + today.slice(1);
}
function setDefaultDate() {
  const el = document.getElementById('quick-date');
  if (el) el.value = new Date().toISOString().slice(0,10);
}
function showMsg(el, text, type) {
  el.textContent = text; el.className = 'form-msg ' + type;
  if (type === 'success') setTimeout(() => { el.textContent = ''; }, 3000);
}
let toastTimer;
function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3500);
}

setType('zarada');
