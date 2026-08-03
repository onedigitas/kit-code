const {contextBridge, ipcRenderer} = require('electron');

const allowedPetActions = new Set(['review']);

function subscribe(channel, listener) {
  const handler = (_event, value) => listener(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

contextBridge.exposeInMainWorld('kitcodeTerminal', {
  setPetVisible(visible) {
    return ipcRenderer.invoke('kitcode:set-pet-visible', Boolean(visible));
  },
  getPetVisible() {
    return ipcRenderer.invoke('kitcode:get-pet-visible');
  },
  triggerPetAction(action) {
    if (!allowedPetActions.has(action)) {
      return;
    }

    ipcRenderer.send('kitcode:pet:terminal-action', action);
  },
  onPetVisibilityChanged(listener) {
    return subscribe('kitcode:pet:visibility', listener);
  },
});
