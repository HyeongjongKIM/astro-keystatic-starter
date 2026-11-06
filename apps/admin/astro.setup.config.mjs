import { defineConfig } from 'astro/config';
import { adminEnv } from './env.config.mjs';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Node dev server for GitHub App provisioning only.
export default defineConfig({
  env: adminEnv,
  integrations: [react(), markdoc(), keystatic()],
});
