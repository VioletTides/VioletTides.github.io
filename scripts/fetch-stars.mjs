// Fetches GitHub star counts and writes them to src/data/stars.json, which src/data/site.ts reads at build time.
// If any request fails, the old file is kept, so the site always shows the last good count.
// The repositories are the repo fields in src/data/projects.json.
import { readFile, writeFile } from 'node:fs/promises';

const { projects } = JSON.parse(await readFile(new URL('../src/data/projects.json', import.meta.url), 'utf8'));
const REPOS = [...new Set(projects.map(p => p.repo).filter(Boolean))];
const OUT = new URL('../src/data/stars.json', import.meta.url);

const repos = {};
for (const repo of REPOS) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) { console.error(`${repo}: HTTP ${res.status}. Kept the old stars.json.`); process.exit(1); }
  repos[repo] = (await res.json()).stargazers_count;
}
const data = { fetched: new Date().toISOString().slice(0, 10), repos };
await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
console.log(`Wrote ${Object.entries(repos).map(([r, n]) => `${r} ${n}`).join(', ')}`);
