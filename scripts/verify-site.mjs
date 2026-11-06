import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const repository = fileURLToPath(new URL('../', import.meta.url));
const dist = join(repository, 'apps/site/dist');
const read = (path) => readFile(join(dist, path), 'utf8');
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map(async (entry) =>
        entry.isDirectory()
          ? files(join(dir, entry.name))
          : [join(dir, entry.name)],
      ),
    )
  ).flat();
}
const [index, sitemap, rss, robots, missing] = await Promise.all(
  [
    'posts/index.html',
    'sitemap-0.xml',
    'rss.xml',
    'robots.txt',
    '404.html',
  ].map(read),
);
assert(!sitemap.includes('/404'), '404 must not appear in sitemap');
assert(robots.includes('sitemap-index.xml'), 'Robots must reference sitemap');
assert(missing.includes('noindex, follow'), '404 must be noindex');
for (const file of (await files(join(repository, 'content/posts'))).filter(
  (p) => p.endsWith('/index.yaml'),
)) {
  const post = parse(await readFile(file, 'utf8'));
  const slug = relative(
    join(repository, 'content/posts'),
    dirname(file),
  ).replaceAll('\\', '/');
  const path = `/posts/${slug}/`;
  if (post.status === 'published') {
    assert(
      index.includes(`href="${path}"`),
      `Published post missing from index: ${slug}`,
    );
    assert(
      sitemap.includes(path),
      `Published post missing from sitemap: ${slug}`,
    );
    assert(rss.includes(path), `Published post missing from RSS: ${slug}`);
    await access(join(dist, 'posts', slug, 'index.html'));
  } else {
    await assert.rejects(access(join(dist, 'posts', slug, 'index.html')), {
      code: 'ENOENT',
    });
    for (const text of [index, sitemap, rss])
      assert(!text.includes(path), `Draft leaked: ${slug}`);
  }
}
const paths = await files(dist);
for (const file of paths.filter((p) => p.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  assert(html.includes('rel="canonical"'), `Canonical required: ${file}`);
  assert(html.includes('property="og:title"'), `Open Graph required: ${file}`);
  assert(html.includes('name="description"'), `Description required: ${file}`);
  assert(html.includes('id="main"'), `Skip-link target required: ${file}`);
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) || []).length,
    1,
    `One H1 required: ${file}`,
  );
  assert(
    !html.includes('keystatic-page'),
    'Admin UI must not ship in Site HTML',
  );
  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    assert(/\balt(?:=|\s|>)/.test(img), 'Image alt attribute required');
    assert(
      /\bwidth="\d+"/.test(img) && /\bheight="\d+"/.test(img),
      'Image dimensions required',
    );
    assert(
      /src="\/_astro\/[^"]+\.(webp|svg)"/.test(img),
      'Use optimized imported images',
    );
  }
}
assert(
  !paths
    .map((p) => relative(dist, p))
    .some((p) => /(_worker|keystatic|server\/entry)/.test(p)),
  'No Admin/server handlers in static output',
);
console.log(
  'Static Site checks passed: publication, image metadata/optimization, SEO, RSS, sitemap, 404, isolation',
);
