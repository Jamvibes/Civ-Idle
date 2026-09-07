const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld(
  'civDesktop',
  Object.freeze({
    loadSave: () => ipcRenderer.invoke('save:load'),
    saveGame: (raw) => ipcRenderer.invoke('save:write', raw),
  }),
);
