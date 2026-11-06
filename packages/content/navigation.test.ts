import { describe, expect, it } from 'vitest';
import {
  buildPageTree,
  breadcrumbs,
  navigationItems,
  pageHref,
  type PageRecord,
} from './navigation';

const page = (slug: string, order = 0, visible = true): PageRecord => ({
  slug,
  entry: {
    title: slug,
    description: '',
    order,
    showInNavigation: visible,
    content: [],
  },
});

describe('Page routes and navigation', () => {
  it('maps exactly one Home and arbitrary nested depth to routes and breadcrumbs', () => {
    const tree = buildPageTree([
      page('work/a/b'),
      page('home'),
      page('work/a'),
      page('work'),
    ]);
    expect(pageHref('home')).toBe('/');
    expect(tree.bySlug.get('work/a/b')?.href).toBe('/work/a/b/');
    expect(breadcrumbs(tree, 'work/a/b').map((x) => x.href)).toEqual([
      '/',
      '/work/',
      '/work/a/',
      '/work/a/b/',
    ]);
    expect(breadcrumbs(tree, 'home')).toHaveLength(1);
    expect(
      [...tree.bySlug.values()].filter((x) => x.href === '/'),
    ).toHaveLength(1);
  });
  it('sorts siblings by order and stable lexical slug independently of input order', () => {
    const pages = [
      page('home', -1),
      page('work'),
      page('work/z', 2),
      page('work/a', 2),
      page('work/first', -1),
    ];
    const menus = navigationItems(buildPageTree(pages.reverse()).roots);
    expect(menus[1].children.map((x) => x.href)).toEqual([
      '/work/first/',
      '/work/a/',
      '/work/z/',
    ]);
  });
  it('hides a hidden parent subtree in menus while preserving routes and breadcrumbs', () => {
    const tree = buildPageTree([
      page('home'),
      page('hidden', 0, false),
      page('hidden/visible'),
      page('work'),
      page('work/hidden', 0, false),
    ]);
    expect(navigationItems(tree.roots).map((x) => x.href)).toEqual([
      '/',
      '/work/',
    ]);
    expect(navigationItems(tree.roots)[1].children).toEqual([]);
    expect(tree.bySlug.get('hidden/visible')?.href).toBe('/hidden/visible/');
    expect(breadcrumbs(tree, 'hidden/visible').map((x) => x.href)).toEqual([
      '/',
      '/hidden/',
      '/hidden/visible/',
    ]);
  });
  it.each([
    '',
    '/about',
    'about/',
    'a//b',
    'About',
    'a/../b',
    'a%2Fb',
    'a?b',
    'a b',
    '-a',
    'a_1',
  ])('rejects malformed slug %j', (slug) => {
    expect(() => buildPageTree([page('home'), page(slug)])).toThrow(
      'Invalid Page slug',
    );
  });
  it.each([
    'posts',
    'posts/story',
    'api',
    'images/example',
    'keystatic',
    '404',
    'home/child',
  ])('rejects reserved namespace %s', (slug) => {
    expect(() => buildPageTree([page('home'), page(slug)])).toThrow(
      'Reserved Page path',
    );
  });
  it('rejects missing/duplicate Home, duplicates, orphan nodes and invalid order', () => {
    expect(() => buildPageTree([page('about')])).toThrow('Missing Home');
    expect(() => buildPageTree([page('home'), page('home')])).toThrow(
      'Duplicate Page route',
    );
    expect(() => buildPageTree([page('home'), page('a'), page('a')])).toThrow(
      'Duplicate Page route',
    );
    expect(() => buildPageTree([page('home'), page('a/b')])).toThrow(
      'create parent "a"',
    );
    expect(() => buildPageTree([page('home', NaN)])).toThrow('Invalid order');
  });
  it('requires child cleanup when deleting a parent, and removes a deleted leaf everywhere', () => {
    expect(() => buildPageTree([page('home'), page('work/child')])).toThrow(
      'Orphan Page',
    );
    const tree = buildPageTree([page('home'), page('work')]);
    expect(tree.bySlug.has('work/child')).toBe(false);
    expect(navigationItems(tree.roots)[1].children).toEqual([]);
    expect(() => breadcrumbs(tree, 'work/child')).toThrow('Unknown Page');
  });
});
