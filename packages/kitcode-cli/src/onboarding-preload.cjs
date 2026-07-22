const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('kitcodeOnboarding', {
  selectFolders() {
    return ipcRenderer.invoke('kitcode:onboarding-select-folders');
  },
  submit(input) {
    return ipcRenderer.invoke('kitcode:onboarding-submit', input);
  },
  removeProject(projectId) {
    return ipcRenderer.invoke('kitcode:onboarding-remove-project', projectId);
  },
  initialState() {
    return ipcRenderer.invoke('kitcode:onboarding-initial-state');
  },
  close() {
    return ipcRenderer.invoke('kitcode:onboarding-close');
  },
});
