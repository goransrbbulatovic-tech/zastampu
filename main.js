const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');

let mainWindow;
let licenseValid = false;

// ─── JSON DATABASE ────────────────────────────────────────────────────────────
class JsonDB {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = { transactions: [], nextId: 1, settings: { currency: 'EUR' } };
    this._load();
  }
  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const loaded = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        this.data = loaded;
        if (!this.data.settings) this.data.settings = { currency: 'EUR' };
        if (!this.data.settings.currency) this.data.settings.currency = 'EUR';
      }
    } catch (e) { console.error('DB load error:', e.message); }
  }
  _save() {
    try { fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2)); }
    catch (e) { console.error('DB save error:', e.message); }
  }
  getSetting(key) { return this.data.settings[key]; }
  setSetting(key, value) { this.data.settings[key] = value; this._save(); }
  addTransaction(t) {
    const record = {
      id: this.data.nextId++,
      type: t.type,
      amount: parseFloat(t.amount),
      category: t.category || 'Ostalo',
      description: t.description || '',
      date: t.date,
      created_at: new Date().toISOString()
    };
    this.data.transactions.push(record);
    this._save();
    return record;
  }
  deleteTransaction(id) {
    const idx = this.data.transactions.findIndex(t => t.id === id);
    if (idx !== -1) { this.data.transactions.splice(idx, 1); this._save(); return true; }
    return false;
  }
  getTransactions(filters) {
    let r = [...this.data.transactions];
    if (filters.type) r = r.filter(t => t.type === filters.type);
    if (filters.dateFrom) r = r.filter(t => t.date >= filters.dateFrom);
    if (filters.dateTo) r = r.filter(t => t.date <= filters.dateTo);
    if (filters.category) r = r.filter(t => t.category === filters.category);
    r.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    if (filters.limit) r = r.slice(0, filters.limit);
    return r;
  }
  getStats() {
    const all = this.data.transactions;
    const totalZarada = all.filter(t => t.type === 'zarada').reduce((s, t) => s + t.amount, 0);
    const totalTrosak = all.filter(t => t.type === 'trosak').reduce((s, t) => s + t.amount, 0);
    const profit = totalZarada - totalTrosak;
    const margin = totalZarada > 0 ? ((profit / totalZarada) * 100).toFixed(1) : 0;
    const now = new Date();
    const mStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const mTxs = all.filter(t => t.date.startsWith(mStr));
    const thisMonth = {
      zarada: mTxs.filter(t=>t.type==='zarada').reduce((s,t)=>s+t.amount,0),
      trosak: mTxs.filter(t=>t.type==='trosak').reduce((s,t)=>s+t.amount,0)
    };
    const monthMap = {};
    all.forEach(t => {
      const m = t.date.substring(0,7);
      if (!monthMap[m]) monthMap[m] = { month:m, zarada:0, trosak:0 };
      monthMap[m][t.type] += t.amount;
    });
    const byMonth = Object.values(monthMap).sort((a,b)=>a.month.localeCompare(b.month)).slice(-12);
    const catMap = {};
    all.forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = { category:t.category, zarada:0, trosak:0 };
      catMap[t.category][t.type] += t.amount;
    });
    return {
      total: { totalZarada, totalTrosak, profit, margin, count: all.length },
      thisMonth, byMonth, byCategory: Object.values(catMap)
    };
  }
}

let db;
function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'zastampu-data.json');
  db = new JsonDB(dbPath);
}

// ─── LICENSE ──────────────────────────────────────────────────────────────────
const LICENSE_SECRET = 'ZaStampu@2024#PrintMaster!Key';
function getMachineId() {
  const parts = [os.hostname(), os.platform(), os.arch(),
    (os.cpus()[0] && os.cpus()[0].model) ? os.cpus()[0].model : 'cpu',
    os.userInfo().username];
  return crypto.createHash('sha256').update(parts.join(':::')).digest('hex').substring(0,16).toUpperCase();
}
function generateExpectedKey(machineId) {
  const hex = crypto.createHmac('sha256', LICENSE_SECRET).update(machineId).digest('hex');
  return [hex.substring(0,4),hex.substring(4,8),hex.substring(8,12),hex.substring(12,16)].map(p=>p.toUpperCase()).join('-');
}
function validateLicense(key) { return key.toUpperCase().trim() === generateExpectedKey(getMachineId()); }
function checkStoredLicense() {
  try {
    const lPath = path.join(app.getPath('userData'), '.lic');
    if (fs.existsSync(lPath)) {
      const d = JSON.parse(Buffer.from(fs.readFileSync(lPath, 'utf8'), 'base64').toString('utf8'));
      return d.machineId === getMachineId() && validateLicense(d.key);
    }
  } catch (e) {}
  return false;
}
function storeLicense(key) {
  const lPath = path.join(app.getPath('userData'), '.lic');
  fs.writeFileSync(lPath, Buffer.from(JSON.stringify({ key, machineId: getMachineId(), ts: Date.now() })).toString('base64'));
}

