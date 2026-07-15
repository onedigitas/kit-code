import {useCallback, useEffect, useRef} from 'react';
import {useReducedMotion} from 'motion/react';

const CHAR_DENSE = ['0', 'O', '■', '▪', '█'];
const CHAR_MID = ['=', ':', '0', 'O'];
const CHAR_LIGHT = ['.', ':', '·'];
const FONT_SIZE = 13;
const FONT_WIDTH = FONT_SIZE * 0.72;
const FONT_HEIGHT = FONT_SIZE * 1.05;
const MAX_BRIGHTNESS = 155;
const FADE_RADIUS = 440;
const FADE_SIGMA = 168;
const RIM_START = 0.52;
const EDGE_NOISE = 24;
const CURSOR_SMOOTHING = 0.055;
const COMPONENT_SHRINK_RADIUS = 200;
const MIN_REVEAL_SCALE = 0.42;
const REVEAL_SCALE_SMOOTHING = 0.07;
const COMPONENT_DIM_RADIUS = 240;
const MIN_REVEAL_DIM = 0.18;
const REVEAL_DIM_SMOOTHING = 0.07;
const BACKGROUND_COLOR = '#010202';

const DEFAULT_COMPONENT_SELECTORS = [
  '.gateway-hero-spotlight',
  '.gateway-features',
  '.gateway-audience',
  '.gateway-agent-grid',
  '.gateway-video',
  '.gateway-topbar',
  '.gateway-footer',
];

type Cell = {
  c: number;
  r: number;
  base: number;
  seed: number;
  char: string;
  flickerPhase: number;
  nextSwap: number;
};

type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function hash2D(c: number, r: number) {
  const n = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function noise2D(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves: number, gain = 0.5) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;

  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2D(x * freq, y * freq);
    amp *= gain;
    freq *= 2;
  }

  return sum;
}

function pickSymbol(c: number, r: number, base: number, frameOffset = 0) {
  const h = hash2D(c * 2.1 + frameOffset, r * 3.3);
  const h2 = hash2D(c * 5.7 - frameOffset, r * 1.9);

  if (base > 0.68) {
    return CHAR_DENSE[Math.floor(h * CHAR_DENSE.length)];
  }
  if (base > 0.38) {
    return CHAR_MID[Math.floor(h2 * CHAR_MID.length)];
  }
  return CHAR_LIGHT[Math.floor(h * CHAR_LIGHT.length)];
}

function fixedShapeIntensity(c: number, r: number) {
  const continent = fbm(c * 0.034, r * 0.034, 4);
  const archipelago = fbm(c * 0.034 + 52.7, r * 0.034 - 23.1, 3);
  const extraLand = fbm(c * 0.046 - 31, r * 0.046 + 18, 4);
  const landBase = Math.max(continent, archipelago * 0.96, extraLand * 0.88);

  let landMask = smoothstep(0.28, 0.48, landBase);

  const lakes = fbm(c * 0.1 + 88, r * 0.1 - 41, 4);
  landMask *= 1 - smoothstep(0.66, 0.8, lakes) * 0.28;

  const bays = fbm(c * 0.055 - 19, r * 0.055 + 63, 3);
  landMask *= 1 - smoothstep(0.68, 0.84, bays) * 0.16;

  const erosion = fbm(c * 0.15, r * 0.15, 4);
  landMask *= smoothstep(0.08, 0.34, erosion + landMask * 0.55);

  const softPockets = fbm(c * 0.17 + 120, r * 0.17 - 55, 3);
  landMask *= 1 - smoothstep(0.7, 0.86, softPockets) * 0.14;

  if (landMask < 0.03) {
    return 0;
  }

  const terrain = fbm(c * 0.085, r * 0.085, 5);
  const density = smoothstep(0.1, 0.62, terrain);
  const sparse = noise2D(c * 0.13, r * 0.13);
  const sparseCut = 0.9 + sparse * 0.1;

  return landMask * Math.pow(density, 0.92) * sparseCut;
}

