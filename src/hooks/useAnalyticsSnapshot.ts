import { useEffect, useState } from 'react';
import { fetchAnalyticsSnapshot } from '../lib/analytics';
import type { AnalyticsSnapshot } from '../types';

export function useAnalyticsSnapshot(enabled = true) {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>({ status: 'idle' });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    setSnapshot({ status: 'loading' });

    fetchAnalyticsSnapshot(controller.signal).then(setSnapshot);

    return () => controller.abort();
  }, [enabled]);

  return snapshot;
}
