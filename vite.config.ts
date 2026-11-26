/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'es2022',
    // The polyfill would use fetch(); the CSP forbids any connection, so keep it out.
    modulePreload: { polyfill: false },
    sourcemap: true,
  },
  server: { host: true },
  preview: { host: true },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
