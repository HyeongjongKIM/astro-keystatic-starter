import type { Page } from './index';

export const HOME_SLUG = 'home';
export const RESERVED_ROOTS = new Set([
  'posts',
  'api',
  'keystatic',
  '_astro',
  'images',
  '404',
  'rss.xml',
  'robots.txt',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'favicon.ico',
  'favicon.svg',
]);
export type PageRecord = { slug: string; entry: Page };
export type PageNode = PageRecord & { href: string; children: PageNode[] };
export type PageTree = { roots: PageNode[]; bySlug: Map<string, PageNode> };
export type NavigationItem = {
  title: string;
  href: string;
  children: NavigationItem[];
};
export type Breadcrumb = { title: string; href: string };

export function pageHref(slug: string): string {
  return slug === HOME_SLUG ? '/' : `/${slug}/`;
}

export function buildPageTree(records: readonly PageRecord[]): PageTree {
  const bySlug = new Map<string, PageNode>();
  const paths = new Set<string>();
  for (const { slug, entry } of records) {
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(slug)
    ) {
      throw new Error(
        `Invalid Page slug "${slug}": use lowercase words joined by hyphens and / between levels`,
      );
    }
    const first = slug.split('/')[0];
    if (RESERVED_ROOTS.has(first) || slug.startsWith(`${HOME_SLUG}/`)) {
      throw new Error(
        `Reserved Page path "${slug}": choose another top-level slug`,
      );
    }
    if (!Number.isSafeInteger(entry.order))
      throw new Error(
        `Invalid order for Page "${slug}": expected a safe integer`,
      );
    const href = pageHref(slug);
    if (bySlug.has(slug) || paths.has(href))
      throw new Error(`Duplicate Page route "${href}" (${slug})`);
    paths.add(href);
    bySlug.set(slug, { slug, entry, href, children: [] });
  }
  if (!bySlug.has(HOME_SLUG))
    throw new Error(
      'Missing Home Page: create exactly one Page with slug "home"',
    );
  const roots: PageNode[] = [];
  for (const node of bySlug.values()) {
    const slash = node.slug.lastIndexOf('/');
    if (slash === -1) roots.push(node);
    else {
      const parentSlug = node.slug.slice(0, slash);
      const parent = bySlug.get(parentSlug);
      if (!parent)
        throw new Error(
          `Orphan Page "${node.slug}": create parent "${parentSlug}" or move/delete this Page`,
        );
      parent.children.push(node);
    }
  }
  function sort(nodes: PageNode[]) {
    nodes.sort(
      (a, b) =>
        a.entry.order - b.entry.order ||
        (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0),
    );
    for (const node of nodes) sort(node.children);
  }
  sort(roots);
  return { roots, bySlug };
}

export function navigationItems(nodes: readonly PageNode[]): NavigationItem[] {
  return nodes
    .filter(({ entry }) => entry.showInNavigation)
    .map((node) => ({
      title: node.entry.title,
      href: node.href,
      children: navigationItems(node.children),
    }));
}

export function breadcrumbs(tree: PageTree, slug: string): Breadcrumb[] {
  if (!tree.bySlug.has(slug)) throw new Error(`Unknown Page "${slug}"`);
  const home = tree.bySlug.get(HOME_SLUG)!;
  const result: Breadcrumb[] = [{ title: home.entry.title, href: home.href }];
  if (slug === HOME_SLUG) return result;
  const segments = slug.split('/');
  for (let i = 1; i <= segments.length; i++) {
    const node = tree.bySlug.get(segments.slice(0, i).join('/'))!;
    result.push({ title: node.entry.title, href: node.href });
  }
  return result;
}
