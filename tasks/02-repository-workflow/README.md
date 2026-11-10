# Repository Workflow Task Queue

**Status:** TODO

**Depends on:** [Phase 01](../01-initial-implementation/README.md) DONE

Define a reusable branch and publishing strategy for this template and independent customer repositories, then implement change-aware CI and verify deployment triggers. Maintainer priority: complete this phase before Site UI foundation work.

| ID  | Task                                                                   | Dependency    | Status |
| --- | ---------------------------------------------------------------------- | ------------- | ------ |
| 00  | [Branch and content publishing policy](00-branch-publishing-policy.md) | Phase 01 DONE | TODO   |
| 01  | [Change-aware CI and deployment verification](01-ci-deployment.md)     | 00            | TODO   |

Planning only: no workflows, repository rules, GitHub App permissions, or Cloudflare settings have been changed. Task 00 must resolve the policy decisions before Task 01 applies settings. Keep the task evidence, this index, and [the phase queue](../README.md) consistent when statuses change.

Agreed baseline: development work is collected on `dev` and promoted to production `main` through PRs, with no required feature/fix/docs branches. Site preview is intended to use `dev`; the existing `preview` transition and Keystatic content-save target remain unresolved in Task 00.

Admin automatic deployment is also in scope: affected `dev` updates deploy the preview Worker and affected `main` updates deploy the production Worker after successful checks. Docs-only, editorial-content/image-only, and Site-only changes must not deploy Admin; Admin-only changes must not deploy Site. Shared changes require target-specific impact classification. This policy is planned, not implemented.

## Planning evidence

- 2026-11-10: Maintainer requested separate policy and implementation tasks, with Repository workflow preceding Site UI foundation. Both tasks remain TODO. External settings and deployed behavior are unverified.
- 2026-11-10, macOS arm64: `pnpm format:check` and `git diff --check` exited 0; a Python path-existence check passed for 34 local Markdown links in the six workflow-planning documents. No application or remote checks were run for this documentation-only change.
- 2026-11-10, macOS arm64, Admin automatic deployment planning update: `pnpm format:check` and `git diff --check` exited 0; a Python path-existence check passed for 15 local links in the three Phase 02 documents. No application, deployment, or deployed authentication/write checks were run; both tasks remain TODO.
