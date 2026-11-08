import { config } from '@keystatic/core';
import type { Entry } from '@keystatic/core/reader';
import { pages } from './collections/pages';
import { posts } from './collections/posts';
import { siteSettings } from './singletons/site-settings';

// All schema/image paths are relative to the repository root. No pathPrefix is needed.
export function createContentConfig(
  repo: `${string}/${string}`,
  adminBrandName = 'Content Admin',
) {
  return config({
    storage: { kind: 'github', repo },
    ui: { brand: { name: adminBrandName.trim() || 'Content Admin' } },
    collections: { pages, posts },
    singletons: { siteSettings },
  });
}
export const contentConfig = createContentConfig('customer/replace-me');
export type Page = Entry<typeof pages>;
export type Post = Entry<typeof posts>;
export type SiteSettings = Entry<typeof siteSettings>;
export type ContentBlock = Page['content'][number];
export function isPublished(post: Pick<Post, 'status'>): boolean {
  return post.status === 'published';
}
