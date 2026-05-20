/** First-person site copy. Keep `index.html` meta tags aligned with these strings. */

export const SITE_TITLE = 'Robin Anderson // PORTFOLIO_V1.0';

export const SITE_META_DESCRIPTION =
  "I'm an embedded systems engineer. My projects, resume, and how to reach me.";

export const SITE_OG_DESCRIPTION =
  'My embedded systems work — projects, resume, and contact.';

export const SITE_TWITTER_DESCRIPTION = SITE_OG_DESCRIPTION;

export const PROJECTS_PAGE_COPY = {
  loading: 'Loading my projects…',
  empty: 'Nothing listed here yet.',
  emptyDetail: "I'm still writing these up. Check back soon.",
  count: (n: number) => (n === 1 ? '1 project here.' : `${n} projects here.`),
  error: "I couldn't load my projects. Try again in a bit.",
} as const;

export const CONTACT_PAGE_COPY = {
  subtitle: 'Send me a message — this opens your mail app.',
  subjectPlaceholder: 'Subject',
  bodyPlaceholder: 'What do you want to talk about?',
  defaultSubject: 'Message from robinn.ca',
} as const;
