# Robin Anderson — Portfolio

My personal site at [robinn.ca](https://robinn.ca/) — I built it with React 19, Vite 6, Tailwind CSS 4, and Motion.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — see Environment variables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Validate projects, production build, copy SPA `404.html` |
| `npm run preview` | Preview production build |
| `npm run lint` | Typecheck + ESLint |
| `npm run validate:projects` | Zod validation of `public/content/projects.json` |

## Environment variables

Copy `.env.example` to `.env.local` for local overrides.

**Important:** Every `VITE_*` variable is compiled into the public JavaScript bundle. GA measurement IDs are public in the built JS; use GitHub Actions **secrets** only for tokens (e.g. GitHub PAT).

| Variable | Purpose | Where to set |
|----------|---------|----------------|
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 — **tracks page views when set** | Actions variable or `.env.local` |
| `VITE_GITHUB_TOKEN` | GitHub PAT for repo metrics rate limits | Actions **secret** only |

Without `VITE_GA_MEASUREMENT_ID`, no analytics script is loaded. The home page still shows your session ID and uptime in the visitor panel.

### GitHub Actions (production deploy)

In the repo: **Settings → Secrets and variables → Actions**.

**Variables** (repository variables — safe to expose in the built site):

| Name | Example / notes |
|------|-----------------|
| `VITE_GA_MEASUREMENT_ID` | Your GA4 ID (e.g. `G-69CTLC057Y`) — enables GA on all pages |

**Secrets** (never committed; injected at build time):

| Name | When needed |
|------|-------------|
| `VITE_GITHUB_TOKEN` | Higher GitHub API rate limits for repo metrics panel |

`.github/workflows/deploy.yml` passes these into `npm run build` on push to `main`.

## Content

- **Projects:** edit `public/content/projects.json` (validated on build). Set `"listed": true` to show on the index; `slug: "template"` stays unlisted for schema reference at `/projects/template`.
- **Profile image:** `public/assets/myheadshot.webp`
- **Resume:** `public/Robin-Anderson-Resume.pdf`

## Routing

Client routes (React Router):

- `/` — Home (desktop: dashboards + logs; mobile: profile header only)
- `/projects` — Project list (empty state when no listed projects)
- `/projects/:slug` — Project detail (includes unlisted dev template by direct URL)
- `/contact` — Contact form (`mailto:`)

**Mobile:** use the header tabs (HOME / PROJECTS / CONTACT) to change section.

## Deploy (GitHub Pages)

Pushes to `main` run `.github/workflows/deploy.yml`.

1. **Repository:** enable Pages → source: GitHub Actions.
2. **Custom domain:** `public/CNAME` contains `robinn.ca`. In repo **Settings → Pages**, set custom domain to `robinn.ca` and configure DNS at your registrar:
   - Apex `robinn.ca`: `A` records → GitHub Pages IPs (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain))
   - `www`: `CNAME` → `<user>.github.io` if used
3. **Actions config:** set variables/secrets above so analytics and optional panels work in production.

**Base path:** `vite.config.ts` uses `/` for `*.github.io` repos and `/<repo>/` for project Pages sites. This repo targets user/org Pages + `robinn.ca`.

**SPA deep links:** `npm run build` copies `dist/index.html` to `dist/404.html` so GitHub Pages serves the app for unknown paths (no separate redirect HTML).

## Privacy

When `VITE_GA_MEASUREMENT_ID` is set at build time, the site loads Google Analytics (gtag) and records page views. Omit the variable to disable tracking.
