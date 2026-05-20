import {
  GITHUB_METRICS_CACHE_KEY,
  GITHUB_METRICS_CACHE_TTL_MS,
  GITHUB_REPO,
  DEPLOY_WORKFLOW_FILE,
} from '../constants/github';
import type { GitHubMetricsErrorReason, GitHubRepoMetrics } from '../types';

interface CachedMetrics {
  savedAt: number;
  metrics: GitHubRepoMetrics;
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };

  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function errorReasonFromResponse(response: Response): GitHubMetricsErrorReason {
  if (response.status === 403 || response.status === 429) {
    return 'rate_limit';
  }

  return 'api';
}

export function readCachedGitHubMetrics(): GitHubRepoMetrics | null {
  try {
    const raw = sessionStorage.getItem(GITHUB_METRICS_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedMetrics;
    if (Date.now() - parsed.savedAt > GITHUB_METRICS_CACHE_TTL_MS) {
      sessionStorage.removeItem(GITHUB_METRICS_CACHE_KEY);
      return null;
    }

    return {
      ...parsed.metrics,
      starCount: parsed.metrics.starCount ?? null,
      openIssuesCount: parsed.metrics.openIssuesCount ?? null,
      cached: true,
    };
  } catch {
    return null;
  }
}

function writeCache(metrics: GitHubRepoMetrics): void {
  try {
    const payload: CachedMetrics = {
      savedAt: Date.now(),
      metrics: { ...metrics, cached: false },
    };
    sessionStorage.setItem(GITHUB_METRICS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage may be unavailable
  }
}

async function fetchCommitCount(signal: AbortSignal): Promise<number | null> {
  const query = `
    query ($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        defaultBranchRef {
          target {
            ... on Commit {
              history { totalCount }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    signal,
    headers: {
      ...githubHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { owner: GITHUB_REPO.owner, name: GITHUB_REPO.name },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    data?: {
      repository?: {
        defaultBranchRef?: {
          target?: {
            history?: { totalCount?: number };
          };
        };
      };
    };
  };

  return payload.data?.repository?.defaultBranchRef?.target?.history?.totalCount ?? null;
}

export async function fetchGitHubRepoMetrics(
  signal: AbortSignal,
): Promise<GitHubRepoMetrics> {
  const cached = readCachedGitHubMetrics();
  if (cached) {
    return cached;
  }

  const headers = githubHeaders();
  const repoUrl = `https://api.github.com/repos/${GITHUB_REPO.owner}/${GITHUB_REPO.name}`;

  try {
    const [repoResponse, commitsResponse, languagesResponse, deploysResponse, commitCount] =
      await Promise.all([
        fetch(repoUrl, { signal, headers }),
        fetch(`${repoUrl}/commits?per_page=1`, { signal, headers }),
        fetch(`${repoUrl}/languages`, { signal, headers }),
        fetch(
          `${repoUrl}/actions/workflows/${DEPLOY_WORKFLOW_FILE}/runs?branch=main&per_page=1`,
          { signal, headers },
        ),
        fetchCommitCount(signal),
      ]);

    const responses = [repoResponse, commitsResponse, languagesResponse, deploysResponse];
    const failed = responses.find((response) => !response.ok);

    if (failed) {
      return {
        status: 'error',
        commitCount: null,
        lastPushIso: null,
        latestSha: null,
        topLanguage: null,
        starCount: null,
        openIssuesCount: null,
        deployStatus: 'unknown',
        errorReason: errorReasonFromResponse(failed),
      };
    }

    const repo = (await repoResponse.json()) as {
      pushed_at?: string;
      stargazers_count?: number;
      open_issues_count?: number;
    };
    const commits = (await commitsResponse.json()) as Array<{ sha?: string }>;
    const languages = (await languagesResponse.json()) as Record<string, number>;
    const deploys = (await deploysResponse.json()) as {
      workflow_runs?: Array<{ conclusion?: string | null; status?: string | null }>;
    };

    const topLanguageEntry = Object.entries(languages).sort((a, b) => b[1] - a[1])[0];
    const latestRun = deploys.workflow_runs?.[0];
    const deployStatus =
      latestRun?.conclusion === 'success'
        ? 'success'
        : latestRun?.conclusion === 'failure'
          ? 'failure'
          : latestRun?.status === 'in_progress'
            ? 'in_progress'
            : latestRun?.status === 'queued'
              ? 'queued'
              : 'unknown';

    const metrics: GitHubRepoMetrics = {
      status: 'ready',
      commitCount,
      lastPushIso: repo.pushed_at ?? null,
      latestSha: commits[0]?.sha?.slice(0, 7) ?? null,
      topLanguage: topLanguageEntry?.[0] ?? null,
      starCount: repo.stargazers_count ?? null,
      openIssuesCount: repo.open_issues_count ?? null,
      deployStatus,
    };

    writeCache(metrics);
    return metrics;
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }

    console.error('Failed to load repository metrics', error);
    return {
      status: 'error',
      commitCount: null,
      lastPushIso: null,
      latestSha: null,
      topLanguage: null,
      starCount: null,
      openIssuesCount: null,
      deployStatus: 'unknown',
      errorReason: 'network',
    };
  }
}
