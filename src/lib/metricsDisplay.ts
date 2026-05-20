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
    return 'UPLINK CONGESTED. RETRY LATER';
  }
  if (metrics.errorReason === 'network') {
    return 'NETWORK LINK UNSTABLE';
  }
  return 'REMOTE FEED OFFLINE';
}
