import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defaultSiteURL } from '@starter/config';

const env = loadEnv(
  process.env.NODE_ENV || 'production',
  process.cwd(),
  'PUBLIC_',
);
const site =
  process.env.PUBLIC_SITE_URL || env.PUBLIC_SITE_URL || defaultSiteURL;
const parsed = new URL(site);
if (
  !['http:', 'https:'].includes(parsed.protocol) ||
  parsed.pathname !== '/' ||
  parsed.search ||
  parsed.hash
)
  throw new Error('PUBLIC_SITE_URL must be an http(s) origin');
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site,
  integrations: [
    mdx(),
    sitemap({ filter: (url) => !new URL(url).pathname.startsWith('/404') }),
  ],
});
