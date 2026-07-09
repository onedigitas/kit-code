import {useEffect, useMemo, useRef, useState} from 'react';
import {motion, useReducedMotion} from 'motion/react';

const ROW_COUNT = 56;
const MIN_COLUMN_COUNT = 17;
const MAX_COLUMN_COUNT = 48;
const MONO_CHAR_WIDTH_PX = 6.02;
const STREAM_GUTTER_PX = 20;
const STREAM_MOTION_ALLOWANCE_PX = 18;
const STREAM_SYMBOLS = ['+', '=', ':', '.', '*', '!', '/', '|', '0', '1', '<', '>', '#'];
const GLITCH_BANDS = [8, 24, 43, 61, 78];

const getColumnCount = (width: number) => {
  const drawableWidth = width - STREAM_GUTTER_PX * 2 - STREAM_MOTION_ALLOWANCE_PX;
  const columns = Math.floor((drawableWidth + MONO_CHAR_WIDTH_PX) / (MONO_CHAR_WIDTH_PX * 2));

  return Math.min(MAX_COLUMN_COUNT, Math.max(MIN_COLUMN_COUNT, columns));
};

const buildStreamRows = (tick: number, columnCount: number) =>
  Array.from({length: ROW_COUNT}, (_, rowIndex) => {
    const text = Array.from({length: columnCount}, (_, colIndex) => {
      const pulse = tick * (1 + ((rowIndex + colIndex) % 4));
      const scramble = Math.floor(tick / 2) * ((rowIndex % 3) + 1);
      const symbolIndex = (rowIndex * 7 + colIndex * 11 + (rowIndex % 5) * colIndex + pulse + scramble) % STREAM_SYMBOLS.length;
      return STREAM_SYMBOLS[symbolIndex];
    }).join(' ');

    return {
      text,
      opacity: 0.32 + ((rowIndex * 13) % 35) / 100,
      isHot: rowIndex % 11 === 0 || rowIndex % 17 === 0,
      xOffset: rowIndex % 4 === 0 ? '0.18em' : rowIndex % 3 === 0 ? '-0.12em' : '0',
    };
  });

const buildGhostRows = (rows: ReturnType<typeof buildStreamRows>) => rows.map((row, rowIndex) => ({
  ...row,
  text: rowIndex % 2 === 0 ? row.text.split(' ').reverse().join(' ') : row.text.replaceAll('|', '1').replaceAll('.', '0'),
}));

