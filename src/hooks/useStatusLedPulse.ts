import { useEffect } from 'react';

const PULSE_PERIOD_MS = 2000;

function syncPulseDelay() {
  const delay = -(Date.now() % PULSE_PERIOD_MS);
  document.documentElement.style.setProperty('--status-led-pulse-delay', `${delay}ms`);
}

export function useStatusLedPulse(reducedMotion: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';

    if (reducedMotion) {
      return;
    }

    syncPulseDelay();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncPulseDelay();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [reducedMotion]);
}
