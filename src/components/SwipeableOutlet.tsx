import { useLocation, useOutlet } from 'react-router-dom';

import { mainTabRouteKey } from '../constants/navigation';
import type { AppOutletContext } from '../hooks/useAppOutlet';

export function SwipeableOutlet({ outletContext }: { outletContext: AppOutletContext }) {
  const location = useLocation();
  const outlet = useOutlet(outletContext);
  const routeKey = mainTabRouteKey(location.pathname);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <div
        key={routeKey}
        className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden overflow-y-auto md:overflow-hidden"
      >
        {outlet}
      </div>
    </div>
  );
}
