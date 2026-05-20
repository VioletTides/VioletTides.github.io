import {
  formatCommitCount,
  formatMetricsErrorLabel,
} from '../lib/metricsDisplay';
import type { GitHubRepoMetrics } from '../types';
import { Panel } from './Panel';

function formatCount(value: number | null | undefined, status: GitHubRepoMetrics['status']): string {
  if (status === 'error') {
    return 'UNAVAILABLE';
  }
  if (status === 'loading' || value === null || value === undefined) {
    return 'SYNCING';
  }
  return String(value);
}

export function RepoMetricsPanel({
  repoMetrics,
  className = '',
}: {
  repoMetrics: GitHubRepoMetrics;
  className?: string;
}) {
  return (
    <Panel title="REPOSITORY_METRICS" right="V_042" className={className} bodyClassName="p-2.5 min-h-0 overflow-hidden">
      <div className="text-[12px] text-amber-primary/60 space-y-1.5">
        {import.meta.env.DEV && repoMetrics.cached && repoMetrics.status === 'ready' && (
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Buffered read</p>
        )}

        {repoMetrics.status === 'error' && (
          <p className="text-vfd-red/80 red-text-glow text-[10px] uppercase tracking-wider">
            {formatMetricsErrorLabel(repoMetrics)}
          </p>
        )}

        <div className="space-y-1.5">
          <div className="flex justify-between items-center border-b border-white/5 pb-1 amber-text-glow">
            <span>COMMITS</span>
            <span className="text-amber-primary font-bold">{formatCommitCount(repoMetrics)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">STARS</span>
            <span className="text-amber-primary/80">{formatCount(repoMetrics.starCount, repoMetrics.status)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">OPEN_ISSUES</span>
            <span className="text-amber-primary/80">
              {formatCount(repoMetrics.openIssuesCount, repoMetrics.status)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">LAST_PUSH_UTC</span>
            <span className="text-vfd-teal/70 vfd-text-glow uppercase text-right">
              {repoMetrics.status === 'ready' && repoMetrics.lastPushIso
                ? new Date(repoMetrics.lastPushIso).toISOString().slice(0, 16).replace('T', ' ')
                : repoMetrics.status === 'error'
                  ? 'UNAVAILABLE'
                  : 'SYNCING'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-amber-primary/60 amber-text-glow">LATEST_SHA</span>
            <span className="text-vfd-green/80 green-text-glow uppercase">
              {repoMetrics.status === 'ready' && repoMetrics.latestSha
                ? repoMetrics.latestSha
                : repoMetrics.status === 'error'
                  ? 'UNAVAILABLE'
                  : 'SYNCING'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-primary/60 amber-text-glow">DEPLOY_STATUS</span>
            <span
              className={`uppercase ${
                repoMetrics.deployStatus === 'success'
                  ? 'text-vfd-green green-text-glow'
                  : repoMetrics.deployStatus === 'failure'
                    ? 'text-vfd-red red-text-glow'
                    : repoMetrics.deployStatus === 'in_progress' ||
                        repoMetrics.deployStatus === 'queued'
                      ? 'text-amber-primary amber-text-glow'
                      : 'text-white/40'
              }`}
            >
              {repoMetrics.status === 'error'
                ? 'UNAVAILABLE'
                : repoMetrics.deployStatus === 'unknown'
                  ? 'SYNCING'
                  : repoMetrics.deployStatus}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
