import { useEffect, useState } from 'react';

import { MD_BREAKPOINT_PX } from '../constants/breakpoints';

/** Viewport below Tailwind `md:` (max-width 767px). */
export function useIsMobile(breakpointPx = MD_BREAKPOINT_PX): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < breakpointPx;
  });

  useEffect(() => {
    const query = `(max-width: ${breakpointPx - 1}px)`;
    const media = window.matchMedia(query);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [breakpointPx]);

  return isMobile;
}
