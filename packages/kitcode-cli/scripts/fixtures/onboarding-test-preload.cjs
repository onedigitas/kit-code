const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('kitcodeOnboarding', {
  selectFolders() {
    return ipcRenderer.invoke('kitcode:test-onboarding-select-folders');
  },
  submit(input) {
    return ipcRenderer.invoke('kitcode:test-onboarding-submit', input);
  },
  removeProject(projectId) {
    return ipcRenderer.invoke('kitcode:test-onboarding-remove-project', projectId);
  },
  initialState() {
    return ipcRenderer.invoke('kitcode:test-onboarding-initial-state');
  },
  close() {
    return ipcRenderer.invoke('kitcode:test-onboarding-close');
  },
});
