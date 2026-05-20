import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';

import {
  SITE_META_DESCRIPTION,
  SITE_OG_DESCRIPTION,
  SITE_TITLE,
  SITE_TWITTER_DESCRIPTION,
} from './src/constants/siteCopy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBasePath() {
  const githubRepository = process.env.GITHUB_REPOSITORY;

  if (!githubRepository) {
    return '/';
  }

  const [, repoName] = githubRepository.split('/');
  return repoName.endsWith('.github.io') ? '/' : `/${repoName}/`;
}

const buildStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function injectSiteMeta(): Plugin {
  return {
    name: 'inject-site-meta',
    transformIndexHtml(html) {
      return html
        .replaceAll('__SITE_TITLE__', escapeHtmlAttr(SITE_TITLE))
        .replaceAll('__SITE_META_DESCRIPTION__', escapeHtmlAttr(SITE_META_DESCRIPTION))
        .replaceAll('__SITE_OG_DESCRIPTION__', escapeHtmlAttr(SITE_OG_DESCRIPTION))
        .replaceAll('__SITE_TWITTER_DESCRIPTION__', escapeHtmlAttr(SITE_TWITTER_DESCRIPTION));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectSiteMeta()],
  base: getBasePath(),
  define: {
    __BUILD_STAMP__: JSON.stringify(buildStamp),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
