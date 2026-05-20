import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal } from 'lucide-react';

import { BootSequence } from './components/BootSequence';
import { ProfileCard } from './components/ProfileCard';
import { SwipeableOutlet } from './components/SwipeableOutlet';
import { useBootGate } from './hooks/useBootGate';
import { useIsMobile } from './hooks/useIsMobile';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useStatusLedPulse } from './hooks/useStatusLedPulse';
import { useSessionTelemetry } from './hooks/useSessionTelemetry';
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
  useStatusLedPulse(reducedMotion);
  const { isBooting, completeBoot, skipBoot } = useBootGate(reducedMotion);
  const location = useLocation();
  const isMobile = useIsMobile();
  const mainRef = useRef<HTMLElement>(null);

  const isHome = location.pathname === '/';
  const sessionTelemetry = useSessionTelemetry();

  const outletContext = { reducedMotion, sessionTelemetry };

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (isMobile) {
      window.scrollTo(0, 0);
      return;
    }
    mainRef.current?.scrollTo(0, 0);
  }, [isMobile, location.pathname]);

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
                <span className="text-[12px] font-bold tracking-tighter">PORTFOLIO_V1.0</span>
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

              <div className="hidden md:flex items-center">
                <span className="text-[10px] text-amber-primary/60 amber-text-glow">UPTIME: 99.98%</span>
              </div>
            </header>

            <main
              ref={mainRef}
              className="flex-1 flex flex-col md:grid md:grid-cols-9 gap-4 p-4 md:p-5 min-h-0 overflow-visible md:overflow-hidden relative scroll-smooth bg-black/20"
              aria-label="Main content"
            >
              <section className="hidden md:flex md:col-span-3 flex-col gap-4 order-1 pb-4 md:pb-6 min-h-0 relative z-20">
                <div
                  className={`flex flex-col gap-4 transition-all duration-500 ${!isHome ? 'md:opacity-40 md:hover:opacity-100' : ''}`}
                >
                  <ProfileCard reducedMotion={reducedMotion} variant="sidebar" />
                </div>
              </section>

              <section
                className="flex-1 md:col-span-6 flex flex-col gap-4 min-h-0 relative order-2 pb-4 md:pb-5 overflow-hidden isolate"
                aria-live="polite"
                aria-atomic="true"
              >
                <SwipeableOutlet outletContext={outletContext} />
              </section>
            </main>

            <footer className="h-auto border-t border-white/10 bg-surface-header/50 backdrop-blur-sm flex flex-col md:flex-row items-center px-4 md:px-8 py-4 md:py-0 justify-between z-10 shrink-0 gap-4 md:gap-0 min-h-[3rem] md:min-h-12">
              <span className="text-[11px] text-white/30 tracking-widest font-bold uppercase">
                BUILD: {__BUILD_STAMP__}-STABLE
              </span>
              <div className="flex items-center gap-2">
                <div className="status-led status-led-md" aria-hidden />
                <span className="text-[11px] font-bold text-vfd-green green-text-glow uppercase">PWR_OK</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
