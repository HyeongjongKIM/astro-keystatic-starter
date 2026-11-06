import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { mkdtemp, cp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readContent } from './reader';
import { contentConfig, isPublished } from './index';

const root = fileURLToPath(new URL('./fixtures/', import.meta.url));

describe('shared Keystatic content contract', () => {
  it('reads nested Pages, MDX block files and site image URLs from root storage', async () => {
    const reader = readContent(root);
    expect(await reader.collections.pages.list()).toContain(
      'projects/photography',
    );
    const page = await reader.collections.pages.readOrThrow('home');
    expect(page.title).toBe('Welcome');
    expect(page.content).toHaveLength(1);
    expect(page.content[0].discriminant).toBe('richText');
    expect(await page.content[0].value.body()).toContain('**Keystatic**');
    expect(await page.content[0].value.body()).toContain(
      '@assets/images/pages/home/sample.png',
    );
    const settings = await reader.singletons.siteSettings.readOrThrow();
    expect(settings.logo).toBe('@assets/images/settings/logo.png');
    for (const path of ['pages/home/sample.png', 'settings/logo.png']) {
      const bytes = await readFile(
        join(root, 'apps/site/src/assets/images', path),
      );
      expect([...bytes.subarray(0, 8)]).toEqual([
        137, 80, 78, 71, 13, 10, 26, 10,
      ]);
    }
  });

  it('filters drafts using the schema status value', async () => {
    const posts = await readContent(root).collections.posts.all();
    expect(
      posts.filter(({ entry }) => isPublished(entry)).map(({ slug }) => slug),
    ).toEqual(['first-post']);
  });

  it('round-trips stored metadata using the public schema field contract', () => {
    const title = contentConfig.collections.pages.schema.title;
    const parsed = title.parse('Photography', { slug: 'projects/photography' });
    expect(title.serializeWithSlug(parsed)).toEqual({
      value: 'Photography',
      slug: 'projects/photography',
    });
    const status = contentConfig.collections.posts.schema.status;
    expect(status.serialize(status.parse('published')).value).toBe('published');
  });

  it('rejects invalid metadata instead of silently publishing it', async () => {
    const temp = await mkdtemp(join(tmpdir(), 'starter-content-'));
    try {
      await cp(join(root, 'content'), join(temp, 'content'), {
        recursive: true,
      });
      const file = join(temp, 'content/posts/first-post/index.yaml');
      await writeFile(
        file,
        (await readFile(file, 'utf8')).replace(
          'status: published',
          'status: unknown',
        ),
      );
      await expect(
        readContent(temp).collections.posts.readOrThrow('first-post'),
      ).rejects.toThrow();
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
});