export function SymbolStream({className = 'min-h-[160px] flex-1'}: {className?: string}) {
  const streamRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [columnCount, setColumnCount] = useState(MIN_COLUMN_COUNT);
  const streamRows = useMemo(
    () => buildStreamRows(shouldReduceMotion ? 0 : tick, columnCount),
    [columnCount, shouldReduceMotion, tick],
  );
  const ghostRows = useMemo(() => buildGhostRows(streamRows), [streamRows]);
  const rowSet = shouldReduceMotion ? [streamRows] : [streamRows, streamRows];
  const ghostRowSet = shouldReduceMotion ? [] : [ghostRows, ghostRows];

  useEffect(() => {
    const streamElement = streamRef.current;

    if (!streamElement) {
      return undefined;
    }

    const updateColumnCount = () => {
      setColumnCount(getColumnCount(streamElement.getBoundingClientRect().width));
    };

    updateColumnCount();

    const observer = new ResizeObserver(updateColumnCount);
    observer.observe(streamElement);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const intervalId = window.setInterval(() => {
      setTick((currentTick) => (currentTick + 1) % 2048);
    }, 120);

    return () => window.clearInterval(intervalId);
  }, [shouldReduceMotion]);

  return (
    <div
      ref={streamRef}
      className={`relative select-none overflow-hidden font-mono text-[10px] leading-[14px] text-brand-primary [--stream-gutter:1rem] sm:[--stream-gutter:1.25rem] ${className}`}
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)',
      }}
    >
      {!shouldReduceMotion && (
        <motion.div
          className="absolute top-0 text-brand-primary/35 blur-[0.2px] mix-blend-screen"
          style={{left: 'var(--stream-gutter)', right: 'var(--stream-gutter)'}}
          animate={{y: ['-50%', '0%'], x: ['-0.7em', '0.55em', '-0.45em']}}
          transition={{y: {duration: 22, ease: 'linear', repeat: Infinity}, x: {duration: 6, ease: 'easeInOut', repeat: Infinity}}}
        >
          {ghostRowSet.map((rows, setIndex) => (
            <div key={setIndex} aria-hidden>
              {rows.map((row, rowIndex) => (
                <motion.div
                  key={`ghost-${setIndex}-${rowIndex}`}
                  className="whitespace-nowrap"
                  animate={{
                    opacity: [0.08, row.isHot ? 0.48 : 0.22, 0.1],
                    x: rowIndex % 2 === 0 ? ['-0.4em', '0.7em', '-0.2em'] : ['0.5em', '-0.8em', '0.3em'],
                  }}
                  transition={{
                    duration: row.isHot ? 1.8 : 3.2,
                    delay: (rowIndex % 7) * 0.11,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }}
                >
                  {row.text}
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      <motion.div
        className="absolute top-0"
        style={{left: 'var(--stream-gutter)', right: 'var(--stream-gutter)'}}
        animate={shouldReduceMotion ? undefined : {y: ['0%', '-50%']}}
        transition={shouldReduceMotion ? undefined : {duration: 24, ease: 'linear', repeat: Infinity}}
      >
        {rowSet.map((rows, setIndex) => (
          <div key={setIndex} aria-hidden={setIndex === 1}>
            {rows.map((row, rowIndex) => (
              <motion.div
                key={`${setIndex}-${rowIndex}`}
                className="whitespace-nowrap"
                style={{
                  opacity: row.opacity,
                  textShadow: row.isHot ? '0 0 10px rgba(252, 10, 10, 0.65)' : 'none',
                }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: row.isHot
                          ? [row.opacity, 0.95, row.opacity * 0.78, row.opacity]
                          : [row.opacity, row.opacity + 0.12, row.opacity],
                        x: row.isHot
                          ? [row.xOffset, '-0.9em', '0.7em', row.xOffset]
                          : [row.xOffset, rowIndex % 2 === 0 ? '0.28em' : '-0.32em', row.xOffset],
                        filter: row.isHot ? ['brightness(1)', 'brightness(1.8)', 'brightness(0.85)', 'brightness(1)'] : undefined,
                      }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : {
                        duration: row.isHot ? 1.45 : 3.6,
                        delay: (rowIndex % 9) * 0.09,
                        repeat: Infinity,
                        repeatType: 'mirror',
                        ease: 'easeInOut',
                      }
                }
              >
                {row.text}
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>

      {!shouldReduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-brand-primary/35 to-transparent mix-blend-screen"
            initial={{y: '-20%'}}
            animate={{y: ['-20%', '110%']}}
            transition={{duration: 3.8, ease: 'linear', repeat: Infinity}}
          />

          <div className="pointer-events-none absolute inset-0">
            {GLITCH_BANDS.map((top, index) => (
              <motion.div
                key={top}
                className="absolute left-0 h-px bg-brand-primary shadow-[0_0_14px_rgba(252, 10, 10, 0.9)]"
                style={{top: `${top}%`}}
                animate={{
                  width: ['0%', index % 2 === 0 ? '96%' : '52%', '18%', '0%'],
                  x: ['-12%', '8%', '-4%', '24%'],
                  opacity: [0, 0.9, 0.35, 0],
                }}
                transition={{
                  duration: 1.15 + index * 0.18,
                  delay: index * 0.34,
                  repeat: Infinity,
                  repeatDelay: 1.6,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(252, 10, 10, 0.08)_1px,transparent_1px)] bg-[length:100%_28px]" />
    </div>
  );
}
