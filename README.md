# robinn.ca

Robin Anderson's portfolio site. The home page draws every project as an ASCII tree in WebGL 2, and each project has its own page.

## Run it

1. Run `npm install`.
2. Run `npm run dev`, then open http://localhost:4321.
3. Run `npm run build` to make the finished site in `dist/`.

## Add a project

Edit `src/data/projects.json`, and put any photos in `src/assets/projects/<slug>/`. A bad entry stops `npm run build` and names the project.

`node scripts/fetch-stars.mjs` refreshes the GitHub star counts in `src/data/stars.json`.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages at robinn.ca.

Earlier versions of the site are on the branches `react-dashboard`, `bootstrap-2024` and `bootstrap-2023`.
