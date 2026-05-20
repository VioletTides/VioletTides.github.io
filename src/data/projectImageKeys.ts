/** Keys referenced by `imageKey` in public/content/projects.json */
export const PROJECT_IMAGE_KEYS = ['TEMPLATE', 'STUDY_TIMER'] as const;

export type ProjectImageKey = (typeof PROJECT_IMAGE_KEYS)[number];
