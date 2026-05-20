import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const BOOT_LOGS = [
  'PRIMARY_INIT: VERIFYING KERNEL INTEGRITY...',
  'CORE_LOAD: ADDRESSING DMA CHANNELS... [OK]',
  'MEM_CHECK: 24576MB DETECTED... PASS',
  'FS_MOUNT: /PORTFOLIO/DEV MOUNTED [READ-ONLY]',
  'NET_STACK: ESTABLISHING QUANTUM LINK...',
  'HANDSHAKE: REMOTE_NODES_ACKNOWLEDGED',
  'DECOMPRESSING ENVIRONMENT ASSETS...',
  'LOADING CORE MODULES...',
  'BOOT_SEQUENCE_COMPLETE. WELCOME, OPERATOR.',
];

export function BootSequence({
  onComplete,
  onSkip,
  reducedMotion,
}: {
  onComplete: () => void;
  onSkip: () => void;
  reducedMotion: boolean;
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    let currentLogIndex = 0;
    const logInterval = window.setInterval(() => {
      if (currentLogIndex < BOOT_LOGS.length) {
        setLogs((prev) => [...prev, BOOT_LOGS[currentLogIndex]]);
        currentLogIndex += 1;
      } else {
        window.clearInterval(logInterval);
        window.setTimeout(onComplete, 800);
      }
    }, 300);

    const progressInterval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      window.clearInterval(logInterval);
      window.clearInterval(progressInterval);
    };
  }, [onComplete, reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: reducedMotion ? 1 : 1.1,
        filter: reducedMotion ? 'none' : 'blur(20px)',
        transition: { duration: reducedMotion ? 0 : 0.8, ease: 'easeInOut' },
      }}
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        onClick={onSkip}
        className="absolute top-4 right-4 z-[110] text-[10px] font-bold uppercase tracking-widest text-amber-primary/70 border border-amber-primary/30 px-3 py-1.5 hover:text-amber-primary hover:border-amber-primary/60"
      >
        Skip Intro
      </button>

      <div className="relative w-full max-w-4xl aspect-[4/3] bg-[#050705] overflow-hidden flex flex-col items-center justify-center rounded-[10%] shadow-[0_0_150px_rgba(0,0,0,1),inset_0_0_150px_rgba(0,0,0,1)] ring-1 ring-white/5 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(255,180,0,0.04)_0%,transparent_70%)]">
        <div
          className={`w-full h-full p-6 sm:p-10 md:p-20 flex flex-col justify-center space-y-6 relative z-10 ${
            reducedMotion ? '' : 'animate-[crt-flicker_0.15s_infinite]'
          }`}
        >
          <div className="space-y-1">
            <div className="text-[7px] text-amber-primary/30 mb-8 tracking-[0.3em] font-bold flex justify-between items-center bg-amber-primary/5 px-2 py-0.5 border-l-2 border-amber-primary/20">
              <span>SYSTEM_BOOT_LOG :: [V.1.0.42]</span>
              <span className="opacity-50">STATUS: INITIALIZING_CORE</span>
            </div>
            {logs.map((log, i) => (
              <motion.div
                key={`${i}-${log}`}
                initial={reducedMotion ? false : { opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-amber-primary/95 text-[10px] md:text-[12px] tracking-[0.1em] uppercase amber-text-glow leading-tight font-bold"
              >
                <span className="mr-3 text-amber-primary/40 brightness-150 inline-block w-4">
                  [{i}]
                </span>
                {log}
              </motion.div>
            ))}
            {logs.length < BOOT_LOGS.length && (
              <div className="flex gap-2 items-center mt-2">
                <span className="text-amber-primary/40 inline-block w-4">&gt;</span>
                <div className="w-1.5 h-3.5 bg-amber-primary/80 animate-[pulse_0.4s_infinite] amber-box-glow" />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-10 border-t border-amber-primary/10">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
              <div className="space-y-2 flex-1 w-full sm:max-w-[200px]">
                <div className="flex justify-between text-[7px] text-amber-primary/60 tracking-[0.2em] font-bold">
                  <span>BOOT_PROGRESS</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-0.5 bg-white/5 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-amber-primary amber-box-glow"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#1a1600] border border-amber-primary/30 p-2 min-w-[140px] w-full sm:w-auto relative overflow-hidden">
                <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[6px] text-amber-primary/40 font-bold uppercase">Link_Status</span>
                    <div
                      className={`w-1 h-1 rounded-full ${
                        progress > 50
                          ? 'status-led status-led-sm animate-pulse-live shadow-[0_0_5px_#00ff41]'
                          : 'bg-vfd-red/40 shadow-[0_0_2px_#ff3131]'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-[10px] font-bold tracking-widest uppercase ${
                      progress > 70 ? 'text-vfd-green green-text-glow' : 'text-amber-primary amber-text-glow'
                    }`}
                  >
                    {progress < 30 ? 'SEARCHING...' : progress < 70 ? 'HANDSHAKING' : 'LINK_ACTIVE'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.1)_0%,transparent_40%),radial-gradient(circle_at_60%_70%,rgba(255,255,255,0.05)_0%,transparent_30%)] z-20" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] noise-overlay z-30" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[length:100%_2px,2px_100%] z-40 opacity-70" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_180px_rgba(0,0,0,1)] z-50" />
      </div>

      <div className="scanline-overlay opacity-20" />
    </motion.div>
  );
}
