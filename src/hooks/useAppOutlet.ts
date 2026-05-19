import { useOutletContext } from 'react-router-dom';

export type AppOutletContext = {
  reducedMotion: boolean;
  skipMountAnimation?: boolean;
};

export function useAppOutlet(): AppOutletContext {
  return useOutletContext<AppOutletContext>();
}
