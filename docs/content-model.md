# Content and Navigation Contract

## Entities

| Key            | Keystatic type | Initial fields                                            |
| -------------- | -------------- | --------------------------------------------------------- |
| `pages`        | Collection     | title/slug, description, order, showInNavigation, content |
| `posts`        | Collection     | title/slug, excerpt, publishedDate, status, content       |
| `siteSettings` | Singleton      | siteName, description, logo, defaultSEO                   |

Do **not** create a separate Navigation entity or Directory type.

## Hierarchical Pages

| Page        | Slug                            | URL                     |
| ----------- | ------------------------------- | ----------------------- |
| Home        | explicit reserved special value | `/`                     |
| About       | `about`                         | `/about`                |
| Projects    | `projects`                      | `/projects`             |
| Photography | `projects/photography`          | `/projects/photography` |

- Evaluate Keystatic's documented nested `**` collection path and Astro's `[...slug].astro` + `getStaticPaths()`.
- Derive navigation and breadcrumbs from the same Page collection used for static routes.
- Sort siblings by numeric `order`, then slug for deterministic ties.
- `showInNavigation` defaults to true and does not control route publication.
- Initial proposed hidden-parent policy: hide that subtree in menus but keep public descendant URLs; test before release.
- Reject missing parents, duplicate paths, reserved route names, and conflicting Home routes.
- Slug changes can break backlinks; manage deliberate redirects, not implicit magic migrations.

## Body content

Both Pages and Posts use one shared Keystatic `fields.blocks()` field. The only MVP block type is `richText`, implemented with `fields.mdx()` and the standard editor. Verify serialized output and Astro rendering against installed versions.

Future block additions must include matching schema, Astro renderer, fixture, and tests. Do not build custom blocks now.

## Publication and tests

- Posts support draft/published; only published content appears in routes, RSS, sitemap.
- Draft files in a public GitHub repository are **not confidential**.
- Test nested routes, Home, sort ties, hidden menus, breadcrumbs, invalid slugs, MDX/image rendering, draft exclusion.

## Official sources

- https://keystatic.com/docs/fields/blocks
- https://keystatic.com/docs/fields/mdx
- https://keystatic.com/docs/path-wildcard
- https://docs.astro.build/en/guides/routing/

## MVP storage layout

All Keystatic paths are relative to the repository root. `storage.pathPrefix` is intentionally omitted: setting it to `apps/admin` would incorrectly nest content and Site images under that directory. Admin uses the shared `createContentConfig` and a non-secret build-time `KEYSTATIC_GITHUB_REPO`. Site uses the official local Reader API against the repository root at build time, without a GitHub token.

- Pages: `content/pages/**/index.yaml` (supports `projects/photography`).
- Posts: `content/posts/*/index.yaml`.
- Site Settings: `content/settings/site.yaml`.
- Each `richText` block has `value.body` as `fields.mdx()`. The deployed editor and Reader-validated linked file is `content/{pages|posts}/{slug}/content/{index}/value/body.mdx`, compiled using the official Astro MDX integration and imported through Vite's glob API.
- Rich text images: `apps/site/public/images/{pages|posts}/`; public URLs start `/images/{pages|posts}/`. Settings images use `apps/site/public/images/settings/`. Keep these repository and URL paths paired when customizing.
- YAML records contain title text; the slug is derived from the entry path through Keystatic's slug field. Posts default to draft; `isPublished` filters only explicit `published` status.

The samples are starter content. The `home` sample currently renders at `/`; Task 03 owns the complete Home/reserved-route policy and hierarchy validation. No separate Navigation model is introduced. MDX files are tracked editable content, not generated outputs; never put secrets in them.

## Route policy

The reserved Page slug `home` maps to `/` and must occur exactly once. `home/child` is not a valid hierarchy; other top-level Pages are siblings of Home and Home is prepended to their breadcrumb trails. URLs always end in `/`. Slugs consist of lowercase ASCII words separated by hyphens, with `/` between levels; malformed or ambiguous encoded paths are rejected rather than normalized.

Root namespaces reserved for generated/system routes: `posts`, `api`, `keystatic`, `_astro`, `images`, `404`, `rss.xml`, `robots.txt`, sitemap files and favicons. Dot/underscore names also fail the slug grammar. Every nested Page requires a Page for every parent prefix. Duplicate routes, missing Home, orphan nodes and non-integer orders fail the build with the offending slug.

Hidden-parent policy: `showInNavigation: false` removes that Page and its descendants from menus. It does not suppress static routes or breadcrumb ancestors. Siblings sort by numeric order and then lexical slug; input enumeration and machine locale do not affect ties. Deleting a parent requires moving/deleting descendants first; otherwise the next build fails.
