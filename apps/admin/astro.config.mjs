import { defineConfig } from 'astro/config';
import { adminEnv } from './env.config.mjs';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

export default defineConfig({
  env: adminEnv,
  output: 'server',
  session: false,
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [react(), markdoc(), keystatic()],
  vite: {
    optimizeDeps: {
      // Keystatic's auth API imports CommonJS cookie; Workers dev needs ESM.
      include: ['@keystatic/core > cookie'],
    },
  },
});
