/** Keys referenced by `imageKey` in public/content/projects.json */
export const PROJECT_IMAGE_KEYS = [
  'TEMPLATE',
  'QUANTUM_NAV',
  'GRID_SYNC',
  'BIO_SENSOR',
  'NEURAL_EMBED',
] as const;

export type ProjectImageKey = (typeof PROJECT_IMAGE_KEYS)[number];
