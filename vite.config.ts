import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

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

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
