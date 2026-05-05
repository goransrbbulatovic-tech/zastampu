const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Window controls
  close: () => ipcRenderer.send('win-close'),
  minimize: () => ipcRenderer.send('win-minimize'),
  maximize: () => ipcRenderer.send('win-maximize'),

  // License
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  checkLicense: () => ipcRenderer.invoke('check-license'),
  activateLicense: (key) => ipcRenderer.invoke('activate-license', key),

  // Transactions
  getTransactions: (filters) => ipcRenderer.invoke('get-transactions', filters),
  addTransaction: (t) => ipcRenderer.invoke('add-transaction', t),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
  getStats: () => ipcRenderer.invoke('get-stats'),

  // Export
  exportExcel: () => ipcRenderer.invoke('export-excel'),
  getPdfData: () => ipcRenderer.invoke('get-pdf-data'),
  savePdf: (buffer) => ipcRenderer.invoke('save-pdf', buffer)
});
