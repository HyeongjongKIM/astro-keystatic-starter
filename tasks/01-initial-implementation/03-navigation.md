# Task 03 — Nested Routes and Automatic Navigation

**Status:** DONE

**Depends on:** Task 02 DONE  
**Read:** [Content model](../../docs/content-model.md)

## Goal

Use only the Pages collection to generate static URLs, navigation menus, and breadcrumbs.

## Work

- [x] Define and document Home slug mapping and reserved route policy.
- [x] Implement Astro catch-all static route and `getStaticPaths()`.
- [x] Create pure Page-tree builder and deterministic sibling sort.
- [x] Render nested navigation and breadcrumbs from the same tree.
- [x] Implement proposed hidden-parent policy and route visibility.
- [x] Reject invalid slug, orphan node, duplicate route, and reserved route conflict.
- [x] Add unit tests covering nested depth, order ties, hidden pages, deletion.

## Acceptance criteria

- Adding a Page under a nested slug changes URL, menu, and breadcrumbs after build.
- No Navigation singleton/configuration is required.
- Invalid hierarchies fail with actionable build errors.
- Home generates exactly one root page.

## Verification evidence

### 2026-11-06 — verification

Environment: macOS arm64, pinned Node 22.23.4/pnpm 12.18.0. Read current official Astro routing/getStaticPaths documentation before implementation; root clean after Task 02 completion commit ce4e2a8.

- `pnpm install --frozen-lockfile`: exit 0; no dependency additions.
- `pnpm check`: exit 0: format, lint, shared typecheck, both Astro checks (zero errors/warnings/hints), 27 total tests, independent Site/Admin builds. Admin's previously recorded client chunk-size warning remains.
- 23 navigation test cases cover three-level nesting, exactly one Home, sibling order/ties, hidden parent and child menus, retained public routes and breadcrumbs, malformed/encoded slugs, reserved namespaces, missing/duplicate Home and routes, orphan nodes, invalid order, and parent/leaf deletion behavior.
- Baseline Site build generated `/`, `/projects/`, `/projects/photography/` with one root HTML page and navigation/breadcrumbs derived from the same Page tree.
- Integration fixture: temporarily added `projects/photography/portraits` as a Page, ran Site build and verified generated nested HTML, its menu href and current breadcrumb. Temporarily hid `projects` and rebuilt: descendant HTML and parent breadcrumb retained; parent/subtree absent from Main navigation. Temporarily removed the parent index: build exited nonzero with actionable `Orphan Page` message. Restored original files and removed temporary leaf in `finally`; baseline rebuild succeeded and removed its generated route.
- `git diff --check`: passed. No separate navigation model, client runtime, or additional block types introduced. Route and hidden-parent policy recorded in content-model specification.

Next task: Task 04, accessible public Site MVP.
