import { useCallback, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, Radio, Download, Github, Linkedin } from 'lucide-react';

import { BootSequence } from './components/BootSequence';
import { SwipeableOutlet } from './components/SwipeableOutlet';
import { CONTACT_EMAIL, resumeUrl } from './constants/contact';
import { IMAGES } from './constants/images';
import {
  isProjectDetailPath,
  pathToSwipeView,
  viewToPath,
} from './constants/navigation';
import { useBootGate } from './hooks/useBootGate';
import { useIsMobile } from './hooks/useIsMobile';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSwipeTabs } from './hooks/useSwipeTabs';
import type { View } from './types';
import { pageMotionProps } from './motion/useMotionConfig';
import { trackPageView } from './lib/analytics';

const NAV_ITEMS = [
  { to: '/', label: 'HOME', end: true },
  { to: '/projects', label: 'PROJECTS', end: false },
  { to: '/contact', label: 'CONTACT', end: false },
] as const;

function navClassName(isActive: boolean) {
  return `h-full px-3 pt-2 md:pt-4 pb-2 text-xs font-bold uppercase transition-all relative focus-visible:text-amber-primary ${
    isActive
      ? 'text-amber-primary amber-text-glow border-b-2 border-amber-primary'
      : 'text-white/40 hover:text-amber-primary/80'
  }`;
}

