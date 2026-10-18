import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so the build works on GitHub Pages under /<repo>/
  base: './',
  test: {
    environment: 'jsdom',
  },
});
