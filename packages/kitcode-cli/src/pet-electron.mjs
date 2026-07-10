import {BrowserWindow, ipcMain, screen} from 'electron';
import {
  clampPetPosition,
  PET_HEIGHT,
  PET_WIDTH,
} from './pet-motion.mjs';

const INTRO_WAVE_MS = 1100;
const CLICK_FEEDBACK_MS = 720;
const DROP_FEEDBACK_MS = 360;

export function createPetController({ownerWindow, petUrl, preloadPath}) {
  let petWindow = null;
  let visible = false;
  let destroyed = false;
  let dragFeedbackTimer = null;
  let motionState = 'idle';
  let lastPosition = null;
  let dragStartPointer = null;
  let dragStartPosition = null;
  let lastDragPointerX = null;

  function sendOwnerVisibility() {
    if (!ownerWindow.isDestroyed()) {
      ownerWindow.webContents.send('kitcode:pet:visibility', visible);
    }
  }

  function sendPet(channel, value) {
    if (petWindow && !petWindow.isDestroyed()) {
      petWindow.webContents.send(channel, value);
    }
  }

  function setMotionState(nextState, options = {}) {
    if (!options.force && motionState === nextState) {
      return;
    }

    motionState = nextState;
    sendPet('kitcode:pet:motion-state', nextState);
  }

  function currentWorkArea() {
    if (!petWindow || petWindow.isDestroyed()) {
      return screen.getPrimaryDisplay().workArea;
    }

    return screen.getDisplayMatching(petWindow.getBounds()).workArea;
  }

  function clampWindowToDisplay() {
    if (!petWindow || petWindow.isDestroyed()) {
      return;
    }

    const [x, y] = petWindow.getPosition();
    const next = clampPetPosition({x, y}, currentWorkArea());
    if (next.x !== x || next.y !== y) {
      petWindow.setPosition(next.x, next.y, false);
    }
    lastPosition = next;
  }

  function stopMotionFeedback() {
    if (dragFeedbackTimer) {
      clearTimeout(dragFeedbackTimer);
      dragFeedbackTimer = null;
    }
    setMotionState('idle');
  }

  function showTimedMotion(state, duration) {
    setMotionState(state, {force: true});
    if (dragFeedbackTimer) {
      clearTimeout(dragFeedbackTimer);
    }
    dragFeedbackTimer = setTimeout(() => {
      dragFeedbackTimer = null;
      setMotionState('idle');
    }, duration);
  }

  function dragWorkAreaFor(position) {
    const display = screen.getDisplayNearestPoint({
      x: Math.round(position.x + (PET_WIDTH / 2)),
      y: Math.round(position.y + (PET_HEIGHT / 2)),
    });
    return display.workArea;
  }

  function validPoint(value) {
    return value &&
      Number.isFinite(value.x) &&
      Number.isFinite(value.y);
  }

  function initialPosition() {
    if (lastPosition) {
      const display = screen.getDisplayNearestPoint(lastPosition);
      return clampPetPosition(lastPosition, display.workArea);
    }

    const {workArea} = screen.getPrimaryDisplay();
    return clampPetPosition({
      x: workArea.x + workArea.width - PET_WIDTH - 32,
      y: workArea.y + workArea.height - PET_HEIGHT - 72,
    }, workArea);
  }

  function createWindow() {
    if (petWindow && !petWindow.isDestroyed()) {
      return petWindow;
    }

    const position = initialPosition();
    petWindow = new BrowserWindow({
      width: PET_WIDTH,
      height: PET_HEIGHT,
      minWidth: PET_WIDTH,
      minHeight: PET_HEIGHT,
      maxWidth: PET_WIDTH,
      maxHeight: PET_HEIGHT,
      x: position.x,
      y: position.y,
      title: 'KitCode Pet',
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      resizable: false,
      movable: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      focusable: false,
      show: false,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    petWindow.setAlwaysOnTop(true, 'floating');
    petWindow.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
    petWindow.setIgnoreMouseEvents(false);
    petWindow.on('moved', () => {
      if (petWindow && !petWindow.isDestroyed()) {
        const [x, y] = petWindow.getPosition();
        lastPosition = {x, y};
      }
    });
    petWindow.on('closed', () => {
      petWindow = null;
      visible = false;
      dragStartPointer = null;
      dragStartPosition = null;
      lastDragPointerX = null;
      stopMotionFeedback();
      sendOwnerVisibility();
    });
    petWindow.once('ready-to-show', () => {
      if (!visible || !petWindow || petWindow.isDestroyed()) {
        return;
      }
      petWindow.showInactive();
      sendPet('kitcode:pet:visibility-state', true);
      showTimedMotion('waving', INTRO_WAVE_MS);
    });
    petWindow.loadURL(petUrl);
    return petWindow;
  }

  function setVisible(nextVisible) {
    visible = Boolean(nextVisible);
    const window = visible ? createWindow() : petWindow;

    if (visible) {
      if (window.webContents.isLoading()) {
        sendOwnerVisibility();
        return {visible};
      }
      window.showInactive();
      window.setIgnoreMouseEvents(false);
      sendPet('kitcode:pet:visibility-state', true);
      showTimedMotion('waving', INTRO_WAVE_MS);
    } else if (window && !window.isDestroyed()) {
      dragStartPointer = null;
      dragStartPosition = null;
      lastDragPointerX = null;
      stopMotionFeedback();
      sendPet('kitcode:pet:visibility-state', false);
      window.hide();
    }

    sendOwnerVisibility();
    return {visible};
  }

  function handleDisplayChange() {
    clampWindowToDisplay();
  }

  function handleDragStart(event, pointer) {
    if (!petWindow || petWindow.isDestroyed() || event.sender !== petWindow.webContents || !validPoint(pointer)) {
      return;
    }

    const [x, y] = petWindow.getPosition();
    dragStartPointer = {x: pointer.x, y: pointer.y};
    dragStartPosition = {x, y};
    lastDragPointerX = pointer.x;
    if (dragFeedbackTimer) {
      clearTimeout(dragFeedbackTimer);
      dragFeedbackTimer = null;
    }
    setMotionState('waving', {force: true});
  }

  function handleDragMove(event, pointer) {
    if (
      !petWindow ||
      petWindow.isDestroyed() ||
      event.sender !== petWindow.webContents ||
      !validPoint(pointer) ||
      !dragStartPointer ||
      !dragStartPosition
    ) {
      return;
    }

    const proposed = {
      x: Math.round(dragStartPosition.x + pointer.x - dragStartPointer.x),
      y: Math.round(dragStartPosition.y + pointer.y - dragStartPointer.y),
    };
    const next = clampPetPosition(proposed, dragWorkAreaFor(proposed));
    petWindow.setPosition(next.x, next.y, false);
    lastPosition = next;

    const deltaX = pointer.x - lastDragPointerX;
    if (deltaX < -1) {
      setMotionState('walking-left');
    } else if (deltaX > 1) {
      setMotionState('walking-right');
    }
    lastDragPointerX = pointer.x;
  }

  function handleDragEnd(event) {
    if (!petWindow || petWindow.isDestroyed() || event.sender !== petWindow.webContents) {
      return;
    }

    dragStartPointer = null;
    dragStartPosition = null;
    lastDragPointerX = null;
    showTimedMotion('waving', DROP_FEEDBACK_MS);
  }

  function handleClick(event) {
    if (!petWindow || petWindow.isDestroyed() || event.sender !== petWindow.webContents) {
      return;
    }

    dragStartPointer = null;
    dragStartPosition = null;
    lastDragPointerX = null;
    showTimedMotion('jumping', CLICK_FEEDBACK_MS);
  }

  function handleTerminalPetAction(event, action) {
    if (event.sender !== ownerWindow.webContents || typeof action !== 'string') {
      return;
    }

    sendPet('kitcode:pet:action', action);
  }

  ipcMain.handle('kitcode:set-pet-visible', (event, nextVisible) => {
    if (event.sender !== ownerWindow.webContents) {
      return {visible: false};
    }
    return setVisible(nextVisible);
  });
  ipcMain.handle('kitcode:get-pet-visible', (event) => ({
    visible: event.sender === ownerWindow.webContents && visible,
  }));
  ipcMain.on('kitcode:pet:drag-start', handleDragStart);
  ipcMain.on('kitcode:pet:drag-move', handleDragMove);
  ipcMain.on('kitcode:pet:drag-end', handleDragEnd);
  ipcMain.on('kitcode:pet:click', handleClick);
  ipcMain.on('kitcode:pet:terminal-action', handleTerminalPetAction);
  screen.on('display-removed', handleDisplayChange);
  screen.on('display-metrics-changed', handleDisplayChange);

  function destroy() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    visible = false;
    stopMotionFeedback();
    ipcMain.removeHandler('kitcode:set-pet-visible');
    ipcMain.removeHandler('kitcode:get-pet-visible');
    ipcMain.removeListener('kitcode:pet:drag-start', handleDragStart);
    ipcMain.removeListener('kitcode:pet:drag-move', handleDragMove);
    ipcMain.removeListener('kitcode:pet:drag-end', handleDragEnd);
    ipcMain.removeListener('kitcode:pet:click', handleClick);
    ipcMain.removeListener('kitcode:pet:terminal-action', handleTerminalPetAction);
    screen.removeListener('display-removed', handleDisplayChange);
    screen.removeListener('display-metrics-changed', handleDisplayChange);
    if (petWindow && !petWindow.isDestroyed()) {
      petWindow.destroy();
    }
    petWindow = null;
  }

  return {
    destroy,
    isVisible: () => visible,
    setVisible,
  };
}
