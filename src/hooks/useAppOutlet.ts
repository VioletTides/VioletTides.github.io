import { useOutletContext } from 'react-router-dom';

export type AppOutletContext = {
  reducedMotion: boolean;
};

export function useAppOutlet(): AppOutletContext {
  return useOutletContext<AppOutletContext>();
}
