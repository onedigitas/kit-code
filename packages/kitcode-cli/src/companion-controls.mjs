export const COMPANION_SWITCHER_CSS = `
  .companion-control-dock {
    position: absolute;
    left: 50%;
    bottom: 4px;
    z-index: 8;
    display: flex;
    align-items: center;
    gap: 5px;
    transform: translateX(-29px);
    -webkit-app-region: no-drag;
  }

  .companion-switcher {
    width: 58px;
    height: 26px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
    padding: 2px;
    border: 1px solid rgba(252, 10, 10, 0.52);
    border-radius: 7px;
    background: rgba(9, 9, 9, 0.9);
    box-shadow: 0 5px 14px rgba(0, 0, 0, 0.32);
    -webkit-app-region: no-drag;
  }

  .companion-mode-button {
    width: 25px;
    height: 20px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: rgba(255, 248, 248, 0.62);
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  .companion-mode-button svg {
    width: 13px;
    height: 13px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .companion-mode-button[data-active="true"] {
    background: var(--primary, #fc0a0a);
    color: #100606;
  }

  .companion-mode-button:hover,
  .companion-mode-button:focus-visible {
    outline: 1px solid var(--primary, #fc0a0a);
    outline-offset: 1px;
    color: #ffffff;
  }

  .companion-mode-button[data-active="true"]:hover,
  .companion-mode-button[data-active="true"]:focus-visible {
    color: #100606;
  }

  .companion-hide {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 5px;
    background: rgba(9, 9, 9, 0.78);
    color: rgba(255, 248, 248, 0.68);
    cursor: pointer;
    font: 800 11px ui-monospace, monospace;
    -webkit-app-region: no-drag;
  }

  .companion-hide:hover,
  .companion-hide:focus-visible {
    border-color: var(--primary, #fc0a0a);
    outline: 0;
    color: #ffffff;
  }
`;

const miniIcon = `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="4" width="12" height="7" rx="1.5"></rect><path d="M5 13h6"></path></svg>`;
const petIcon = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.1 7.1C3.8 5.2 4.2 3.1 5.4 3.7c.7.3 1.2 1.1 1.5 1.8.7-.2 1.5-.2 2.2 0 .3-.7.8-1.5 1.5-1.8 1.2-.6 1.6 1.5.3 3.4.7.7 1.1 1.6 1.1 2.6 0 2-1.8 3.3-4 3.3s-4-1.3-4-3.3c0-1 .4-1.9 1.1-2.6Z"></path><path d="M6.5 9.5h.01M9.5 9.5h.01"></path></svg>`;

export function renderCompanionSwitcher(activeMode) {
  const miniActive = activeMode === 'mini';
  const petActive = activeMode === 'pet';

  return `<div class="companion-control-dock"><nav class="companion-switcher" aria-label="Companion view">
    <button class="companion-mode-button" id="miniModeButton" data-testid="companion-mode-mini" data-active="${miniActive}" type="button" title="Mini view" aria-label="Mini view" aria-pressed="${miniActive}">${miniIcon}</button>
    <button class="companion-mode-button" id="petModeButton" data-testid="companion-mode-pet" data-active="${petActive}" type="button" title="Pet view" aria-label="Pet view" aria-pressed="${petActive}">${petIcon}</button>
  </nav>
  <button class="companion-hide" id="hideButton" data-testid="companion-hide" type="button" title="Hide companion" aria-label="Hide companion">x</button></div>`;
}
