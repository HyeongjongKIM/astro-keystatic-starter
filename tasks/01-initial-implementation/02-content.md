# Task 02 — Shared Content System

**Status:** IN_PROGRESS

**Depends on:** Task 01 DONE  
**Read:** [Content model](../../docs/content-model.md), [Architecture](../../docs/architecture.md)

## Goal

Create Keystatic Pages, Posts, and Site Settings with schema sharing and a minimal extensible Blocks body.

## Work

- [x] Implement one shared schema and type inference entrypoint.
- [x] Add nested Pages Collection with title, slug, description, order, showInNavigation, content.
- [x] Add Posts Collection with publishedDate and draft/published status.
- [x] Add Site Settings Singleton with title, description, logo, SEO defaults.
- [x] Use `fields.blocks()` containing only an MDX rich-text block in both collections.
- [ ] Validate GitHub pathPrefix, storage paths, image directories, and Astro content reading.
- [x] Add fixtures and tests for serialization, content validation, and images.

## Acceptance criteria

- Admin CRUD writes files exactly where Site build expects them.
- Sample MDX body and image render correctly in the Site build.
- No duplicated schema definitions or extra block types.
- Draft posts can be filtered reliably.

## Verification evidence

### 2026-11-06 — implementation checkpoint; deployed validation pending

Environment: macOS arm64, Node 22.23.4/pnpm 12.18.0 via pinned `npm exec`. Official Blocks, MDX, nested wildcard, content organization, Reader API and Astro MDX/config-import documentation consulted. Root was clean at start, following foundation commit 57c9a2f.

- `pnpm install`: passed; pinned MDX integration and root lockfile updated. Type dependency resolution rationale is recorded in Task 00.
- Initial strict shared-package check failed on incompatible transitive markdown-it/linkify-it declarations; parent-specific type dependency pin resolved it. A subsequent missing Node test typing error was fixed by declaring the test's Node types/dependencies.
- Initial Site build located content relative to a bundled module and failed to find Home. Switched to documented `root` from `astro:config/server`, then derived the repository root, which works across prerender bundling.
- `pnpm check`: exit 0 after fixes: format, ESLint, shared `tsc`, both Astro checks (zero errors/warnings/hints), 4 Vitest tests, static Site and Workers Admin builds. Existing Admin chunk-size warning remains.
- Tests read nested `projects/photography`, linked MDX rich text, image URLs/PNG signatures, settings and published/draft fixtures; public schema fields round-trip metadata; invalid status is rejected by Reader API.
- Python inspection of `apps/site/dist/index.html`: `<strong>Keystatic</strong>` and `/images/pages/home/sample.png` present; matching built image exists.
- Paths and `pathPrefix` decision documented in `docs/content-model.md`; fixtures are Reader-validated, but actual new-schema Admin writes are not yet claimed.
- Started approved Node-only provisioning configuration and opened `/keystatic/setup` in dedicated Chrome; prepared deployed preview URL and requested account-owner GitHub App creation/installation for this repository only. No credentials committed. Runtime deployment and actual UI CRUD/image validation remain pending; Task 03 must not start yet.
