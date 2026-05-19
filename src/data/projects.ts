import { IMAGES } from '../constants/images';
import { Project, ProjectContent } from '../types';

const PROJECT_IMAGE_MAP: Record<string, string> = {
  QUANTUM_NAV: IMAGES.PROJECTS.QUANTUM_NAV,
  GRID_SYNC: IMAGES.PROJECTS.GRID_SYNC,
  BIO_SENSOR: IMAGES.PROJECTS.BIO_SENSOR,
  NEURAL_EMBED: IMAGES.PROJECTS.NEURAL_EMBED,
};

let cachedProjects: Project[] | null = null;

function mapProject(content: ProjectContent): Project {
  return {
    ...content,
    thumbnail: PROJECT_IMAGE_MAP[content.imageKey] ?? IMAGES.PROJECTS.QUANTUM_NAV,
  };
}

export async function loadProjects(): Promise<Project[]> {
  if (cachedProjects) {
    return cachedProjects;
  }

  const response = await fetch(`${import.meta.env.BASE_URL}content/projects.json`);
  if (!response.ok) {
    throw new Error(`Failed to load projects.json: ${response.status}`);
  }

  const rawProjects = (await response.json()) as ProjectContent[];
  cachedProjects = rawProjects.map(mapProject);
  return cachedProjects;
}
