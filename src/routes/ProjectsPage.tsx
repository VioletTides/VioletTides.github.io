import { useAppOutlet } from '../hooks/useAppOutlet';
import { ProjectsView } from '../views/ProjectsView';

export function ProjectsPage() {
  const { reducedMotion } = useAppOutlet();
  return <ProjectsView reducedMotion={reducedMotion} />;
}
