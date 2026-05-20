import { motion, AnimatePresence } from 'motion/react';
import { isAnalyticsConfigured } from '../lib/analytics';
import {
  formatCommitCount,
  formatMetricsErrorLabel,
  formatVisitDuration,
} from '../lib/metricsDisplay';
import { containerVariants, itemVariants } from '../motion/variants';
import { motionVariants } from '../motion/useMotionConfig';
import { Ticker } from '../components/Ticker';
import { Panel } from '../components/Panel';
import type { AnalyticsSnapshot, GitHubRepoMetrics, LogEntry } from '../types';

export function AnalyticsPanel({ analytics }: { analytics: AnalyticsSnapshot }) {
  const syncLabel =
    analytics.status === 'ready'
      ? 'LIVE'
      : analytics.status === 'loading'
        ? 'SYNCING'
        : analytics.status === 'unconfigured'
          ? 'NO_SRC'
          : 'ERR';

  return (
    <Panel
      title="VISITOR_TELEMETRY"
      className="min-h-[120px] md:flex-[0.75]"
      bodyClassName="p-3 text-[11px] space-y-2 bg-black/40 flex-1"
    >
      <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-2">
        <span className="text-amber-primary/60 amber-text-glow">SOURCE</span>
        <span className="text-[10px] text-vfd-green green-text-glow uppercase">{syncLabel}</span>
      </div>

      {analytics.status === 'unconfigured' && (
        <p className="text-white/50 font-mono leading-relaxed">
          {import.meta.env.DEV ? (
            <>
              Set <span className="text-amber-primary/80">VITE_PLAUSIBLE_DOMAIN</span> and{' '}
              <span className="text-amber-primary/80">VITE_PLAUSIBLE_API_KEY</span> for live stats, or{' '}
              <span className="text-amber-primary/80">VITE_GA_MEASUREMENT_ID</span> for tracking only.
            </>
          ) : (
            'Visitor metrics are not configured for this build.'
          )}
        </p>
      )}

      {analytics.status === 'error' && (
        <p className="text-vfd-red/80 font-mono">Unable to load Plausible stats API.</p>
      )}

      {analytics.status === 'loading' && (
        <p className="text-amber-primary/60 font-mono">Pulling aggregate metrics…</p>
      )}

      {analytics.status === 'ready' && (
        <>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">VISITORS (30D)</span>
            <span className="px-1.5 bg-amber-primary/20 text-amber-primary border border-amber-primary/40 amber-text-glow">
              {analytics.visitors?.toLocaleString() ?? '—'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">PAGEVIEWS (30D)</span>
            <span className="px-1.5 bg-vfd-green/10 text-vfd-green/80 border border-vfd-green/20 green-text-glow">
              {analytics.pageviews?.toLocaleString() ?? '—'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">AVG_VISIT</span>
            <span className="text-vfd-teal/80 vfd-text-glow tracking-wider">
              {formatVisitDuration(analytics.visitDurationSeconds)}
            </span>
          </div>
          {analytics.bounceRate !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-amber-primary/60 amber-text-glow">BOUNCE_RATE</span>
              <span className="text-white/60">{Math.round(analytics.bounceRate)}%</span>
            </div>
          )}
        </>
      )}

      {isAnalyticsConfigured() && analytics.status === 'unconfigured' && (
        <p className="text-[10px] text-vfd-green/70">Page tracking script is active.</p>
      )}
    </Panel>
  );
}

export function RepoMetricsPanel({ repoMetrics }: { repoMetrics: GitHubRepoMetrics }) {
  return (
    <Panel title="REPOSITORY_METRICS" right="V_042" className="min-h-[220px] md:flex-[1.35]">
      <div className="text-[11px] text-amber-primary/60 space-y-3">
        {repoMetrics.cached && repoMetrics.status === 'ready' && (
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Cached snapshot</p>
        )}

        {repoMetrics.status === 'error' && (
          <p className="text-vfd-red/80 red-text-glow text-[10px] uppercase tracking-wider">
            {formatMetricsErrorLabel(repoMetrics)}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center border-b border-white/5 pb-1 amber-text-glow">
            <span>COMMITS:</span>
            <span className="text-amber-primary font-bold">{formatCommitCount(repoMetrics)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">LAST_PUSH_UTC</span>
            <span className="text-vfd-teal/70 vfd-text-glow uppercase">
              {repoMetrics.status === 'ready' && repoMetrics.lastPushIso
                ? new Date(repoMetrics.lastPushIso).toISOString().slice(0, 16).replace('T', ' ')
                : repoMetrics.status === 'error'
                  ? 'UNAVAILABLE'
                  : 'SYNCING'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">LATEST_COMMIT_SHA</span>
            <span className="text-vfd-green/80 green-text-glow uppercase">
              {repoMetrics.status === 'ready' && repoMetrics.latestSha
                ? repoMetrics.latestSha
                : repoMetrics.status === 'error'
                  ? 'UNAVAILABLE'
                  : 'SYNCING'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">TOP_LANGUAGE</span>
            <span className="text-amber-primary/80 amber-text-glow uppercase">
              {repoMetrics.status === 'ready' && repoMetrics.topLanguage
                ? repoMetrics.topLanguage
                : repoMetrics.status === 'error'
                  ? 'UNAVAILABLE'
                  : 'SYNCING'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-primary/60 amber-text-glow">DEPLOY_STATUS</span>
            <span
              className={`uppercase ${
                repoMetrics.deployStatus === 'success'
                  ? 'text-vfd-green green-text-glow'
                  : repoMetrics.deployStatus === 'failure'
                    ? 'text-vfd-red red-text-glow'
                    : repoMetrics.deployStatus === 'in_progress' ||
                        repoMetrics.deployStatus === 'queued'
                      ? 'text-amber-primary amber-text-glow'
                      : 'text-white/40'
              }`}
            >
              {repoMetrics.status === 'error'
                ? 'UNAVAILABLE'
                : repoMetrics.deployStatus === 'unknown'
                  ? 'SYNCING'
                  : repoMetrics.deployStatus}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

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
