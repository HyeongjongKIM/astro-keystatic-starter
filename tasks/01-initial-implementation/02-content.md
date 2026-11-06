# Task 02 — Shared Content System

**Status:** TODO  
**Depends on:** Task 01 DONE  
**Read:** [Content model](../../docs/content-model.md), [Architecture](../../docs/architecture.md)

## Goal

Create Keystatic Pages, Posts, and Site Settings with schema sharing and a minimal extensible Blocks body.

## Work

- [ ] Implement one shared schema and type inference entrypoint.
- [ ] Add nested Pages Collection with title, slug, description, order, showInNavigation, content.
- [ ] Add Posts Collection with publishedDate and draft/published status.
- [ ] Add Site Settings Singleton with title, description, logo, SEO defaults.
- [ ] Use `fields.blocks()` containing only an MDX rich-text block in both collections.
- [ ] Validate GitHub pathPrefix, storage paths, image directories, and Astro content reading.
- [ ] Add fixtures and tests for serialization, content validation, and images.

## Acceptance criteria

- Admin CRUD writes files exactly where Site build expects them.
- Sample MDX body and image render correctly in the Site build.
- No duplicated schema definitions or extra block types.
- Draft posts can be filtered reliably.

## Verification evidence

_Pending: exact commands, sample file layout, observed results._
