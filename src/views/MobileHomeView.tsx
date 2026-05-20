import { ProfileCard } from '../components/ProfileCard';

export function MobileHomeView({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="flex md:hidden flex-1 flex-col gap-4 min-h-0 pb-2">
      <ProfileCard reducedMotion={reducedMotion} variant="mobile" />
    </div>
  );
}
