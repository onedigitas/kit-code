const {contextBridge, ipcRenderer} = require('electron');

const allowedModes = new Set(['terminal', 'compact', 'progress', 'watch']);

contextBridge.exposeInMainWorld('kitcodeTerminal', {
  setViewMode(mode) {
    if (!allowedModes.has(mode)) {
      return Promise.resolve({mode: 'terminal'});
    }

    return ipcRenderer.invoke('kitcode:set-view-mode', mode);
  },
});
