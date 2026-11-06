# Task 04 — Public Site MVP

**Status:** DONE

**Depends on:** Task 03 DONE  
**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md)

## Goal

Deliver an accessible, responsive Astro static site for generic customer content.

## Work

- [x] Build BaseLayout, Header, Footer, Page and Post layouts.
- [x] Add minimalist CSS variables for branding, typography, spacing.
- [x] Add post index/details, responsive menus, 404 and internal links.
- [x] Add canonical, title, description, Open Graph, robots, favicon.
- [x] Use official Astro sitemap and RSS integrations.
- [x] Handle image dimensions, alt text, and optimized asset output.
- [x] Verify draft exclusion from public routes, sitemap, RSS.
- [x] Run accessibility and SEO smoke checks.

## Acceptance criteria

- Site builds as static assets without an Admin runtime dependency.
- Responsive navigation is keyboard accessible.
- Published content is indexable and draft content absent.
- SEO/Sitemap/RSS and 404 function in production-like preview.

## Verification evidence

### 2026-11-06 — static Site verification

Environment: macOS arm64, Node 22.23.4/pnpm 12.18.0, Playwright CLI with system Chrome, axe-core 4.14.0. Official Astro sitemap/RSS/images, Keystatic Astro images recipe, Vite environment API and axe-core API consulted before implementation. Started from clean Task 03 commit a32cc82.

- `pnpm install`: exit 0; exact dependency selections recorded in Task 00 and lockfile. Added official sitemap/RSS integrations, direct Vite loadEnv dependency and development-only axe/YAML verification tools.
- `pnpm check`: final exit 0: format, ESLint, both shared-package type checks, both Astro checks (zero errors/warnings/hints), 27 unit tests, both independent builds and `pnpm verify:site`. Initial authoring checks caught an unquoted YAML alias reference and a redundant regex escape; both corrected before final verification.
- Static routes: Home, projects, nested photography, Posts index, published first-post, robots, RSS and 404. No draft-post HTML route, index entry, RSS item or sitemap URL. Canonical and Open Graph metadata use PUBLIC_SITE_URL (default example.com for local verification); 404 is noindex and excluded from sitemap.
- Migrated editable image directories from public to `apps/site/src/assets/images`, with paired `@assets` aliases and standard MDX image rendering through Astro Image. Build emitted WebP with width/height and retained image alt text. Identical fixture pixels were deduplicated into one optimized output, as expected. Updated isolated schema/image test fixtures; no custom block type added.
- `pnpm verify:site`: checks current Post publication state against actual output (no sample title dependency), image optimization/dimensions/alt, metadata, 404 and absence of Admin/server artifacts. It now runs after builds in root check/CI.
- Official `astro preview` on port 4323: Home/Post inspected in Chrome. Axe WCAG 2 A/AA and 2.1 AA checks returned zero violations for Home desktop (17 passes), Home at 390×844 with menu open, and Post detail. Native details summary opened with Enter; Tab reached the first navigation link; mobile document had no horizontal overflow. These are smoke checks, not full assistive-technology certification.
- Preview `/not-a-page/` returned HTTP 404 and Page not found heading. Browser confirmed Post canonical `https://example.com/posts/first-post/`.
- Visual inspection of local `output/playwright/task04-mobile.png` confirmed responsive menu, content and footer. Output is ignored and not committed.
- Private scan of all 13 public output files found neither actual KEYSTATIC_GITHUB_CLIENT_SECRET nor KEYSTATIC_SECRET. No Admin UI/runtime handlers shipped in Site.
- `git diff --check`: passed. Customer image editing with the new source-asset directory will be exercised in Task 05's deployed write-to-publish test; Task 02's historical public-directory E2E remains recorded as the previous layout.

Next task: Task 05, Git-connected Pages deployment and customer handoff. Known local Workers API runner limitation and Admin chunk-size warning remain recorded; no production customer deployment is claimed here.
