# Task 03 — Nested Routes and Automatic Navigation

**Status:** TODO  
**Depends on:** Task 02 DONE  
**Read:** [Content model](../../docs/content-model.md)

## Goal

Use only the Pages collection to generate static URLs, navigation menus, and breadcrumbs.

## Work

- [ ] Define and document Home slug mapping and reserved route policy.
- [ ] Implement Astro catch-all static route and `getStaticPaths()`.
- [ ] Create pure Page-tree builder and deterministic sibling sort.
- [ ] Render nested navigation and breadcrumbs from the same tree.
- [ ] Implement proposed hidden-parent policy and route visibility.
- [ ] Reject invalid slug, orphan node, duplicate route, and reserved route conflict.
- [ ] Add unit tests covering nested depth, order ties, hidden pages, deletion.

## Acceptance criteria

- Adding a Page under a nested slug changes URL, menu, and breadcrumbs after build.
- No Navigation singleton/configuration is required.
- Invalid hierarchies fail with actionable build errors.
- Home generates exactly one root page.

## Verification evidence

_Pending: commands, test fixtures, observed routes._
