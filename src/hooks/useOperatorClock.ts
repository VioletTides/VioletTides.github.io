import { useEffect, useState } from 'react';

import { OPERATOR_TIMEZONE } from '../constants/operator';

function formatTorontoClock(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: OPERATOR_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
}

export function useOperatorClock(enabled = true): string {
  const [label, setLabel] = useState(() => formatTorontoClock(new Date()));

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const tick = () => setLabel(formatTorontoClock(new Date()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [enabled]);

  return label;
}
