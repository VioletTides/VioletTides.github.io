/** Canonical contact address used across the site. */
export const CONTACT_EMAIL = 'robin34anderson@gmail.com';

export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

export const RESUME_PATH = 'Robin-Anderson-Resume.pdf';

export function resumeUrl(baseUrl = import.meta.env.BASE_URL) {
  return `${baseUrl}${RESUME_PATH}`;
}
