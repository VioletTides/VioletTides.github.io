import type { SessionTelemetry } from '../types';
import { Panel } from './Panel';

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-3 border-b border-white/5 pb-1 last:border-b-0">
      <span className="text-amber-primary/60 amber-text-glow shrink-0">{label}</span>
      <span className="text-white/80 text-right truncate">{value}</span>
    </div>
  );
}

export function AnalyticsPanel({
  session,
  className = '',
}: {
  session: SessionTelemetry;
  className?: string;
}) {
  return (
    <Panel
      title="VISITOR_TELEMETRY"
      className={className}
      bodyClassName="p-3 text-[12px] space-y-2 bg-black/40"
    >
      <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-2">
        <span className="text-amber-primary/60 amber-text-glow">YOUR_SESSION</span>
        <span className="text-[11px] text-vfd-green green-text-glow uppercase">LIVE</span>
      </div>

      <StatRow label="SESSION_ID" value={session.sessionId} />
      <StatRow label="UPTIME" value={session.durationLabel} />
    </Panel>
  );
}
