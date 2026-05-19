import { useAppOutlet } from '../hooks/useAppOutlet';
import { ContactView } from '../views/ContactView';

export function ContactPage() {
  const { reducedMotion } = useAppOutlet();
  return <ContactView reducedMotion={reducedMotion} />;
}