export function AppShell() {
  const reducedMotion = useReducedMotion();
  const { isBooting, completeBoot, skipBoot } = useBootGate(reducedMotion);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const mainRef = useRef<HTMLElement>(null);

  const isHome = location.pathname === '/';
  const resumeHref = resumeUrl();
  const swipeView = pathToSwipeView(location.pathname);

  const navigateToView = useCallback(
    (view: View) => {
      navigate(viewToPath(view));
    },
    [navigate],
  );

  const swipeEnabled =
    isMobile && !isBooting && !isProjectDetailPath(location.pathname);

  const swipe = useSwipeTabs({
    enabled: swipeEnabled,
    currentView: swipeView,
    onNavigate: navigateToView,
  });

  const outletContext = {
    reducedMotion,
    skipMountAnimation: swipeEnabled,
  };

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      window.scrollTo(0, 0);
      return;
    }
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  const shellMotion = pageMotionProps(reducedMotion);

  return (
    <div className="min-h-[100dvh] bg-surface-dark flex items-start md:items-center justify-center md:p-4 selection:bg-amber-primary/30 selection:text-amber-primary relative font-mono overflow-x-hidden">
      <AnimatePresence mode="wait">
        {isBooting ? (
          <BootSequence
            key="boot"
            onComplete={completeBoot}
            onSkip={skipBoot}
            reducedMotion={reducedMotion}
          />
        ) : (
          <motion.div
            key="app"
            {...shellMotion}
            className="w-full max-w-[1600px] min-h-[100dvh] md:min-h-[700px] md:h-[90vh] md:max-h-[1000px] md:border border-white/10 bg-surface-card shadow-2xl relative flex flex-col md:overflow-hidden"
          >
            <div className={`scanline-overlay pointer-events-none ${reducedMotion ? 'opacity-10' : ''}`} />

            <header className="h-auto md:h-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-center px-4 md:px-6 py-4 md:py-0 bg-surface-header/80 backdrop-blur-sm z-10 shrink-0 gap-4 md:gap-0">
              <div className="flex items-center gap-3 text-amber-primary/90 amber-text-glow w-full md:w-auto">
                <Terminal size={14} className="text-amber-primary" />
                <span className="text-[12px] font-bold tracking-tighter">ENGINEER_CORE_V1.0</span>
              </div>

              <nav
                className="flex gap-2 sm:gap-4 md:gap-8 items-end h-full w-full md:w-auto justify-center md:justify-end"
                aria-label="Primary"
              >
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => navClassName(isActive)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <Cpu size={14} className={`text-white/40 ${reducedMotion ? '' : 'animate-flicker'}`} />
                <Radio size={14} className="text-white/40" />
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[10px] text-amber-primary/60 amber-text-glow">UPTIME: 99.98%</span>
              </div>
            </header>

            <main
              ref={mainRef}
              className="flex-1 flex flex-col md:grid md:grid-cols-9 gap-6 p-4 md:p-6 min-h-0 overflow-visible md:overflow-hidden relative scroll-smooth bg-black/20 touch-pan-y"
              onTouchStart={swipe.onTouchStart}
              onTouchMove={swipe.onTouchMove}
              onTouchEnd={swipe.onTouchEnd}
              onTouchCancel={swipe.onTouchCancel}
              aria-label="Main content. On mobile, swipe left or right to change section."
            >
              <section className="hidden md:flex md:col-span-3 flex-col gap-6 order-1 pb-4 md:pb-6">
                <div
                  className={`transition-all duration-500 ${!isHome ? 'md:opacity-40 md:hover:opacity-100' : ''}`}
                >
                  <div className="bg-surface-card border border-white/10 p-1 amber-box-glow max-w-[280px] sm:max-w-sm mx-auto md:max-w-none w-full">
                    <div className="bg-surface-dark border border-white/10 p-1 relative">
                      <div className="aspect-square relative overflow-hidden bg-black border border-white/10">
                        <img
                          src={IMAGES.PROFILE}
                          alt="Robin Anderson"
                          width={720}
                          height={720}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                          className="w-full h-full object-cover brightness-110 contrast-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                        {!reducedMotion && (
                          <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-transparent via-amber-primary/30 to-transparent animate-[ticker_4s_linear_infinite]" />
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-amber-primary/50 px-3 py-1 max-w-[calc(100%-2rem)]">
                          <span className="text-[9px] md:text-[10px] text-amber-primary amber-text-glow font-bold tracking-widest break-all">
                            UID: R0B1N // 4ND3R50N
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`space-y-4 text-center md:text-left transition-all duration-300 ${
                  !isHome ? 'hidden md:block' : 'block'
                }`}>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl text-amber-primary font-sans font-bold tracking-tight amber-text-glow uppercase leading-none">
                      ROBIN ANDERSON
                    </h1>
                  </div>
                  <div>
                    <p
                      className={`text-base sm:text-lg text-white/90 amber-text-glow font-sans font-medium ${
                        reducedMotion ? '' : 'blinking-cursor'
                      }`}
                    >
                      Embedded Systems Engineer
                    </p>
                  </div>

                  <div className="flex flex-row flex-wrap items-center gap-2 pt-2 justify-center md:justify-start">
                    <a
                      href={resumeHref}
                      download="Robin-Anderson-Resume.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Download resume PDF (${CONTACT_EMAIL})`}
                      className="bg-amber-primary text-black font-bold text-[10px] sm:text-[11px] px-4 sm:px-6 py-2.5 uppercase hover:brightness-110 transition-all border border-amber-primary flex items-center gap-2 amber-box-glow justify-center active:scale-95"
                    >
                      <Download size={14} />
                      DOWNLOAD_RESUME.PDF
                    </a>
                    <div className="flex gap-2 justify-center shrink-0">
                      <a
                        href="https://github.com/VioletTides"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open Robin Anderson GitHub profile"
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-white/10 text-white/60 hover:border-amber-primary hover:text-amber-primary transition-all hover:bg-amber-primary/5 active:scale-95"
                      >
                        <Github size={18} />
                      </a>
                      <a
                        href="https://linkedin.com/in/robin34anderson"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open Robin Anderson LinkedIn profile"
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-white/10 text-white/60 hover:border-amber-primary hover:text-amber-primary transition-all hover:bg-amber-primary/5 active:scale-95"
                      >
                        <Linkedin size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <section
                className="flex-1 md:col-span-6 flex flex-col gap-6 min-h-0 relative order-2 pb-4 md:pb-6 overflow-x-hidden"
                aria-live="polite"
                aria-atomic="true"
              >
                <SwipeableOutlet
                  reducedMotion={reducedMotion}
                  mobileFade={isMobile && swipeEnabled}
                  outletContext={outletContext}
                />
              </section>
            </main>

            <footer className="h-auto border-t border-white/10 bg-surface-header/50 backdrop-blur-sm flex flex-col md:flex-row items-center px-4 md:px-8 py-4 md:py-0 justify-between z-10 shrink-0 gap-4 md:gap-0 min-h-[3rem] md:min-h-12">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
                <span className="text-[11px] text-white/30 tracking-widest font-bold uppercase">
                  BUILD: {__BUILD_STAMP__}-STABLE
                </span>
                <span className="text-[11px] text-amber-primary/30 font-bold uppercase">HOST: CORE_TERMINAL_01</span>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 bg-vfd-green shadow-[0_0_8px_#00ff41] ${
                      reducedMotion ? '' : 'animate-pulse-live'
                    }`}
                  />
                  <span className="text-[11px] font-bold text-vfd-green green-text-glow uppercase">PWR_OK</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className={`w-2 h-2 bg-vfd-green shadow-[0_0_8px_#00ff41] ${
                      reducedMotion ? '' : 'animate-flicker'
                    }`}
                  />
                  <span className="text-[11px] font-bold text-vfd-green green-text-glow uppercase">LINK_ACT</span>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
