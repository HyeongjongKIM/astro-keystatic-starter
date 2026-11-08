import { createContentConfig } from '@starter/content';
import { ADMIN_BRAND_NAME, KEYSTATIC_GITHUB_REPO } from 'astro:env/client';

const repo = KEYSTATIC_GITHUB_REPO;
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
  throw new Error('KEYSTATIC_GITHUB_REPO must be owner/repo');
export default createContentConfig(
  repo as `${string}/${string}`,
  ADMIN_BRAND_NAME,
);
