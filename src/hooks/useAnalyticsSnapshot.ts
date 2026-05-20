import { useMemo } from 'react';

import { getAnalyticsSnapshot } from '../lib/analytics';
import type { AnalyticsSnapshot } from '../types';

export function useAnalyticsSnapshot(enabled = true): AnalyticsSnapshot {
  return useMemo(() => {
    if (!enabled) {
      return { status: 'idle' };
    }
    return getAnalyticsSnapshot();
  }, [enabled]);
}
