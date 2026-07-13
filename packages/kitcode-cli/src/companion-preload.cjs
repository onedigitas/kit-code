const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('kitcodeCompanion', {
  switchView(view) {
    return ipcRenderer.invoke('kitcode:companion-switch-view', view);
  },
  hide() {
    return ipcRenderer.invoke('kitcode:companion-hide');
  },
});
