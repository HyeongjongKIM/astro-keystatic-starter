# Publishing Workflow Improvements Task Queue

**Status:** IN_PROGRESS

**Depends on:** [Phase 02 — Repository workflow](../02-repository-workflow/README.md) DONE

Separate editorial publication from code development, automate promotion PR creation and merging after required checks, improve deployment recovery and target independence, reuse validated Admin artifacts, and automate Action dependency updates. The maintainer requested this as a new phase before Site UI foundation; Phase 02 remains completed history.

| ID  | Task                                                                             | Dependency    | Status      |
| --- | -------------------------------------------------------------------------------- | ------------- | ----------- |
| 00  | [Publishing and synchronization policy](00-publishing-policy.md)                 | Phase 02 DONE | DONE        |
| 01  | [Content branch, previews and automated promotion](01-content-branch-preview.md) | 00            | IN_PROGRESS |
| 02  | [Deployment recovery and target isolation](02-deployment-recovery.md)            | 01            | TODO        |
| 03  | [Validated Admin deployment artifacts](03-admin-artifacts.md)                    | 02            | TODO        |
| 04  | [Action pinning and update automation](04-actions-maintenance.md)                | 03            | TODO        |
| 05  | [Deployed verification and customer handoff](05-deployed-verification.md)        | 00–04 DONE    | TODO        |

## Planning baseline

The proposed operating model is `dev` for code, `content` for editorial work, and `main` for production, with separate `dev → main` and `content → main` PRs. The maintainer requested automatic PR creation and automatic merging for both promotion paths after required checks pass; manual merging is not the target workflow. Development and editorial Site previews should be independently addressable. Task 00 must confirm detailed policy, synchronization, deployment mappings and recovery behavior before implementation. Creating this phase does not approve unverified APIs or every proposed implementation choice.

The current [repository workflow](../../docs/repository-workflow.md) remains effective until implementation updates it. There is no `content` branch migration, new preview environment, protection change, deployment change or dependency installation in this planning revision. Implementation starts with Task 00 only when requested; stop on unresolved dependencies or unsupported behavior.

## Requested automation and policy decisions

The target flow is `push to dev/content → create or reuse promotion PR → required PR checks → automatic merge → main CI → affected production deployments`. Existing open PRs should receive later commits without duplicate PRs; synchronization-only pushes or no publication diff should not create empty PRs or automation loops.

Task 00 must define when a push is eligible for publication. With unconditional promotion, pushing to dev or saving content is a production-publication decision once checks pass. A proposed working model is to keep unfinished code on temporary work branches and reserve dev for changes ready to publish. Confirm whether editorial saves are also immediately publishable or need an explicit readiness signal; do not silently add a manual merge requirement.

Task 01 implements the confirmed policy, including main synchronization back to both long-lived branches, current-head checks, supported authentication/event propagation and consistent Conventional Commit merge titles. Conflicts, failed/cancelled checks and missing permissions must stop promotion visibly. Automatic merging does not prove production deployment succeeded; Task 02 covers deployment recovery. Task 04's dependency-update PRs are a distinct route whose eligibility must be decided explicitly.

## Boundaries and completion

- Preserve static Site/authenticated Admin separation, customer-owned repositories, existing content schemas and current Node/pnpm pins.
- Keep required PR checks, read-only validation jobs, environment restrictions and valid authentication secrets. No protected-main or App permission bypass. Promotion automation may use separately scoped credentials only through the supported mechanism selected in Task 00; validation jobs remain read-only and unprivileged.
- Keystatic branch selection and a prefix do not establish an exact-branch access restriction. A content-path CI rule is an operational guard, not a repository permission sandbox; MDX is compiled code and editors remain trusted repository writers.
- Preserve existing domains, callbacks and the historical `preview` branch until dependencies are inspected and any retirement is explicitly agreed. No automatic branch deletion is implied.
- Keep recovery within supported GitHub Actions/Wrangler mechanisms; no new database, custom deployment service or private framework hooks. New architecture requires maintainer direction.
- Keep Phase 01/02 completion records and the accepted CACHE-01 deferral intact. Record new failures and limitations with actual evidence.
- Mark this phase DONE only after all tasks pass, including deployed authentication/writes and failure/skip/recovery cases. Update the [phase queue](../README.md); [Phase 04 — Site UI foundation](../04-site-ui-foundation/README.md) waits for this phase.

## Planning evidence

2026-11-12: Maintainer expanded the planned scope to combine content-branch separation with automatic creation and merging of dev/content promotion PRs after required checks. Updated policy, implementation, recovery, dependency-update and deployed-verification plans. All tasks remain TODO. This revision does not enable automation or change current manual PR/merge behavior, repository settings or hosting. Validation for this revision on Darwin x86_64, Node `v22.23.5`, pnpm `12.18.0`: `pnpm check` exited 0 (format, lint, zero type diagnostics, 70 tests, Site/preview Admin builds and static output verification); `node scripts/ci/run.mjs docs` passed 174 local Markdown links; `git diff --check` passed. Existing Admin bundle-size warning remains. These checks validate the documentation revision and existing project, not the planned automation. No deployed E2E or remote-setting changes were performed. The maintainer reviewed the planned flow and subsequently requested committing and pushing this documentation revision.

2026-11-12: Maintainer requested creation of this phase after reviewing the current workflow. Created six TODO tasks and moved the unstarted Site UI foundation from Phase 03 to Phase 04. Planning only; application code, workflows, branch rules, hosting settings and credentials are unchanged. Validation results for this planning revision are recorded below.

2026-11-12, Darwin x86_64, Node `v22.23.5`, pnpm `12.18.0`: `pnpm check` exited 0 (format, lint, both app/shared types with zero diagnostics, 70 tests, Site/preview Admin builds and static output verification). `node scripts/ci/run.mjs docs` passed 171 local Markdown links; `git diff --cached --check` passed after replacing an inherited Markdown hard-break with a blank line on the modified UI task dependency header. Structural checks confirmed six TODO task files and removal of the obsolete UI directory/path. Existing Admin bundle-size warnings remain. These are planning-change regression checks, not implementation or deployed behavior evidence for this phase. No new unit tests or deployed E2E were needed for this documentation-only revision.

2026-11-12: Task 00 read-only live investigation and concrete policy proposal are in progress; maintainer confirmation remains pending. Existing publishing operations remain unchanged. Tasks 01–05 have not started.

2026-11-12: The maintainer delegated policy choices to the recommended approach. Task 00 is DONE; the selected [policy](../../docs/publishing-policy.md) is the implementation contract. The current manual operating workflow remains active until Task 01 migration. Tasks 01–05 remain TODO.

2026-11-12: Task 01 implementation and regressions are prepared with automatic promotion disabled. The maintainer authorized commit/push to dev but prohibited merging. Protected-main bootstrap, App/environment/content provisioning and remote promotion verification remain pending; Task 01 is IN_PROGRESS and Tasks 02–05 remain TODO.

2026-11-12: Implementation `b70e1f2` was committed/pushed to dev as authorized. Remote [CI 43193750585](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43193750585) passed all six validation/deployment jobs and 104 tests; existing dev Site/Admin preview regression checks passed. Main and legacy preview remain unchanged; automatic promotion and content migration remain unactivated. Task 01 remains IN_PROGRESS pending the prohibited bootstrap merge and subsequent provisioning/remote acceptance, not DONE from local compilation or dev CI alone.
