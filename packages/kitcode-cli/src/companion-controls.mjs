export const COMPANION_HIDE_CSS = `
  .title-bar .dot-close {
    position: relative;
    z-index: 1;
    box-sizing: content-box;
    border: 0;
    padding: 6px;
    margin: -6px;
    display: grid;
    place-items: center;
    background: var(--red-color);
    background-clip: content-box;
    color: var(--bg-color);
    font: 700 9px/1 var(--font-mono);
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  .title-bar .dot-close::before {
    content: "×";
    opacity: 0;
  }

  .title-bar .dot-close:hover::before,
  .title-bar .dot-close:focus-visible::before {
    opacity: 1;
  }

  .title-bar .dot-close:focus-visible {
    outline: none;
  }
`;

export function renderCompanionTitleBar() {
  return `<div class="title-bar" title="Drag window">
    <button class="dot filled dot-close" id="hideButton" data-testid="companion-hide" type="button" aria-label="Hide companion" title="Hide"></button>
    <span class="dot" aria-hidden="true"></span>
    <span class="dot" aria-hidden="true"></span>
  </div>`;
}
