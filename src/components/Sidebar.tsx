import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const ROW_COUNT = 56;
const COLUMN_COUNT = 17;
const STREAM_SYMBOLS = ['+', '=', ':', '.', '*', '!', '/', '|', '0', '1', '<', '>', '#'];

const buildStreamRows = (tick: number) =>
  Array.from({ length: ROW_COUNT }, (_, rowIndex) => {
    const text = Array.from({ length: COLUMN_COUNT }, (_, colIndex) => {
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

const GLITCH_BANDS = [8, 24, 43, 61, 78];

export function Sidebar() {
  const shouldReduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  const streamRows = useMemo(() => buildStreamRows(shouldReduceMotion ? 0 : tick), [shouldReduceMotion, tick]);
  const ghostRows = useMemo(() => buildGhostRows(streamRows), [streamRows]);
  const rowSet = shouldReduceMotion ? [streamRows] : [streamRows, streamRows];
  const ghostRowSet = shouldReduceMotion ? [] : [ghostRows, ghostRows];

  useEffect(() => {
    if (shouldReduceMotion) return;

    const intervalId = window.setInterval(() => {
      setTick((currentTick) => (currentTick + 1) % 2048);
    }, 120);

    return () => window.clearInterval(intervalId);
  }, [shouldReduceMotion]);

  return (
    <div className="w-[220px] flex flex-col shrink-0 h-full py-2">
      <div>
        <div className="text-brand-red text-xs mb-4 uppercase tracking-widest leading-relaxed">
          // <br/>
          LIVE INSTALLATION
        </div>
        <p className="text-[11px] leading-relaxed text-brand-gray tracking-wide pr-4">
          Turning Vietnam's code into a national break counter.
        </p>
      </div>

      <div
        className="relative flex-1 min-h-0 overflow-hidden select-none font-mono text-[10px] leading-[14px] text-brand-red mt-4 mb-3"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)',
        }}
      >
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-x-0 top-0 text-brand-red/35 blur-[0.2px] mix-blend-screen"
            animate={{ y: ['-50%', '0%'], x: ['-9%', '4%', '-6%'] }}
            transition={{ y: { duration: 22, ease: 'linear', repeat: Infinity }, x: { duration: 6, ease: 'easeInOut', repeat: Infinity } }}
          >
            {ghostRowSet.map((rows, setIndex) => (
              <div key={setIndex} aria-hidden>
                {rows.map((row, rowIndex) => (
                  <motion.div
                    key={`ghost-${setIndex}-${rowIndex}`}
                    className="whitespace-nowrap tracking-[0.28em]"
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
          className="absolute inset-x-0 top-0"
          animate={shouldReduceMotion ? undefined : { y: ['0%', '-50%'] }}
          transition={shouldReduceMotion ? undefined : { duration: 24, ease: 'linear', repeat: Infinity }}
        >
          {rowSet.map((rows, setIndex) => (
            <div key={setIndex} aria-hidden={setIndex === 1}>
              {rows.map((row, rowIndex) => (
                <motion.div
                  key={`${setIndex}-${rowIndex}`}
                  className="whitespace-nowrap tracking-[0.3em]"
                  style={{
                    opacity: row.opacity,
                    textShadow: row.isHot ? '0 0 10px rgba(229, 9, 20, 0.65)' : 'none',
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
              className="pointer-events-none absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-brand-red/35 to-transparent mix-blend-screen"
              initial={{ y: '-20%' }}
              animate={{ y: ['-20%', '110%'] }}
              transition={{ duration: 3.8, ease: 'linear', repeat: Infinity }}
            />

            <div className="pointer-events-none absolute inset-0">
              {GLITCH_BANDS.map((top, index) => (
                <motion.div
                  key={top}
                  className="absolute left-0 h-px bg-brand-red shadow-[0_0_14px_rgba(229,9,20,0.9)]"
                  style={{ top: `${top}%` }}
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

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(229,9,20,0.08)_1px,transparent_1px)] bg-[length:100%_28px]" />
      </div>

      <div className="pb-2">
        <div className="text-brand-red text-xs font-bold uppercase tracking-widest">
          BREAK. TRACK. BUILD.
        </div>
        <div className="text-white text-xs mt-2 uppercase tracking-widest">
          EVERY SYMBOL COUNTS.
        </div>
      </div>
    </div>
  );
}
