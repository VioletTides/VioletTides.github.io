import type { ProjectStatus } from '../types';

const STATUS_STYLES: Record<ProjectStatus, string> = {
  STABLE: 'border-vfd-green/40 bg-vfd-green/10 text-vfd-green green-text-glow',
  ACTIVE: 'border-amber-primary/40 bg-amber-primary/10 text-amber-primary amber-text-glow',
  DELEGATED: 'border-vfd-teal/40 bg-vfd-teal/10 text-vfd-teal vfd-text-glow',
};

export function StatusBadge({
  status,
  pulse = false,
}: {
  status: ProjectStatus;
  pulse?: boolean;
}) {
  return (
    <span
      className={`text-[11px] font-mono border px-2 py-0.5 uppercase ${STATUS_STYLES[status]} ${
        pulse ? 'animate-pulse-live' : ''
      }`}
    >
      {status}
    </span>
  );
}
