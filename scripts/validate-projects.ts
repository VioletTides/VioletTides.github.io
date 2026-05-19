import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

const projectSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  listed: z.boolean().optional(),
  title: z.string().min(1),
  desc: z.string().min(1),
  overview: z.string().min(1),
  challenge: z.string().min(1),
  outcome: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  stack: z.array(z.string()).min(1),
  status: z.enum(['STABLE', 'DELEGATED', 'ACTIVE']),
  imageKey: z.string().min(1),
  highlights: z.array(z.string()).min(1),
  metrics: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .min(1),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    )
    .min(1),
});

const projectsSchema = z.array(projectSchema).min(1);

const filePath = resolve(process.cwd(), 'public/content/projects.json');
const raw = readFileSync(filePath, 'utf8');
const parsed = JSON.parse(raw) as unknown;
const projects = projectsSchema.parse(parsed);

const slugs = new Set<string>();
for (const project of projects) {
  if (slugs.has(project.slug)) {
    throw new Error(`Duplicate project slug: ${project.slug}`);
  }
  slugs.add(project.slug);
}

console.log(`Validated ${projects.length} projects in ${filePath}`);
