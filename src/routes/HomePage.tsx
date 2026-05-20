import { useAppOutlet } from '../hooks/useAppOutlet';
import { useIsMobile } from '../hooks/useIsMobile';
import { useRepoMetrics } from '../hooks/useRepoMetrics';
import { useSystemLogs } from '../hooks/useSystemLogs';
import { HomeView } from '../views/HomeView';
import { MobileHomeView } from '../views/MobileHomeView';

export function HomePage() {
  const { reducedMotion, sessionTelemetry } = useAppOutlet();
  const isMobile = useIsMobile();
  const desktopPanels = !isMobile;

  const logs = useSystemLogs(reducedMotion, desktopPanels);
  const repoMetrics = useRepoMetrics(desktopPanels);

  return (
    <>
      <MobileHomeView reducedMotion={reducedMotion} />
      <HomeView
        logs={logs}
        repoMetrics={repoMetrics}
        sessionTelemetry={sessionTelemetry}
        reducedMotion={reducedMotion}
      />
    </>
  );
}