// ─── WINDOW ───────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800, minWidth: 900, minHeight: 600,
    frame: false, backgroundColor: '#0a0a0a',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  Menu.setApplicationMenu(null);
}
app.whenReady().then(() => { initDatabase(); licenseValid = checkStoredLicense(); createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ─── IPC ──────────────────────────────────────────────────────────────────────
ipcMain.on('win-close', () => mainWindow.close());
ipcMain.on('win-minimize', () => mainWindow.minimize());
ipcMain.on('win-maximize', () => { mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); });

ipcMain.handle('get-machine-id', () => getMachineId());
ipcMain.handle('check-license', () => licenseValid);
ipcMain.handle('activate-license', (_, key) => {
  if (validateLicense(key)) { storeLicense(key); licenseValid = true; return { success: true }; }
  return { success: false, message: 'Nevažeći ključ ili ključ ne odgovara ovom računaru.' };
});

// Currency settings
ipcMain.handle('get-currency', () => { try { return db.getSetting('currency') || 'EUR'; } catch(e) { return 'EUR'; } });
ipcMain.handle('set-currency', (_, code) => { try { db.setSetting('currency', code); return { success: true }; } catch(e) { return { success: false }; } });

ipcMain.handle('get-transactions', (_, f) => { try { return db.getTransactions(f||{}); } catch(e) { return []; } });
ipcMain.handle('add-transaction', (_, t) => { try { const r=db.addTransaction(t); return {success:true,id:r.id}; } catch(e) { return {success:false,message:e.message}; } });
ipcMain.handle('delete-transaction', (_, id) => { try { db.deleteTransaction(id); return {success:true}; } catch(e) { return {success:false}; } });
ipcMain.handle('get-stats', () => { try { return db.getStats(); } catch(e) { return null; } });

ipcMain.handle('export-excel', async () => {
  try {
    const currency = db.getSetting('currency') || 'EUR';
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: `zastampu-izvjestaj-${new Date().toISOString().slice(0,10)}.xlsx`,
      filters: [{ name:'Excel', extensions:['xlsx'] }]
    });
    if (!filePath) return { success: false };
    const XLSX = require('xlsx');
    const transactions = db.getTransactions({});
    const stats = db.getStats().total;
    const profit = stats.totalZarada - stats.totalTrosak;
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['#','Tip',`Iznos (${currency})`,'Kategorija','Opis','Datum'],
      ...transactions.map(t => [t.id, t.type==='zarada'?'Zarada':'Trošak', parseFloat(t.amount.toFixed(2)), t.category, t.description, t.date])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{wch:5},{wch:10},{wch:14},{wch:18},{wch:30},{wch:12}];
    XLSX.utils.book_append_sheet(wb, ws, 'Transakcije');
    const wsSummary = XLSX.utils.aoa_to_sheet([
      ['IZVJEŠTAJ - ZA STAMPU',''],
      ['Valuta:', currency],
      ['Datum:', new Date().toLocaleDateString('bs-BA')],
      ['',''],
      ['UKUPNA ZARADA:', parseFloat(stats.totalZarada.toFixed(2))],
      ['UKUPNI TROŠKOVI:', parseFloat(stats.totalTrosak.toFixed(2))],
      ['UKUPAN PROFIT:', parseFloat(profit.toFixed(2))],
      ['PROFITNA MARŽA:', stats.totalZarada>0 ? parseFloat(((profit/stats.totalZarada)*100).toFixed(1)) : 0],
      ['BROJ TRANSAKCIJA:', stats.count]
    ]);
    wsSummary['!cols'] = [{wch:22},{wch:20}];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Sažetak');
    XLSX.writeFile(wb, filePath);
    shell.showItemInFolder(filePath);
    return { success: true };
  } catch(e) { return { success:false, message:e.message }; }
});

ipcMain.handle('get-pdf-data', () => {
  try { return { transactions: db.getTransactions({}), stats: db.getStats().total, currency: db.getSetting('currency') || 'EUR' }; }
  catch(e) { return null; }
});
ipcMain.handle('save-pdf', async (_, pdfBuffer) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: `zastampu-izvjestaj-${new Date().toISOString().slice(0,10)}.pdf`,
      filters: [{ name:'PDF', extensions:['pdf'] }]
    });
    if (!filePath) return { success: false };
    fs.writeFileSync(filePath, Buffer.from(pdfBuffer));
    shell.showItemInFolder(filePath);
    return { success: true };
  } catch(e) { return { success:false, message:e.message }; }
});
