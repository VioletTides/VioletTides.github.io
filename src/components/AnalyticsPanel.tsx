import type { AnalyticsSnapshot } from '../types';
import { Panel } from './Panel';

export function AnalyticsPanel({ analytics }: { analytics: AnalyticsSnapshot }) {
  const syncLabel =
    analytics.status === 'active'
      ? 'ACTIVE'
      : analytics.status === 'unconfigured'
        ? 'NO_SRC'
        : 'OFF';

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
              Set <span className="text-amber-primary/80">VITE_GA_MEASUREMENT_ID</span> at build time
              to enable Google Analytics page tracking.
            </>
          ) : (
            'Google Analytics is not configured for this build.'
          )}
        </p>
      )}

      {analytics.status === 'active' && (
        <>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">PROVIDER</span>
            <span className="text-amber-primary/90 uppercase tracking-wider">Google Analytics 4</span>
          </div>
          <p className="text-white/50 font-mono leading-relaxed">
            Page views are sent to your GA4 property. Open{' '}
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-primary/80 hover:text-amber-primary underline underline-offset-2"
            >
              Google Analytics
            </a>{' '}
            for reports and realtime data.
          </p>
        </>
      )}
    </Panel>
  );
}
