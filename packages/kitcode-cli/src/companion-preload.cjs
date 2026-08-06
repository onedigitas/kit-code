const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('kitcodeCompanion', {
  hide() {
    return ipcRenderer.invoke('kitcode:companion-hide');
  },
  openDashboard() {
    return ipcRenderer.invoke('kitcode:open-dashboard');
  },
});
