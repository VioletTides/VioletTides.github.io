import { useCallback, useState } from 'react';

const BOOT_SKIP_KEY = 'engineer-core-boot-complete';

export function useBootGate(reducedMotion: boolean) {
  const [isBooting, setIsBooting] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    if (reducedMotion) {
      return false;
    }

    return sessionStorage.getItem(BOOT_SKIP_KEY) !== '1';
  });

  const completeBoot = useCallback(() => {
    sessionStorage.setItem(BOOT_SKIP_KEY, '1');
    setIsBooting(false);
  }, []);

  const skipBoot = useCallback(() => {
    completeBoot();
  }, [completeBoot]);

  return { isBooting, completeBoot, skipBoot };
}
