# Site UI Foundation Task Queue

**Status:** TODO

**Depends on:** [Phase 02 — Repository workflow](../02-repository-workflow/README.md) DONE

Add React, Tailwind CSS, and shadcn/ui to `apps/site` as a foundation for customer-specific interfaces. Keep Astro layouts and content rendering, static output, and independent Admin deployment.

| ID  | Task                                                              | Dependency    | Status |
| --- | ----------------------------------------------------------------- | ------------- | ------ |
| 00  | [React, Tailwind CSS, and shadcn/ui](00-react-tailwind-shadcn.md) | Phase 02 DONE | TODO   |

This phase covers integration, Site-local UI components, theme and tooling setup, and verification. A full design refresh, wholesale conversion of existing CSS, and a shared UI package are outside its scope.

Implementation has not started. Complete Phase 02 first, then begin Task 00 only when the maintainer requests implementation. Record observed evidence in the task, then update this index and [the phase queue](../README.md) when statuses change. Preserve Phase 01 completion and its approved CACHE-01 deferral.

## Planning evidence

- 2026-11-10: Maintainer requested UI foundation planning only, then prioritized Repository workflow ahead of it. UI foundation is now Phase 03 and depends on Phase 02 completion. Phase and Task 00 remain TODO; no dependency installation or application changes.
- 2026-11-10, macOS arm64: `pnpm format:check` and `git diff --check` exited 0. A Python path-existence check passed for 28 local Markdown links across the phase queue and Phase 02/03 documents, and confirmed the old `02-site-ui-foundation` directory is absent. No application or browser checks were run for this documentation-only change.
