import type { GitHubRepoMetrics } from '../types';

export function formatCommitCount(metrics: GitHubRepoMetrics): string {
  if (metrics.status === 'loading') {
    return 'SYNCING';
  }

  if (metrics.status === 'error') {
    if (metrics.errorReason === 'rate_limit') {
      return 'RATE_LIMIT';
    }
    return 'SYNC_ERR';
  }

  if (metrics.commitCount !== null) {
    return `${metrics.commitCount.toLocaleString()} COMMITS`;
  }

  return 'N/A';
}

export function formatMetricsErrorLabel(metrics: GitHubRepoMetrics): string {
  if (metrics.errorReason === 'rate_limit') {
    return 'GITHUB API RATE LIMIT — RETRY LATER';
  }
  if (metrics.errorReason === 'network') {
    return 'NETWORK ERROR';
  }
  return 'API ERROR';
}

export function formatVisitDuration(seconds?: number): string {
  if (seconds === undefined || Number.isNaN(seconds)) {
    return '—';
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