function distanceToRect(x: number, y: number, rect: Rect) {
  const closestX = Math.max(rect.left, Math.min(x, rect.right));
  const closestY = Math.max(rect.top, Math.min(y, rect.bottom));
  return Math.hypot(x - closestX, y - closestY);
}

function animateChar(cell: Cell, frame: number, time: number) {
  const flicker = 0.72 + 0.28 * Math.sin(time * 2.4 + cell.flickerPhase);
  const animated = Math.min(1, cell.base * flicker);

  if (frame >= cell.nextSwap) {
    cell.char = pickSymbol(cell.c, cell.r, animated, frame * 0.01);
    cell.nextSwap = frame + 10 + Math.floor(cell.seed * 45);
  }

  return cell.char;
}

export function GatewayAsciiCanvas({
  componentSelectors = DEFAULT_COMPONENT_SELECTORS,
}: {
  componentSelectors?: string[];
}) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef({
    cols: 0,
    rows: 0,
    cells: [] as Cell[],
    time: 0,
    frame: 0,
    pointerActive: false,
    targetCursorX: 0,
    targetCursorY: 0,
    cursorX: 0,
    cursorY: 0,
    revealScale: 1,
    targetRevealScale: 1,
    revealDim: 1,
    targetRevealDim: 1,
    componentRects: [] as Rect[],
  });

  const updateComponentRects = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const componentRects: Rect[] = [];

    componentSelectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      componentRects.push({
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        right: rect.right - containerRect.left,
        bottom: rect.bottom - containerRect.top,
      });
    });

    stateRef.current.componentRects = componentRects;
  }, [componentSelectors]);

  const buildGrid = useCallback(() => {
    const {cols, rows} = stateRef.current;
    const cells: Cell[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const base = fixedShapeIntensity(c, r);
        if (base <= 0) {
          continue;
        }

        cells.push({
          c,
          r,
          base,
          seed: hash2D(c * 3.7, r * 5.3),
          char: pickSymbol(c, r, base),
          flickerPhase: hash2D(c * 9.1, r * 2.3) * Math.PI * 2,
          nextSwap: Math.floor(hash2D(c, r) * 120),
        });
      }
    }

    stateRef.current.cells = cells;
  }, []);

  const resize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width;
    canvas.height = height;

    const state = stateRef.current;
    state.cols = Math.ceil(width / FONT_WIDTH);
    state.rows = Math.ceil(height / FONT_HEIGHT);
    state.targetCursorX = Math.min(state.targetCursorX, width);
    state.targetCursorY = Math.min(state.targetCursorY, height);
    state.cursorX = Math.min(state.cursorX, width);
    state.cursorY = Math.min(state.cursorY, height);

    buildGrid();
    updateComponentRects();
  }, [buildGrid, updateComponentRects]);

  useEffect(() => {
    if (shouldReduceMotion) {
      return undefined;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    const state = stateRef.current;
    state.targetCursorX = container.clientWidth / 2;
    state.targetCursorY = container.clientHeight / 2;
    state.cursorX = state.targetCursorX;
    state.cursorY = state.targetCursorY;

    function getCursorRevealScale() {
      let scale = 1;

      for (let i = 0; i < state.componentRects.length; i++) {
        const dist = distanceToRect(state.cursorX, state.cursorY, state.componentRects[i]);

        if (dist === 0) {
          scale = Math.min(scale, MIN_REVEAL_SCALE);
          continue;
        }

        if (dist < COMPONENT_SHRINK_RADIUS) {
          const t = dist / COMPONENT_SHRINK_RADIUS;
          const localScale = MIN_REVEAL_SCALE + (1 - MIN_REVEAL_SCALE) * smoothstep(0, 1, t);
          scale = Math.min(scale, localScale);
        }
      }

      return scale;
    }

    function getCursorRevealDim() {
      let dim = 1;

      for (let i = 0; i < state.componentRects.length; i++) {
        const dist = distanceToRect(state.cursorX, state.cursorY, state.componentRects[i]);

        if (dist === 0) {
          dim = Math.min(dim, MIN_REVEAL_DIM);
          continue;
        }

        if (dist < COMPONENT_DIM_RADIUS) {
          const t = dist / COMPONENT_DIM_RADIUS;
          const localDim = MIN_REVEAL_DIM + (1 - MIN_REVEAL_DIM) * smoothstep(0, 1, t);
          dim = Math.min(dim, localDim);
        }
      }

      return dim;
    }

    function getRevealFactor(px: number, py: number, activeFadeRadius: number, activeSigma: number) {
      if (!state.pointerActive) {
        return 0;
      }

      const dx = px - state.cursorX;
      const dy = py - state.cursorY;
      const edgeNoise = (hash2D(Math.floor(px / 14), Math.floor(py / 14)) - 0.5) * EDGE_NOISE;
      const dist = Math.max(0, Math.hypot(dx, dy) + edgeNoise);

      if (dist >= activeFadeRadius) {
        return 0;
      }

      const gaussian = Math.pow(
        Math.exp(-(dist * dist) / (2 * activeSigma * activeSigma)),
        1.12,
      );

      const outerStart = activeFadeRadius * RIM_START;
      let rimFade = 1;
      if (dist > outerStart) {
        const t = (activeFadeRadius - dist) / (activeFadeRadius - outerStart);
        rimFade = t * t * t;
      }

      return gaussian * rimFade;
    }

    let animationFrameId = 0;

    function draw() {
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      state.cursorX += (state.targetCursorX - state.cursorX) * CURSOR_SMOOTHING;
      state.cursorY += (state.targetCursorY - state.cursorY) * CURSOR_SMOOTHING;
      state.targetRevealScale = getCursorRevealScale();
      state.revealScale += (state.targetRevealScale - state.revealScale) * REVEAL_SCALE_SMOOTHING;
      state.targetRevealDim = getCursorRevealDim();
      state.revealDim += (state.targetRevealDim - state.revealDim) * REVEAL_DIM_SMOOTHING;

      const activeFadeRadius = FADE_RADIUS * state.revealScale;
      const activeSigma = FADE_SIGMA * state.revealScale;
      const activeBrightness = MAX_BRIGHTNESS * state.revealDim;

      ctx.font = `bold ${FONT_SIZE}px monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < state.cells.length; i++) {
        const cell = state.cells[i];
        const px = cell.c * FONT_WIDTH + FONT_WIDTH * 0.5;
        const py = cell.r * FONT_HEIGHT + FONT_HEIGHT * 0.5;

        if (state.pointerActive) {
          const minDistX = Math.abs(px - state.cursorX) - FONT_WIDTH;
          const minDistY = Math.abs(py - state.cursorY) - FONT_HEIGHT;
          if (Math.hypot(minDistX, minDistY) > activeFadeRadius) {
            continue;
          }
        } else {
          continue;
        }

        const reveal = getRevealFactor(px, py, activeFadeRadius, activeSigma);
        if (reveal <= 0.008) {
          continue;
        }

        const flicker = 0.72 + 0.28 * Math.sin(state.time * 2.4 + cell.flickerPhase);
        const brightness = Math.floor(cell.base * flicker * reveal * activeBrightness);

        if (brightness < 2) {
          continue;
        }

        const char = animateChar(cell, state.frame, state.time);

        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.fillText(char, cell.c * FONT_WIDTH, cell.r * FONT_HEIGHT);
      }

      state.time += 0.016;
      state.frame += 1;
      animationFrameId = window.requestAnimationFrame(draw);
    }

    function handlePointerMove(event: PointerEvent) {
      const containerRect = container.getBoundingClientRect();
      state.pointerActive = true;
      state.targetCursorX = event.clientX - containerRect.left;
      state.targetCursorY = event.clientY - containerRect.top;
    }

    function handlePointerLeave() {
      state.pointerActive = false;
    }

    resize();
    draw();

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', resize);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          resize();
        })
      : null;

    resizeObserver?.observe(container);

    const componentObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateComponentRects)
      : null;

    componentSelectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        componentObserver?.observe(element);
      }
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', resize);
      resizeObserver?.disconnect();
      componentObserver?.disconnect();
    };
  }, [componentSelectors, resize, shouldReduceMotion, updateComponentRects]);

  return (
    <div ref={containerRef} className="gateway-ascii-canvas" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
