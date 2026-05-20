import { IMAGES } from '../constants/images';
import type { Project } from '../types';

import { PROJECT_IMAGE_KEYS, type ProjectImageKey } from './projectImageKeys';

export { PROJECT_IMAGE_KEYS, type ProjectImageKey };

const PROJECT_IMAGE_MAP: Record<ProjectImageKey, string> = {
  TEMPLATE: IMAGES.PROJECTS.TEMPLATE,
  QUANTUM_NAV: IMAGES.PROJECTS.QUANTUM_NAV,
  GRID_SYNC: IMAGES.PROJECTS.GRID_SYNC,
  BIO_SENSOR: IMAGES.PROJECTS.BIO_SENSOR,
  NEURAL_EMBED: IMAGES.PROJECTS.NEURAL_EMBED,
};

type ProjectRecord = Omit<Project, 'thumbnail'>;

let cachedProjects: Project[] | null = null;

function mapProject(content: ProjectRecord): Project {
  return {
    ...content,
    thumbnail:
      content.imageKey in PROJECT_IMAGE_MAP
        ? PROJECT_IMAGE_MAP[content.imageKey as ProjectImageKey]
        : IMAGES.PROJECTS.TEMPLATE,
  };
}

async function loadProjects(): Promise<Project[]> {
  if (cachedProjects) {
    return cachedProjects;
  }

  const response = await fetch(`${import.meta.env.BASE_URL}content/projects.json`);
  if (!response.ok) {
    throw new Error(`Failed to load projects.json: ${response.status}`);
  }

  const rawProjects = (await response.json()) as ProjectRecord[];
  cachedProjects = rawProjects.map(mapProject);
  return cachedProjects;
}

export async function loadListedProjects(): Promise<Project[]> {
  const projects = await loadProjects();
  return projects.filter((project) => project.listed !== false);
}

export async function loadProjectBySlug(slug: string): Promise<Project | undefined> {
  const projects = await loadProjects();
  return projects.find((project) => project.slug === slug);
}
