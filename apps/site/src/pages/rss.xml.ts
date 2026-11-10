import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { reader } from '../lib/content';
import { publishedPosts } from '../lib/site';
export async function GET(context: APIContext) {
  const settings = await reader.singletons.siteSettings.readOrThrow();
  return rss({
    title: settings.siteName,
    description: settings.description,
    site: context.site!,
    items: (await publishedPosts()).map(({ slug, entry }) => ({
      title: entry.title,
      description: entry.excerpt,
      pubDate: new Date(entry.publishedDate),
      link: `/posts/${slug}/`,
    })),
  });
}
