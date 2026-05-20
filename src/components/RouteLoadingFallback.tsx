import { LoaderCircle } from 'lucide-react';

export function RouteLoadingFallback({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center border border-white/10 bg-black/30 min-h-[12rem]">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-amber-primary/70">
        <LoaderCircle size={14} className="animate-spin" />
        {label}
      </div>
    </div>
  );
}
