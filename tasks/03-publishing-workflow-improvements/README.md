# Publishing Workflow Improvements Task Queue

**Status:** TODO

**Depends on:** [Phase 02 — Repository workflow](../02-repository-workflow/README.md) DONE

Separate editorial publication from code development, improve deployment recovery and target independence, reuse validated Admin artifacts, and automate Action dependency updates. The maintainer requested this as a new phase before Site UI foundation; Phase 02 remains completed history.

| ID  | Task                                                                      | Dependency    | Status |
| --- | ------------------------------------------------------------------------- | ------------- | ------ |
| 00  | [Publishing and synchronization policy](00-publishing-policy.md)          | Phase 02 DONE | TODO   |
| 01  | [Content branch and preview workflow](01-content-branch-preview.md)       | 00            | TODO   |
| 02  | [Deployment recovery and target isolation](02-deployment-recovery.md)     | 01            | TODO   |
| 03  | [Validated Admin deployment artifacts](03-admin-artifacts.md)             | 02            | TODO   |
| 04  | [Action pinning and update automation](04-actions-maintenance.md)         | 03            | TODO   |
| 05  | [Deployed verification and customer handoff](05-deployed-verification.md) | 00–04 DONE    | TODO   |

## Planning baseline

The proposed operating model is `dev` for code, `content` for editorial work, and `main` for production, with separate `dev → main` and `content → main` PRs. Development and editorial Site previews should be independently addressable. Task 00 must confirm detailed policy, synchronization, deployment mappings and recovery behavior before implementation. Creating this phase does not approve unverified APIs or every proposed implementation choice.

The current [repository workflow](../../docs/repository-workflow.md) remains effective until implementation updates it. There is no `content` branch migration, new preview environment, protection change, deployment change or dependency installation in this planning revision. Implementation starts with Task 00 only when requested; stop on unresolved dependencies or unsupported behavior.

## Boundaries and completion

- Preserve static Site/authenticated Admin separation, customer-owned repositories, existing content schemas and current Node/pnpm pins.
- Keep required PR checks, read-only validation jobs, environment restrictions and valid authentication secrets. No protected-main or App permission bypass.
- Keystatic branch selection and a prefix do not establish an exact-branch access restriction. A content-path CI rule is an operational guard, not a repository permission sandbox; MDX is compiled code and editors remain trusted repository writers.
- Preserve existing domains, callbacks and the historical `preview` branch until dependencies are inspected and any retirement is explicitly agreed. No automatic branch deletion is implied.
- Keep recovery within supported GitHub Actions/Wrangler mechanisms; no new database, custom deployment service or private framework hooks. New architecture requires maintainer direction.
- Keep Phase 01/02 completion records and the accepted CACHE-01 deferral intact. Record new failures and limitations with actual evidence.
- Mark this phase DONE only after all tasks pass, including deployed authentication/writes and failure/skip/recovery cases. Update the [phase queue](../README.md); [Phase 04 — Site UI foundation](../04-site-ui-foundation/README.md) waits for this phase.

## Planning evidence

2026-11-12: Maintainer requested creation of this phase after reviewing the current workflow. Created six TODO tasks and moved the unstarted Site UI foundation from Phase 03 to Phase 04. Planning only; application code, workflows, branch rules, hosting settings and credentials are unchanged. Validation results for this planning revision are recorded below.

2026-11-12, Darwin x86_64, Node `v22.23.5`, pnpm `12.18.0`: `pnpm check` exited 0 (format, lint, both app/shared types with zero diagnostics, 70 tests, Site/preview Admin builds and static output verification). `node scripts/ci/run.mjs docs` passed 171 local Markdown links; `git diff --cached --check` passed after replacing an inherited Markdown hard-break with a blank line on the modified UI task dependency header. Structural checks confirmed six TODO task files and removal of the obsolete UI directory/path. Existing Admin bundle-size warnings remain. These are planning-change regression checks, not implementation or deployed behavior evidence for this phase. No new unit tests or deployed E2E were needed for this documentation-only revision.
