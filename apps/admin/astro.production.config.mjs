import { mergeConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import preview from './astro.config.mjs';

export default mergeConfig(preview, {
  adapter: cloudflare({
    imageService: 'passthrough',
    configPath: './wrangler.production.jsonc',
  }),
});
