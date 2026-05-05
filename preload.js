const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  close: () => ipcRenderer.send('win-close'),
  minimize: () => ipcRenderer.send('win-minimize'),
  maximize: () => ipcRenderer.send('win-maximize'),

  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  checkLicense: () => ipcRenderer.invoke('check-license'),
  activateLicense: (key) => ipcRenderer.invoke('activate-license', key),

  getCurrency: () => ipcRenderer.invoke('get-currency'),
  setCurrency: (code) => ipcRenderer.invoke('set-currency', code),

  getTransactions: (filters) => ipcRenderer.invoke('get-transactions', filters),
  addTransaction: (t) => ipcRenderer.invoke('add-transaction', t),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
  getStats: () => ipcRenderer.invoke('get-stats'),

  exportExcel: () => ipcRenderer.invoke('export-excel'),
  getPdfData: () => ipcRenderer.invoke('get-pdf-data'),
  savePdf: (buffer) => ipcRenderer.invoke('save-pdf', buffer)
});
