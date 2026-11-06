import { createContentConfig } from '@starter/content';

const repo = import.meta.env.KEYSTATIC_GITHUB_REPO || 'customer/replace-me';
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
  throw new Error('KEYSTATIC_GITHUB_REPO must be owner/repo');
export default createContentConfig(repo as `${string}/${string}`);
