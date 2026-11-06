import { reader } from './content';
import { buildPageTree, navigationItems } from '@starter/content/navigation';
import { isPublished } from '@starter/content';

export async function siteContext() {
  const [settings, pages] = await Promise.all([
    reader.singletons.siteSettings.readOrThrow(),
    reader.collections.pages.all(),
  ]);
  const tree = buildPageTree(pages);
  return { settings, tree, navigation: navigationItems(tree.roots) };
}
export async function publishedPosts() {
  return (await reader.collections.posts.all())
    .filter(({ entry }) => isPublished(entry))
    .sort(
      (a, b) =>
        (b.entry.publishedDate || '').localeCompare(
          a.entry.publishedDate || '',
        ) || a.slug.localeCompare(b.slug),
    );
}
