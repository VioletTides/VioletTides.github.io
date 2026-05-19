import { useEffect, useState } from 'react';
import { createLogId } from '../lib/logId';
import type { LogEntry } from '../types';

const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: '08:42:01', message: 'INITIALIZING WEB_STACK_V2.0... [OK]', type: 'success' },
  { id: '2', timestamp: '08:42:10', message: '> GIT_SYNC: FETCHING MASTER BRANCH... [DONE]', type: 'info' },
  { id: '3', timestamp: '08:42:12', message: '> CDN_PROPAGATION: GLOBAL NODES ACTIVE... [OK]', type: 'info' },
  { id: '4', timestamp: '08:42:25', message: 'WARNING: MEMORY_SPIKE DETECTED IN DMA_CHANNEL_0', type: 'warn' },
  { id: '5', timestamp: '08:42:28', message: '> AUTO_RECOVERY: BALANCING LOAD... [SUCCESS]', type: 'success' },
];

export function useSystemLogs(reducedMotion: boolean, enabled = true) {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  useEffect(() => {
    if (!enabled || reducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      const newLog: LogEntry = {
        id: createLogId(),
        timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        message: `SYSTEM_HEARTBEAT: CHANNEL_${Math.floor(Math.random() * 10)} REFRESHED... [OK]`,
        type: 'info',
      };
      setLogs((prev) => [...prev.slice(-10), newLog]);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [enabled, reducedMotion]);

  return logs;
}
