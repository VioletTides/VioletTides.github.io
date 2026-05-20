import { motion, AnimatePresence } from 'motion/react';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { Panel } from '../components/Panel';
import { RepoMetricsPanel } from '../components/RepoMetricsPanel';
import { Ticker } from '../components/Ticker';
import { containerVariants, itemVariants } from '../motion/variants';
import { motionVariants } from '../motion/useMotionConfig';
import type { AnalyticsSnapshot, GitHubRepoMetrics, LogEntry } from '../types';

export function HomeView({
  logs,
  repoMetrics,
  analytics,
  reducedMotion,
}: {
  logs: LogEntry[];
  repoMetrics: GitHubRepoMetrics;
  analytics: AnalyticsSnapshot;
  reducedMotion: boolean;
}) {
  const variants = motionVariants(reducedMotion, containerVariants);
  const childVariants = motionVariants(reducedMotion, itemVariants);

  return (
    <motion.div
      variants={variants}
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
      className="hidden md:flex flex-1 flex-col gap-6 min-h-0"
    >
      <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        <Ticker
          title="HARDWARE_CORE"
          mod="MOD-01"
          items={['ARM Cortex', 'FPGA Design', 'PCB Layout', 'Oscilloscope', 'RISC-V']}
          reducedMotion={reducedMotion}
        />
        <Ticker
          title="SOFTWARE_STACK"
          mod="MOD-02"
          items={['C / C++ 20', 'Rust Embedded', 'RTOS / FreeRTOS', 'Linux Kernel', 'Python API']}
          reducedMotion={reducedMotion}
        />
      </motion.div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <motion.div variants={childVariants} className="flex flex-col gap-4">
          <Panel title="CORE_PROCESSES" className="flex-1 min-h-[180px]">
            <div className="text-[11px] text-amber-primary/70 overflow-hidden space-y-1">
              <div className="flex gap-4">
                <span className="opacity-30">01</span>{' '}
                <span className="amber-text-glow">CPU_IDLE_THREAD :: ACTIVE</span>
              </div>
              <div className="flex gap-4">
                <span className="opacity-30">02</span>{' '}
                <span className="text-vfd-green green-text-glow">MEM_MGR_V1 :: STABLE (24GB)</span>
              </div>
              <div className="flex gap-4">
                <span className="opacity-30 font-bold text-amber-primary">03</span>{' '}
                <span className="text-vfd-teal vfd-text-glow uppercase">SCHED_POLICY :: REALTIME</span>
              </div>
            </div>
          </Panel>
        </motion.div>

        <motion.div variants={childVariants} className="flex flex-col gap-4 md:h-full">
          <RepoMetricsPanel repoMetrics={repoMetrics} />
          <AnalyticsPanel analytics={analytics} />
        </motion.div>
      </div>

      <motion.div
        variants={childVariants}
        className="h-[200px] sm:h-[250px] md:h-[30%] bg-[#080600] border border-amber-primary/20 flex flex-col relative md:min-h-0"
      >
        <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
        <div className="bg-[#1c1600] px-3 py-1.5 border-b border-amber-primary/20 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 bg-vfd-green rounded-full shadow-[0_0_5px_theme(colors.vfd-green)] ${
                reducedMotion ? '' : 'animate-pulse-live'
              }`}
            />
            <span className="text-[11px] font-bold text-amber-primary amber-text-glow uppercase tracking-widest">
              SYSTEM_KERNEL_LOGS.EXE
            </span>
          </div>
          <span className="text-[11px] text-amber-primary/40 uppercase font-mono">Auto_Scroll: ON</span>
        </div>
        <div className="flex-1 p-3 text-[11px] font-mono space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide z-10">
          <AnimatePresence mode={reducedMotion ? undefined : 'popLayout'}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                layout={!reducedMotion}
                initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0 }}
                className="flex gap-4 group"
              >
                <span className="text-white/20 shrink-0">{log.timestamp}</span>
                <span
                  className={
                    log.type === 'warn'
                      ? 'text-vfd-red brightness-125 red-text-glow'
                      : log.type === 'success'
                        ? 'text-vfd-green brightness-125 green-text-glow'
                        : 'text-amber-primary/60 amber-text-glow'
                  }
                >
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
