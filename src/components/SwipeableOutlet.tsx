import { motion } from 'motion/react';
import { useLocation, useOutlet } from 'react-router-dom';

import { mainTabRouteKey } from '../constants/navigation';
import type { AppOutletContext } from '../hooks/useAppOutlet';

export function SwipeableOutlet({
  reducedMotion,
  mobileFade,
  outletContext,
}: {
  reducedMotion: boolean;
  /** Short enter-only fade on mobile tab changes (no slide / AnimatePresence). */
  mobileFade: boolean;
  outletContext: AppOutletContext;
}) {
  const location = useLocation();
  const outlet = useOutlet(outletContext);
  const routeKey = mainTabRouteKey(location.pathname);

  const useFade = mobileFade && !reducedMotion;

  return (
    <motion.div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <motion.div
        key={routeKey}
        initial={useFade ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="flex-1 flex flex-col min-h-0 w-full overflow-y-auto overflow-x-hidden"
      >
        {outlet}
      </motion.div>
    </motion.div>
  );
}
