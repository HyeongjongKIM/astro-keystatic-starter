# Content and Navigation Contract

## Entities

| Key | Keystatic type | Initial fields |
| --- | --- | --- |
| `pages` | Collection | title/slug, description, order, showInNavigation, content |
| `posts` | Collection | title/slug, excerpt, publishedDate, status, content |
| `siteSettings` | Singleton | siteName, description, logo, defaultSEO |

Do **not** create a separate Navigation entity or Directory type.

## Hierarchical Pages

| Page | Slug | URL |
| --- | --- | --- |
| Home | explicit reserved special value | `/` |
| About | `about` | `/about` |
| Projects | `projects` | `/projects` |
| Photography | `projects/photography` | `/projects/photography` |

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
