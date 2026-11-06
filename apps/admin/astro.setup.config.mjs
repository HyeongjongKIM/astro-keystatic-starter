import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Node dev server for GitHub App provisioning only.
export default defineConfig({
  integrations: [react(), markdoc(), keystatic()],
});
