import { useOutletContext } from 'react-router-dom';

import type { SessionTelemetry } from '../types';

export type AppOutletContext = {
  reducedMotion: boolean;
  sessionTelemetry: SessionTelemetry;
};

export function useAppOutlet(): AppOutletContext {
  return useOutletContext<AppOutletContext>();
}
