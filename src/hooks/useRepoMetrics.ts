import { useEffect, useState } from 'react';
import { fetchGitHubRepoMetrics, readCachedGitHubMetrics } from '../lib/githubMetrics';
import type { GitHubRepoMetrics } from '../types';

const INITIAL: GitHubRepoMetrics = {
  status: 'loading',
  commitCount: null,
  lastPushIso: null,
  latestSha: null,
  starCount: null,
  openIssuesCount: null,
  deployStatus: 'unknown',
};

export function useRepoMetrics(enabled = true) {
  const [repoMetrics, setRepoMetrics] = useState<GitHubRepoMetrics>(
    () => (enabled ? readCachedGitHubMetrics() : null) ?? INITIAL,
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();

    fetchGitHubRepoMetrics(controller.signal)
      .then(setRepoMetrics)
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, [enabled]);

  return repoMetrics;
}
