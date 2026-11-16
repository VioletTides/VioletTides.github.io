// Loads src/data/projects.json, checks every entry and fills in star counts.
// Any page that imports this module fails the build on a bad entry, and the error names the entry.
import { z } from 'astro/zod';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import raw from './projects.json';
import stars from './stars.json';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'must be a colour like #0058b4');

// One category of work. light: its colour in light mode, at least 4.5:1 against the background.
// dark: its colour in dark mode. Hues sit far apart.
const Category = z.object({
  kind: z.string().regex(/^[a-z]+$/),
  name: z.string().min(1),
  light: hex,
  dark: hex,
}).strict();

// One project. year: the start, as a decimal year. months: a duration a source states, else the length
// of the dated range. sized: false means no source gives a length, so the size is a guess.
// href: the source code or another outbound link. linkText: the link label, when href is not source code.
// repo: the GitHub repository whose star count replaces {stars} in what and facts.
// unlisted: hidden from the tree and the project index, but its page still builds.
// featured: gets the featured marker on the tree in place of the newest project in its category.
// sections: the page's headed paragraphs. The first one is the lead. Without them, the page shows what and facts.
// media: photos shown after the sections. src names a file in src/assets/projects/<slug>/.
const Section = z.object({ heading: z.string().min(1), text: z.string().min(1) }).strict();
const Media = z.object({ src: z.string().min(1), alt: z.string().min(1), caption: z.string().min(1).optional() }).strict();
const Project = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'must be lower case letters, digits and hyphens'),
  name: z.string().min(1),
  kind: z.string(),
  year: z.number().min(2000).max(2100),
  months: z.number().positive(),
  what: z.string().min(1),
  facts: z.string().min(1),
  href: z.string().url().optional(),
  linkText: z.string().min(1).optional(),
  repo: z.string().optional(),
  sized: z.boolean().optional(),
  unlisted: z.boolean().optional(),
  featured: z.boolean().optional(),
  sections: z.array(Section).min(1).optional(),
  media: z.array(Media).min(1).optional(),
}).strict();

export type Project = z.infer<typeof Project>;
type Category = z.infer<typeof Category>;

const photos = import.meta.glob<{ default: ImageMetadata }>('../assets/projects/*/*', { eager: true });
const photo = (slug: string, src: string) => photos[`../assets/projects/${slug}/${src}`]?.default;

const fail = (what: string, issues: z.ZodIssue[]): never => {
  const lines = issues.map(i => `  ${i.path.join('.') || '(entry)'}: ${i.message}`).join('\n');
  throw new Error(`src/data/projects.json: ${what} is invalid:\n${lines}`);
};

export const categories: Category[] = raw.categories.map((b: any, i: number) => {
  const r = Category.safeParse(b);
  return r.success ? r.data : fail(`category "${b?.name ?? `#${i + 1}`}"`, r.error.issues);
});
const kinds = new Set(categories.map(b => b.kind));

const seen = new Set<string>();
export const allProjects: Project[] = raw.projects.map((p: any, i: number) => {
  const label = `project "${p?.name ?? p?.slug ?? `#${i + 1}`}"`;
  const r = Project.safeParse(p);
  if (!r.success) fail(label, r.error.issues);
  const q = r.data!;
  const bad = (path: (string | number)[], message: string) => fail(label, [{ path, message } as z.ZodIssue]);
  if (!kinds.has(q.kind)) bad(['kind'], `"${q.kind}" is not a category kind (${[...kinds].join(', ')})`);
  if (seen.has(q.slug)) bad(['slug'], `"${q.slug}" is used by an earlier project`);
  seen.add(q.slug);
  q.media?.forEach((m, j) => { if (!photo(q.slug, m.src)) bad(['media', j, 'src'], `src/assets/projects/${q.slug}/${m.src} does not exist`); });
  // Without a star count, the sentence that holds {stars} is dropped.
  const n = q.repo ? (stars.repos as Record<string, number>)[q.repo] : undefined;
  const fill = (s: string) => !s.includes('{stars}') ? s : n == null ? s.replace(/ ?[^.]*\{stars\}[^.]*\./, '') : s.replace('{stars}', String(n));
  return { ...q, what: fill(q.what), facts: fill(q.facts) };
});

export const projects = allProjects.filter(p => !p.unlisted);
export const categoryOf = (p: Project) => categories.find(b => b.kind === p.kind)!;

// The page's headed paragraphs, the same ones the home page shows when a project opens.
export const sectionsOf = (p: Project) => p.sections ?? [
  { heading: 'What', text: p.what }, { heading: 'Details', text: p.facts }];

// The project's photos, resized by Astro's image pipeline, which also strips their metadata.
// sizes matches the reading column, 46rem at most. The largest file is 1440 px wide.
export const figuresOf = (p: Project) => Promise.all((p.media ?? []).map(async m => {
  const src = photo(p.slug, m.src)!;
  const img = await getImage({ src, width: Math.min(1440, src.width), widths: [480, 960, 1440], sizes: '(min-width: 46rem) 44rem, calc(100vw - 2rem)' });
  return { src: img.src, srcset: img.srcSet.attribute, sizes: img.attributes.sizes, width: img.attributes.width, height: img.attributes.height, alt: m.alt, caption: m.caption };
}));

// Category colours as CSS: --<kind> on the page, and the .<kind> class for text and the --k accent.
export const categoryCss = categories.map(b =>
  `:root { --${b.kind}: ${b.light}; } html[data-theme="dark"] { --${b.kind}: ${b.dark}; } .${b.kind} { color: var(--${b.kind}); --k: var(--${b.kind}); }`).join('\n');

