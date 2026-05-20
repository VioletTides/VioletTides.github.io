import { motion } from 'motion/react';

import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { ActiveToolchainPanel } from '../components/home/ActiveToolchainPanel';
import { OperatorBriefPanel } from '../components/home/OperatorBriefPanel';
import { RepoMetricsPanel } from '../components/RepoMetricsPanel';
import { Ticker } from '../components/Ticker';
import { ACTIVE_TOOLCHAIN } from '../constants/operator';
import { containerVariants, itemVariants } from '../motion/variants';
import { motionVariants } from '../motion/useMotionConfig';
import type { GitHubRepoMetrics, LogEntry, SessionTelemetry } from '../types';

const STACK_TICKER = ACTIVE_TOOLCHAIN.map((item) => item.name);

export function HomeView({
  logs,
  repoMetrics,
  sessionTelemetry,
  reducedMotion,
}: {
  logs: LogEntry[];
  repoMetrics: GitHubRepoMetrics;
  sessionTelemetry: SessionTelemetry;
  reducedMotion: boolean;
}) {
  const variants = motionVariants(reducedMotion, containerVariants);
  const childVariants = motionVariants(reducedMotion, itemVariants);

  return (
    <motion.div
      variants={variants}
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
      className="hidden md:flex flex-1 flex-col gap-3 min-h-0 overflow-hidden"
    >
      <motion.div variants={childVariants} className="shrink-0 overflow-hidden isolate">
        <Ticker
          title="CORE_STACK"
          mod="MOD-00"
          items={STACK_TICKER}
          reducedMotion={reducedMotion}
        />
      </motion.div>

      <motion.div
        variants={childVariants}
        className="flex-1 grid grid-cols-2 grid-rows-[minmax(0,1fr)_minmax(0,13rem)] gap-3 min-h-0 overflow-hidden items-stretch"
      >
        <OperatorBriefPanel />
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <RepoMetricsPanel repoMetrics={repoMetrics} className="flex-1 min-h-0" />
          <AnalyticsPanel session={sessionTelemetry} className="shrink-0" />
        </div>
        <ActiveToolchainPanel className="col-span-2 row-start-2 min-h-0" />
      </motion.div>

      <motion.div
        variants={childVariants}
        className="shrink-0 h-[8.5rem] bg-[#080600] border border-amber-primary/20 flex flex-col relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
        <div className="bg-[#1c1600] px-3 py-1 border-b border-amber-primary/20 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="status-led status-led-sm" aria-hidden />
            <span className="text-[12px] font-bold text-amber-primary amber-text-glow uppercase tracking-widest">
              SYSTEM_KERNEL_LOGS.EXE
            </span>
          </div>
          <span className="text-[12px] text-amber-primary/40 uppercase font-mono">RING_BUFFER: 4</span>
        </div>
        <div className="flex-1 px-3 py-2 text-[12px] leading-relaxed font-mono space-y-1 overflow-hidden z-10">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 truncate">
              <span className="text-white/20 shrink-0">{log.timestamp}</span>
              <span
                className={`truncate ${
                  log.type === 'warn'
                    ? 'text-vfd-red brightness-125 red-text-glow'
                    : log.type === 'success'
                      ? 'text-vfd-green brightness-125 green-text-glow'
                      : 'text-amber-primary/60 amber-text-glow'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
