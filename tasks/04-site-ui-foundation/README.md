# Site UI Foundation Task Queue

**Status:** TODO

**Depends on:** [Phase 03 — Publishing workflow improvements](../03-publishing-workflow-improvements/README.md) DONE

Add React, Tailwind CSS, and shadcn/ui to `apps/site` as a foundation for customer-specific interfaces. Keep Astro layouts and content rendering, static output, and independent Admin deployment.

| ID  | Task                                                              | Dependency    | Status |
| --- | ----------------------------------------------------------------- | ------------- | ------ |
| 00  | [React, Tailwind CSS, and shadcn/ui](00-react-tailwind-shadcn.md) | Phase 03 DONE | TODO   |

This phase covers integration, Site-local UI components, theme and tooling setup, and verification. A full design refresh, wholesale conversion of existing CSS, and a shared UI package are outside its scope.

Implementation has not started. Complete Phase 03 first, then begin Task 00 only when the maintainer requests implementation. Record observed evidence in the task, then update this index and [the phase queue](../README.md) when statuses change. Preserve Phase 01 completion and its approved CACHE-01 deferral.

## Planning evidence

- 2026-11-10: Maintainer requested UI foundation planning only, then prioritized Repository workflow ahead of it. UI foundation is now Phase 03 and depends on Phase 02 completion. Phase and Task 00 remain TODO; no dependency installation or application changes.
- 2026-11-10, macOS arm64: `pnpm format:check` and `git diff --check` exited 0. A Python path-existence check passed for 28 local Markdown links across the phase queue and Phase 02/03 documents, and confirmed the old `02-site-ui-foundation` directory is absent. No application or browser checks were run for this documentation-only change.

- 2026-11-12: Renumbered to Phase 04 when Publishing workflow improvements was inserted as Phase 03. Current dependency is Phase 03 DONE; previous dated Phase 03 references describe the former queue order. Scope and TODO status are unchanged.

- 2026-11-12, Darwin x86_64, Node 22.23.5/pnpm 12.18.0: phase renumbering and local links were validated alongside the new Phase 03 plan; `pnpm check` passed the existing 70 tests, types, builds and static-output checks. UI integration, dependency selection and browser verification remain unperformed; this phase stays TODO.
