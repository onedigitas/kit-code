const {contextBridge, ipcRenderer} = require('electron');
const channel = process.argv.find((arg) => arg.startsWith('--kitcode-pet-channel='))?.slice('--kitcode-pet-channel='.length) || 'kitcode';

function subscribe(channel, listener) {
  const handler = (_event, value) => listener(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

contextBridge.exposeInMainWorld('kitcodePet', {
  dragStart(point) {
    ipcRenderer.send(`${channel}:pet:drag-start`, point);
  },
  dragMove(point) {
    ipcRenderer.send(`${channel}:pet:drag-move`, point);
  },
  dragEnd() {
    ipcRenderer.send(`${channel}:pet:drag-end`);
  },
  click() {
    ipcRenderer.send(`${channel}:pet:click`);
  },
  onMotionState(listener) {
    return subscribe(`${channel}:pet:motion-state`, listener);
  },
  onAction(listener) {
    return subscribe(`${channel}:pet:action`, listener);
  },
  onVisibilityState(listener) {
    return subscribe(`${channel}:pet:visibility-state`, listener);
  },
  switchToMini() {
    return ipcRenderer.invoke(`${channel}:pet:switch-to-mini`);
  },
  hide() {
    return ipcRenderer.invoke(`${channel}:pet:hide`);
  },
});
