import { useEffect, useState } from 'react';

/** Matches Tailwind `md:` breakpoint (min-width 768px). */
export function useIsMobile(breakpointPx = 768): boolean {
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
