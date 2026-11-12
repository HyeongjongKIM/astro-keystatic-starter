# Repository Workflow Task Queue

**Status:** IN_PROGRESS

**Depends on:** [Phase 01](../01-initial-implementation/README.md) DONE

Define a reusable branch and publishing strategy for this template and independent customer repositories, then implement change-aware CI and verify deployment triggers. Maintainer priority: complete this phase before Site UI foundation work.

| ID  | Task                                                                   | Dependency    | Status      |
| --- | ---------------------------------------------------------------------- | ------------- | ----------- |
| 00  | [Branch and content publishing policy](00-branch-publishing-policy.md) | Phase 01 DONE | DONE        |
| 01  | [Change-aware CI and deployment verification](01-ci-deployment.md)     | 00            | IN_PROGRESS |

Task 00 policy is confirmed and documented in [repository workflow](../../docs/repository-workflow.md). Content is saved on `dev`; merge-commit PRs promote code and content together to `main`, with zero required approvals and required CI. Both apps deploy affected targets only after CI succeeds. Task 01 applies the policy and verifies live behavior; historical `preview` resources are preserved during transition.

## Planning evidence

- 2026-11-10: Maintainer requested separate policy and implementation tasks, with Repository workflow preceding Site UI foundation. Both tasks remain TODO. External settings and deployed behavior are unverified.
- 2026-11-10, macOS arm64: `pnpm format:check` and `git diff --check` exited 0; a Python path-existence check passed for 34 local Markdown links in the six workflow-planning documents. No application or remote checks were run for this documentation-only change.
- 2026-11-10, macOS arm64, Admin automatic deployment planning update: `pnpm format:check` and `git diff --check` exited 0; a Python path-existence check passed for 15 local links in the three Phase 02 documents. No application, deployment, or deployed authentication/write checks were run; both tasks remain TODO.
