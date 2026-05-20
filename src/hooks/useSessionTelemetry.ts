import { useEffect, useMemo, useState } from 'react';

import type { SessionTelemetry } from '../types';

const SESSION_STORAGE_KEY = 'engineer-core-session-v1';

type SessionRecord = {
  sessionId: string;
  startedAt: number;
};

function loadOrCreateSession(): SessionRecord {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as SessionRecord;
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  const session: SessionRecord = {
    sessionId: Math.random().toString(36).slice(2, 6).toUpperCase(),
    startedAt: Date.now(),
  };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

function formatSessionDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function useSessionTelemetry(): SessionTelemetry {
  const [session] = useState<SessionRecord>(() => loadOrCreateSession());
  const [durationMs, setDurationMs] = useState(() => Date.now() - session.startedAt);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDurationMs(Date.now() - session.startedAt);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session.startedAt]);

  return useMemo(
    () => ({
      sessionId: session.sessionId,
      durationLabel: formatSessionDuration(durationMs),
    }),
    [session.sessionId, durationMs],
  );
}
