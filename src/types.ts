export type View = 'home' | 'projects' | 'contact';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'success';
}

export type ProjectStatus = 'STABLE' | 'DELEGATED' | 'ACTIVE';

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

/** Shape stored in public/content/projects.json */
export interface Project {
  id: string;
  slug: string;
  /** When false, omitted from /projects index but still reachable by slug */
  listed?: boolean;
  title: string;
  desc: string;
  overview: string;
  challenge: string;
  outcome: string;
  role: string;
  period: string;
  stack: string[];
  status: ProjectStatus;
  imageKey: string;
  highlights: string[];
  metrics: ProjectMetric[];
  links: ProjectLink[];
  /** Resolved at load time from imageKey */
  thumbnail: string;
}

export type GitHubMetricsErrorReason = 'rate_limit' | 'network' | 'api';

export interface GitHubRepoMetrics {
  status: 'loading' | 'ready' | 'error';
  commitCount: number | null;
  lastPushIso: string | null;
  latestSha: string | null;
  topLanguage: string | null;
  deployStatus: 'success' | 'failure' | 'in_progress' | 'queued' | 'unknown';
  errorReason?: GitHubMetricsErrorReason;
  cached?: boolean;
}

export interface AnalyticsSnapshot {
  status: 'idle' | 'loading' | 'ready' | 'unconfigured' | 'error';
  visitors?: number;
  pageviews?: number;
  visitDurationSeconds?: number;
  bounceRate?: number;
}
