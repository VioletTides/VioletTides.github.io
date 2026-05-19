import { MobileProfileHeader } from '../components/MobileProfileHeader';

export function MobileHomeView({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="flex md:hidden flex-1 flex-col gap-5 min-h-0 pb-2">
      <MobileProfileHeader reducedMotion={reducedMotion} />
    </div>
  );
}
