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

export interface ProjectContent {
  id: string;
  slug: string;
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
}

export interface GitHubRepoMetrics {
  status: 'loading' | 'ready' | 'error';
  count: number | null;
  lastPushIso: string | null;
  latestSha: string | null;
  topLanguage: string | null;
  deployStatus: 'success' | 'failure' | 'in_progress' | 'queued' | 'unknown';
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  desc: string;
  overview: string;
  challenge: string;
  outcome: string;
  role: string;
  period: string;
  stack: string[];
  status: ProjectStatus;
  thumbnail: string;
  highlights: string[];
  metrics: ProjectMetric[];
  links: ProjectLink[];
}
