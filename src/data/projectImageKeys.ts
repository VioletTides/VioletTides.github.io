/** Keys referenced by `imageKey` in public/content/projects.json */
export const PROJECT_IMAGE_KEYS = ['TEMPLATE'] as const;

export type ProjectImageKey = (typeof PROJECT_IMAGE_KEYS)[number];
