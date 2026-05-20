import { useState } from 'react';

import type { LogEntry } from '../types';

const KERNEL_LOG_LINES = 4;

const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: '08:42:01', message: 'INITIALIZING WEB_STACK_V2.0... [OK]', type: 'success' },
  { id: '2', timestamp: '08:42:10', message: '> GIT_SYNC: FETCHING MASTER BRANCH... [DONE]', type: 'success' },
  { id: '3', timestamp: '08:42:12', message: '> CDN_PROPAGATION: GLOBAL NODES ACTIVE... [OK]', type: 'success' },
  { id: '4', timestamp: '08:42:25', message: '> MODULE_LOAD: PORTFOLIO_CORE ONLINE... [OK]', type: 'success' },
];

export function useSystemLogs(_reducedMotion: boolean, enabled = true) {
  const [logs] = useState<LogEntry[]>(() => INITIAL_LOGS.slice(0, KERNEL_LOG_LINES));

  if (!enabled) {
    return [];
  }

  return logs;
}
