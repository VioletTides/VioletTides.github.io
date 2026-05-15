export type View = 'home' | 'projects' | 'contact';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'success';
}

export interface Project {
  id: string;
  title: string;
  desc: string;
  stack: string[];
  status: 'STABLE' | 'DELEGATED' | 'ACTIVE';
  thumbnail: string;
}
