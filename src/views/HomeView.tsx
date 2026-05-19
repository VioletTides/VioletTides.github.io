import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticker } from '../components/Ticker';
import { ModuleHeader } from '../components/ModuleHeader';
import { GitHubRepoMetrics, LogEntry } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    filter: "brightness(2)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "brightness(1)",
    transition: { 
      duration: 0.4, 
      ease: "easeOut"
    }
  }
};

export const HomeView = ({
  logs,
  repoMetrics,
}: {
  logs: LogEntry[];
  repoMetrics: GitHubRepoMetrics;
}) => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="hidden md:flex flex-1 flex-col gap-6 min-h-0"
  >
    {/* Tickers */}
    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
      <Ticker 
        title="HARDWARE_CORE" 
        mod="MOD-01" 
        items={["ARM Cortex", "FPGA Design", "PCB Layout", "Oscilloscope", "RISC-V"]} 
      />
      <Ticker 
        title="SOFTWARE_STACK" 
        mod="MOD-02" 
        items={["C / C++ 20", "Rust Embedded", "RTOS / FreeRTOS", "Linux Kernel", "Python API"]} 
      />
    </motion.div>

    {/* Grid Modules */}
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex-1 bg-black/40 border border-white/10 flex flex-col min-h-[180px] relative">
          <div className="absolute inset-0 crt-bg-effect opacity-20 pointer-events-none" />
          <ModuleHeader title="CORE_PROCESSES" />
          <div className="p-3 text-[11px] text-amber-primary/70 overflow-hidden space-y-1 z-10">
            <div className="flex gap-4"><span className="opacity-30">01</span> <span className="amber-text-glow">CPU_IDLE_THREAD :: ACTIVE</span></div>
            <div className="flex gap-4"><span className="opacity-30">02</span> <span className="text-vfd-green green-text-glow">MEM_MGR_V1 :: STABLE (24GB)</span></div>
            <div className="flex gap-4"><span className="opacity-30 font-bold text-amber-primary">03</span> <span className="text-vfd-teal vfd-text-glow uppercase">SCHED_POLICY :: REALTIME</span></div>
            <div className="flex gap-4"><span className="opacity-30">04</span> <span className="amber-text-glow">INTERRUPT_VECTOR :: LISTENING</span></div>
            <div className="flex gap-4"><span className="opacity-30">05</span> <span className="amber-text-glow">DMA_CONTROLLER :: READY</span></div>
            <div className="flex gap-4"><span className="opacity-30">06</span> <span className="amber-text-glow">WATCHDOG_TIMER :: TICKING</span></div>
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:h-full">
        <div className="bg-black/40 border border-white/10 flex flex-col min-h-[220px] md:flex-[1.35] relative">
          <div className="absolute inset-0 crt-bg-effect opacity-20 pointer-events-none" />
          <ModuleHeader title="REPOSITORY_METRICS" right="V_042" />
          <div className="p-3 text-[11px] text-amber-primary/60 space-y-3 z-10">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-vfd-green green-text-glow">REPO_HEALTH: STABLE</span>
                <span className="text-vfd-green/80">82%</span>
              </div>
              <div className="h-1 bg-white/5 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '82%' }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute inset-y-0 bg-vfd-green/40 shadow-[0_0_5px_theme(colors.vfd-green)]" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-white/5 pb-1 amber-text-glow">
                <span>COMMITS_PUSHED:</span>
                <span className="text-amber-primary font-bold">
                  {repoMetrics.status === 'ready' && repoMetrics.count !== null
                    ? `${repoMetrics.count.toLocaleString()} COMMITS`
                    : repoMetrics.status === 'error'
                      ? 'SYNC_ERR'
                      : 'SYNCING'}
                </span>
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
                <span className={`uppercase ${
                  repoMetrics.deployStatus === 'success'
                    ? 'text-vfd-green green-text-glow'
                    : repoMetrics.deployStatus === 'failure'
                      ? 'text-vfd-red red-text-glow'
                      : repoMetrics.deployStatus === 'in_progress' || repoMetrics.deployStatus === 'queued'
                        ? 'text-amber-primary amber-text-glow'
                        : 'text-white/40'
                }`}>
                  {repoMetrics.status === 'error'
                    ? 'UNAVAILABLE'
                    : repoMetrics.deployStatus === 'unknown'
                      ? 'SYNCING'
                      : repoMetrics.deployStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 flex flex-col min-h-[120px] md:flex-[0.75] relative">
           <div className="absolute inset-0 crt-bg-effect opacity-20 pointer-events-none" />
           <div className="bg-[#1c1600] px-3 py-1.5 border-b border-amber-primary/20 flex justify-between items-center z-10">
            <span className="text-[10px] font-bold text-amber-primary amber-text-glow tracking-wider">VISITOR_TELEMETRY</span>
            <span className="text-[11px] text-vfd-green animate-pulse-live green-text-glow">SYNCED</span>
            <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
          </div>
          <div className="p-3 text-[11px] space-y-2 z-10 bg-black/40 flex-1">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-amber-primary/60 amber-text-glow">UNIQUE_VISITS</span>
              <span className="px-1.5 bg-amber-primary/20 text-amber-primary border border-amber-primary/40 amber-text-glow">12,408</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-amber-primary/60 amber-text-glow">SESSION_AVG</span>
              <span className="px-1.5 bg-vfd-green/10 text-vfd-green/80 border border-vfd-green/20 green-text-glow tracking-wider">04:12M</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>

     <motion.div variants={itemVariants} className="h-[200px] sm:h-[250px] md:h-[30%] bg-[#080600] border border-amber-primary/20 flex flex-col relative md:min-h-0">
        <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
        <div className="bg-[#1c1600] px-3 py-1.5 border-b border-amber-primary/20 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-vfd-green rounded-full animate-pulse-live shadow-[0_0_5px_theme(colors.vfd-green)]" />
            <span className="text-[11px] font-bold text-amber-primary amber-text-glow uppercase tracking-widest">SYSTEM_KERNEL_LOGS.EXE</span>
          </div>
          <span className="text-[11px] text-amber-primary/40 uppercase font-mono">Auto_Scroll: ON</span>
        </div>
        <div className="flex-1 p-3 text-[11px] font-mono space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide z-10">
          <AnimatePresence mode="popLayout">
            {logs.map((log) => (
              <motion.div 
                key={log.id} 
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 group"
              >
                <span className="text-white/20 shrink-0">{log.timestamp}</span>
                <span className={
                  log.type === 'warn' ? 'text-vfd-red brightness-125 red-text-glow' : 
                  log.type === 'success' ? 'text-vfd-green brightness-125 green-text-glow' : 
                  'text-amber-primary/60 amber-text-glow'
                }>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="pt-1 flex items-center gap-4">
            <span className="text-white/10">20:20:52</span>
            <span className="text-amber-primary/80 amber-text-glow ml-0 flex items-center">
              OPERATOR_ID: R0B1N // CMD_
              <div className="cursor ml-1 w-2 h-3.5 bg-amber-primary/40 animate-pulse" />
            </span>
          </div>
        </div>
     </motion.div>
  </motion.div>
);
