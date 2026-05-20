/** Site-wide copy, including link-preview meta (injected into index.html at build). */

export const SITE_TITLE = 'Robin Anderson // PORTFOLIO_V1.0';

export const SITE_META_DESCRIPTION = "Robin Anderson's portfolio";

export const SITE_OG_DESCRIPTION = "Robin Anderson's portfolio";

export const SITE_TWITTER_DESCRIPTION = "Robin Anderson's portfolio";

export const PROJECTS_PAGE_COPY = {
  heading: 'Projects',
  loading: 'Loading my projects…',
  empty: 'Nothing listed here yet.',
  emptyDetail: "I'm still writing these up. Check back soon.",
  count: (n: number) => (n === 1 ? '1 project here.' : `${n} projects here.`),
  error: "I couldn't load my projects. Try again in a bit.",
} as const;

export const CONTACT_PAGE_COPY = {
  heading: 'Contact',
  subtitle: 'Send me a message. This opens your mail app.',
  subjectPlaceholder: 'Subject',
  bodyPlaceholder: 'What do you want to talk about?',
  defaultSubject: 'Message from robinn.ca',
  sendLabel: 'Send message',
} as const;
