/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Cpu, 
  Radio, 
  Download, 
  Github, 
  Linkedin
} from 'lucide-react';

import { LogEntry, View } from './types';
import { HomeView } from './views/HomeView';
import { ProjectsView } from './views/ProjectsView';
import { ContactView } from './views/ContactView';
import { IMAGES } from './constants/images';
import { BootSequence } from './components/BootSequence';

// Memoized view components to prevent re-renders when logs update
const MemoHome = React.memo(HomeView);
const MemoProjects = React.memo(ProjectsView);
const MemoContact = React.memo(ContactView);

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '08:42:01', message: 'INITIALIZING WEB_STACK_V2.0... [OK]', type: 'success' },
    { id: '2', timestamp: '08:42:10', message: '> GIT_SYNC: FETCHING MASTER BRANCH... [DONE]', type: 'info' },
    { id: '3', timestamp: '08:42:12', message: '> CDN_PROPAGATION: GLOBAL NODES ACTIVE... [OK]', type: 'info' },
    { id: '4', timestamp: '08:42:25', message: 'WARNING: MEMORY_SPIKE DETECTED IN DMA_CHANNEL_0', type: 'warn' },
    { id: '5', timestamp: '08:42:28', message: '> AUTO_RECOVERY: BALANCING LOAD... [SUCCESS]', type: 'success' },
  ]);

  const mainRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [currentView]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        message: `SYSTEM_HEARTBEAT: CHANNEL_${Math.floor(Math.random() * 10)} REFRESHED... [OK]`,
        type: 'info'
      };
      setLogs(prev => [...prev.slice(-10), newLog]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-surface-dark flex items-start md:items-center justify-center md:p-4 selection:bg-amber-primary/30 selection:text-amber-primary relative font-mono overflow-x-hidden">
      <AnimatePresence mode="wait">
        {isBooting ? (
          <BootSequence key="boot" onComplete={() => setIsBooting(false)} />
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[1600px] min-h-[100dvh] md:min-h-[700px] md:h-[90vh] md:max-h-[1000px] md:border border-white/10 bg-surface-card shadow-2xl relative flex flex-col md:overflow-hidden"
          >
            <div className="scanline-overlay pointer-events-none" />
            
            {/* Top Navigation */}
            <header className="h-auto md:h-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-center px-4 md:px-6 py-4 md:py-0 bg-surface-header/80 backdrop-blur-sm z-10 shrink-0 gap-4 md:gap-0">
          <div className="flex items-center gap-3 text-amber-primary/90 amber-text-glow w-full md:w-auto">
            <Terminal size={14} className="text-amber-primary" />
            <span className="text-[12px] font-bold tracking-tighter">ENGINEER_CORE_V1.0</span>
          </div>
          
          <nav className="flex gap-2 sm:gap-4 md:gap-8 items-end h-full w-full md:w-auto justify-center md:justify-end">
            {[
              { id: 'home', label: 'HOME' },
              { id: 'projects', label: 'PROJECTS' },
              { id: 'contact', label: 'CONTACT' }
            ].map((nav) => (
              <button 
                key={nav.id}
                onClick={() => setCurrentView(nav.id as View)}
                className={`
                  h-full px-3 pt-2 md:pt-4 pb-2 text-[10px] font-bold uppercase transition-all relative
                  ${currentView === nav.id 
                    ? 'text-amber-primary amber-text-glow border-b-2 border-amber-primary' 
                    : 'text-white/40 hover:text-amber-primary/80'}
                `}
              >
                {nav.label}
              </button>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            <Cpu size={14} className="text-white/40 animate-flicker" />
            <Radio size={14} className="text-white/40" />
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[10px] text-amber-primary/60 amber-text-glow">UPTIME: 99.98%</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main 
          ref={mainRef}
          className="flex-1 flex flex-col md:grid md:grid-cols-9 gap-6 p-4 md:p-6 min-h-0 overflow-y-auto md:overflow-hidden relative scroll-smooth bg-black/20"
        >
          
          {/* Identity Section (Sidebar) */}
          <section className="md:col-span-3 flex flex-col gap-6 order-1">
            <div className={`transition-all duration-500 ${currentView !== 'home' ? 'md:opacity-40 md:hover:opacity-100' : ''}`}>
              <div className="bg-surface-card border border-white/10 p-1 amber-box-glow max-w-[280px] sm:max-w-sm mx-auto md:max-w-none w-full">
                <div className="bg-surface-dark border border-white/10 p-1 relative">
                  <div className="aspect-square relative overflow-hidden bg-black border border-white/10">
                    <img 
                      src={IMAGES.PROFILE} 
                      alt="Robin Anderson"
                      width="720"
                      height="720"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      className="w-full h-full object-cover brightness-110 contrast-110"
                      onError={(e) => {
                        // Fallback in case the image fails to load
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                       <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-transparent via-amber-primary/30 to-transparent animate-[ticker_4s_linear_infinite]" />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-amber-primary/50 px-3 py-1 max-w-[calc(100%-2rem)]">
                      <span className="text-[9px] md:text-[10px] text-amber-primary amber-text-glow font-bold tracking-widest break-all">UID: R0B1N // 4ND3R50N</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`space-y-4 text-center md:text-left transition-all duration-300 ${currentView !== 'home' ? 'hidden md:block' : 'block'}`}>
              <div>
                <span className="text-[10px] text-white/40 mb-1 block tracking-widest uppercase font-bold">NAME_ARRAY</span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl text-amber-primary font-sans font-bold tracking-tight amber-text-glow uppercase leading-none">ROBIN ANDERSON</h1>
              </div>
              
              <div>
                <span className="text-[10px] text-white/40 mb-1 block tracking-widest uppercase font-bold">DESIGNATION</span>
                <p className="text-base sm:text-lg text-white/90 blinking-cursor amber-text-glow font-sans font-medium">Embedded Systems Engineer</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center md:justify-start">
                <a
                  href={`${import.meta.env.BASE_URL}Robin-Anderson-Resume.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-primary text-black font-bold text-[10px] sm:text-[11px] px-6 py-2.5 uppercase hover:brightness-110 transition-all border border-amber-primary flex items-center gap-2 amber-box-glow justify-center active:scale-95"
                >
                  <Download size={14} />
                  EXTRACT_RESUME.PDF
                </a>
                <div className="flex gap-2 justify-center">
                  <a 
                    href="https://github.com/robin-anderson" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-white/10 text-white/60 hover:border-amber-primary hover:text-amber-primary transition-all hover:bg-amber-primary/5 active:scale-95"
                  >
                    <Github size={18} />
                  </a>
                  <a 
                    href="https://linkedin.com/in/robin-anderson" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-white/10 text-white/60 hover:border-amber-primary hover:text-amber-primary transition-all hover:bg-amber-primary/5 active:scale-95"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic Content Modules */}
          <section className="md:col-span-6 flex flex-col gap-6 min-h-0 relative order-2 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-1 flex flex-col gap-6 min-h-0"
              >
                {currentView === 'home' && <MemoHome logs={logs} />}
                {currentView === 'projects' && <MemoProjects />}
                {currentView === 'contact' && <MemoContact />}
              </motion.div>
            </AnimatePresence>
          </section>
        </main>

        {/* Footer Status Bar */}
        <footer className="h-auto border-t border-white/10 bg-surface-header/50 backdrop-blur-sm flex flex-col md:flex-row items-center px-4 md:px-8 py-4 md:py-0 justify-between z-10 shrink-0 gap-4 md:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
             <span className="text-[9px] text-white/30 tracking-widest font-bold uppercase">BUILD: 2024.11.04-STABLE</span>
             <span className="text-[9px] text-amber-primary/30 font-bold uppercase">HOST: CORE_TERMINAL_01</span>
          </div>

          <div className="flex gap-6 md:gap-8">
            <a href="https://github.com/robin-anderson" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-white/40 hover:text-amber-primary underline underline-offset-2 transition-colors">GITHUB</a>
            <a href="https://linkedin.com/in/robin-anderson" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-white/40 hover:text-amber-primary underline underline-offset-2 transition-colors">LINKEDIN</a>
            <a href={`${import.meta.env.BASE_URL}Robin-Anderson-Resume.pdf`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-white/40 hover:text-amber-primary underline underline-offset-2 transition-colors">RESUME</a>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-vfd-green shadow-[0_0_8px_#00ff41] animate-pulse-live" />
              <span className="text-[9px] font-bold text-vfd-green green-text-glow uppercase">PWR_OK</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-vfd-green shadow-[0_0_8px_#00ff41] animate-flicker" />
              <span className="text-[9px] font-bold text-vfd-green green-text-glow uppercase">LINK_ACT</span>
            </div>
          </div>
        </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
