const {contextBridge, ipcRenderer} = require('electron');

function subscribe(channel, listener) {
  const handler = (_event, value) => listener(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

contextBridge.exposeInMainWorld('kitcodePet', {
  dragStart(point) {
    ipcRenderer.send('kitcode:pet:drag-start', point);
  },
  dragMove(point) {
    ipcRenderer.send('kitcode:pet:drag-move', point);
  },
  dragEnd() {
    ipcRenderer.send('kitcode:pet:drag-end');
  },
  click() {
    ipcRenderer.send('kitcode:pet:click');
  },
  onMotionState(listener) {
    return subscribe('kitcode:pet:motion-state', listener);
  },
  onAction(listener) {
    return subscribe('kitcode:pet:action', listener);
  },
  onVisibilityState(listener) {
    return subscribe('kitcode:pet:visibility-state', listener);
  },
});
