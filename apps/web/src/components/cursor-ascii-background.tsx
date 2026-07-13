import {useEffect, useMemo, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';

const ASCII_ROW_COUNT = 82;
const ASCII_COLUMN_COUNT = 320;
const ASCII_SYMBOLS = ['=', ':', '.', '+', '|', '0', '1', '/', '<', '>', '#'];
const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function buildAsciiRows(tick: number) {
  return Array.from({length: ASCII_ROW_COUNT}, (_, rowIndex) => {
    return Array.from({length: ASCII_COLUMN_COUNT}, (_, columnIndex) => {
      const field = (rowIndex * 17 + columnIndex * 23 + rowIndex * columnIndex * 3) % 41;
      const cluster = (Math.sin(rowIndex * 0.38) + Math.cos(columnIndex * 0.18)) * 10;
      const sparkle = (tick * 5 + rowIndex * 11 + columnIndex * 7) % 53;
      const shouldBlank = field < 9 || cluster < -7 || (rowIndex + columnIndex + Math.floor(tick / 4)) % 31 === 0;

      if (shouldBlank) {
        return ' ';
      }

      return ASCII_SYMBOLS[(field + rowIndex + columnIndex * 2 + (sparkle < 6 ? tick : 0)) % ASCII_SYMBOLS.length];
    }).join('');
  });
}

export function CursorAsciiBackground({className = ''}: {className?: string}) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  const asciiRows = useMemo(() => buildAsciiRows(shouldReduceMotion ? 0 : tick), [shouldReduceMotion, tick]);

  useEffect(() => {
    if (shouldReduceMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTick((currentTick) => (currentTick + 1) % 2048);
    }, 150);

    return () => window.clearInterval(intervalId);
  }, [shouldReduceMotion]);

  useEffect(() => {
    const layerElement = layerRef.current;

    if (!layerElement) {
      return undefined;
    }

    let frameId = 0;

    function updateCursor(clientX: number, clientY: number) {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const rect = layerElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
        const targetElement = document.elementFromPoint(clientX, clientY);
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

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div ref={layerRef} className={`cursor-ascii-background ${className}`} data-active="false" data-interactive="false" aria-hidden="true">
      <div className="cursor-ascii-layer cursor-ascii-layer-muted">
        {asciiRows.map((row, rowIndex) => (
          <div key={rowIndex}>{row}</div>
        ))}
      </div>
      <div className="cursor-ascii-primary-clip">
        <div className="cursor-ascii-layer cursor-ascii-layer-primary">
          {asciiRows.map((row, rowIndex) => (
            <div key={rowIndex}>{row}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
