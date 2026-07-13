import {useEffect, useMemo, useRef} from 'react';
import {useReducedMotion} from 'motion/react';

const DEFAULT_ASCII_ROW_COUNT = 56;
const DEFAULT_ASCII_COLUMN_COUNT = 120;
const ASCII_FRAME_COUNT = 6;
const ASCII_FRAME_INTERVAL_MS = 150;
const ASCII_TOKENS = ['==', '||', '//', '+', '-_'];
const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function buildAsciiRows(tick: number, rowCount: number, columnCount: number) {
  return Array.from({length: rowCount}, (_, rowIndex) => {
    return Array.from({length: columnCount}, (_, columnIndex) => {
      const field = (rowIndex * 17 + columnIndex * 23 + rowIndex * columnIndex * 3) % 67;
      const ridge = Math.abs(Math.sin(rowIndex * 0.34 + columnIndex * 0.11));
      const sparkle = (tick * 7 + rowIndex * 13 + columnIndex * 9) % 71;
      const shouldBlank = field % 23 === 0 && ridge < 0.22 && sparkle > 20;

      if (shouldBlank) {
        return ' ';
      }

      return ASCII_TOKENS[(field + rowIndex + columnIndex * 2 + (sparkle < 8 ? tick : 0)) % ASCII_TOKENS.length];
    }).join('');
  });
}

export function CursorAsciiBackground({
  className = '',
  revealOnly = false,
  showReveal = true,
  revealTargetSelector,
  revealTargetMode = 'rect',
  dimOnInteractive = true,
  rowCount = DEFAULT_ASCII_ROW_COUNT,
  columnCount = DEFAULT_ASCII_COLUMN_COUNT,
  animated = true,
}: {
  className?: string;
  revealOnly?: boolean;
  showReveal?: boolean;
  revealTargetSelector?: string;
  revealTargetMode?: 'rect' | 'horizontal-band';
  dimOnInteractive?: boolean;
  rowCount?: number;
  columnCount?: number;
  animated?: boolean;
}) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const mutedLayerRef = useRef<HTMLDivElement | null>(null);
  const primaryLayerRef = useRef<HTMLDivElement | null>(null);
  const targetRectRef = useRef<DOMRect | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const asciiFrames = useMemo(
    () => Array.from({length: ASCII_FRAME_COUNT}, (_, frameIndex) => buildAsciiRows(frameIndex, rowCount, columnCount)),
    [columnCount, rowCount],
  );
  const asciiRows = asciiFrames[0];

  useEffect(() => {
    if (shouldReduceMotion || !animated) {
      return undefined;
    }

    let frameIndex = 0;

    const intervalId = window.setInterval(() => {
      frameIndex = (frameIndex + 1) % asciiFrames.length;
      const frameRows = asciiFrames[frameIndex];

      for (const layerElement of [mutedLayerRef.current, primaryLayerRef.current]) {
        if (!layerElement) {
          continue;
        }

        frameRows.forEach((row, rowIndex) => {
          const rowElement = layerElement.children.item(rowIndex);

          if (rowElement) {
            rowElement.textContent = row;
          }
        });
      }
    }, ASCII_FRAME_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [animated, asciiFrames, shouldReduceMotion]);

  useEffect(() => {
    if (!showReveal) {
      return undefined;
    }

    const layerElement = layerRef.current;

    if (!layerElement) {
      return undefined;
    }

    let frameId = 0;

    function refreshTargetRect() {
      const targetZone = revealTargetSelector ? document.querySelector(revealTargetSelector) : layerElement;
      targetRectRef.current = targetZone?.getBoundingClientRect() ?? null;
    }

    refreshTargetRect();

    function updateCursor(clientX: number, clientY: number) {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const rect = layerElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const targetRect = targetRectRef.current;
        const isInsideLayer = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
        const isInsideTarget = targetRect
          ? revealTargetMode === 'horizontal-band'
            ? clientY >= targetRect.top && clientY <= targetRect.bottom
            : clientX >= targetRect.left && clientX <= targetRect.right && clientY >= targetRect.top && clientY <= targetRect.bottom
          : isInsideLayer;
        const isInside = isInsideLayer && isInsideTarget;
        const targetElement = dimOnInteractive ? document.elementFromPoint(clientX, clientY) : null;
        const isInteractive = targetElement instanceof Element && Boolean(targetElement.closest(INTERACTIVE_SELECTOR));

        layerElement.style.setProperty('--ascii-cursor-x', `${x}px`);
        layerElement.style.setProperty('--ascii-cursor-y', `${y}px`);
        layerElement.dataset.active = String(isInside);
        layerElement.dataset.interactive = String(isInside && isInteractive);
      });
    }

    function handlePointerMove(event: PointerEvent) {
      updateCursor(event.clientX, event.clientY);
    }

    function handlePointerLeave() {
      layerElement.dataset.active = 'false';
      layerElement.dataset.interactive = 'false';
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', refreshTargetRect);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', refreshTargetRect);
    };
  }, [dimOnInteractive, revealTargetMode, revealTargetSelector, showReveal]);

  return (
    <div
      ref={layerRef}
      className={`cursor-ascii-background ${className}`}
      data-active="false"
      data-interactive="false"
      data-reveal-only={String(revealOnly)}
      data-show-reveal={String(showReveal)}
      data-animated={String(animated && !shouldReduceMotion)}
      aria-hidden="true"
    >
      {revealOnly ? null : (
        <div ref={mutedLayerRef} className="cursor-ascii-layer cursor-ascii-layer-muted">
          {asciiRows.map((row, rowIndex) => (
            <div key={rowIndex}>{row}</div>
          ))}
        </div>
      )}
      {showReveal ? (
        <div className="cursor-ascii-primary-clip">
          <div ref={primaryLayerRef} className="cursor-ascii-layer cursor-ascii-layer-primary">
            {asciiRows.map((row, rowIndex) => (
              <div key={rowIndex}>{row}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
