import { isAnalyticsConfigured } from '../lib/analytics';
import { formatVisitDuration } from '../lib/metricsDisplay';
import type { AnalyticsSnapshot } from '../types';
import { Panel } from './Panel';

export function AnalyticsPanel({ analytics }: { analytics: AnalyticsSnapshot }) {
  const syncLabel =
    analytics.status === 'ready'
      ? 'LIVE'
      : analytics.status === 'loading'
        ? 'SYNCING'
        : analytics.status === 'unconfigured'
          ? 'NO_SRC'
          : 'ERR';

  return (
    <Panel
      title="VISITOR_TELEMETRY"
      className="min-h-[120px] md:flex-[0.75]"
      bodyClassName="p-3 text-[11px] space-y-2 bg-black/40 flex-1"
    >
      <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-2">
        <span className="text-amber-primary/60 amber-text-glow">SOURCE</span>
        <span className="text-[10px] text-vfd-green green-text-glow uppercase">{syncLabel}</span>
      </div>

      {analytics.status === 'unconfigured' && (
        <p className="text-white/50 font-mono leading-relaxed">
          {import.meta.env.DEV ? (
            <>
              Set <span className="text-amber-primary/80">VITE_PLAUSIBLE_DOMAIN</span> and{' '}
              <span className="text-amber-primary/80">VITE_PLAUSIBLE_API_KEY</span> for live stats, or{' '}
              <span className="text-amber-primary/80">VITE_GA_MEASUREMENT_ID</span> for tracking only.
            </>
          ) : (
            'Visitor metrics are not configured for this build.'
          )}
        </p>
      )}

      {analytics.status === 'error' && (
        <p className="text-vfd-red/80 font-mono">Unable to load Plausible stats API.</p>
      )}

      {analytics.status === 'loading' && (
        <p className="text-amber-primary/60 font-mono">Pulling aggregate metrics…</p>
      )}

      {analytics.status === 'ready' && (
        <>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">VISITORS (30D)</span>
            <span className="px-1.5 bg-amber-primary/20 text-amber-primary border border-amber-primary/40 amber-text-glow">
              {analytics.visitors?.toLocaleString() ?? '—'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">PAGEVIEWS (30D)</span>
            <span className="px-1.5 bg-vfd-green/10 text-vfd-green/80 border border-vfd-green/20 green-text-glow">
              {analytics.pageviews?.toLocaleString() ?? '—'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">AVG_VISIT</span>
            <span className="text-vfd-teal/80 vfd-text-glow tracking-wider">
              {formatVisitDuration(analytics.visitDurationSeconds)}
            </span>
          </div>
          {analytics.bounceRate !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-amber-primary/60 amber-text-glow">BOUNCE_RATE</span>
              <span className="text-white/60">{Math.round(analytics.bounceRate)}%</span>
            </div>
          )}
        </>
      )}

      {isAnalyticsConfigured() && analytics.status === 'unconfigured' && (
        <p className="text-[10px] text-vfd-green/70">Page tracking script is active.</p>
      )}
    </Panel>
  );
}
