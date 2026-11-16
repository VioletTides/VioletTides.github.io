// Static build for GitHub Pages at robinn.ca.
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://robinn.ca',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
