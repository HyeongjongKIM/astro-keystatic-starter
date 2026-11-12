# Task 01 — Content Branch, Previews and Automated Promotion

**Status:** IN_PROGRESS

**Depends on:** [Task 00](00-publishing-policy.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Implement the confirmed editorial branch, independent previews and automatic promotion PR creation/merging without changing content schemas or the static Site/Admin boundary.

## Work

- [ ] Read and preserve current remote settings, branch work and preview/callback dependencies. Create or synchronize content from the approved main baseline without rewriting history.
- [x] Add the approved content-push and promotion-PR checks, stable required gate and Site deployment conditions. Preserve dev/main behavior, correct push/PR bases, new-branch fallback, deletion/rename handling and editorial commit-message compatibility.
- [x] Implement Task 00's automatic promotion for dev → main and content → main. Create one PR when an eligible publication diff exists, reuse an open PR for later pushes and merge automatically only after current required checks and effective protection conditions are satisfied. Respect the confirmed readiness, draft/closed-PR and retry policies.
- [ ] Use the supported credentials and event strategy verified in Task 00. Observe required PR CI on automation-created PRs and main CI after automatic merging. Privileged promotion must not execute untrusted PR code, expose tokens or use an admin bypass; validation remains read-only and PRs receive no deployment secrets.
- [x] Handle concurrent source/base updates and repeated events without duplicate PRs or merging an unvalidated revision. Stop visibly on conflicts, failed/cancelled checks, missing permissions or unmet protections; provide a documented recovery/pause mechanism.
- [x] Apply the approved Conventional Commit merge titles without rewriting existing history or deleting long-lived branches. Synchronize main back to dev/content according to policy, preserve concurrent work and prevent no-diff/synchronization-only promotion loops.
- [x] Implement editorial path validation using Task 00's comparison/synchronization policy. Reject unintended code/config changes and test legitimate main synchronization, mixed changes and schema rollout ordering.
- [ ] Configure separate code/content Site previews, matching PUBLIC_SITE_URL values, branch-restricted deployment environments and affected-target rules. Editorial-only changes must deploy Site and skip Admin; PRs must never receive deployment credentials.
- [ ] Apply and read back agreed protection/environment settings only after remote check names are verified. Preserve protected main and valid App secrets/permissions; use only documented editor branch selection behavior.
- [x] Update editor entry guidance and customer setup/operations for branch selection, both automated promotion paths, publication readiness, synchronization, automation pause/resume and stale-form/conflict recovery. Reconcile live settings with tracked examples.
- [ ] Add meaningful branch/classification/path-guard regressions and record remote preview/PR results. Leave comprehensive deployed matrix and cleanup evidence for Task 05.

## Acceptance criteria

Eligible dev/content changes automatically create or reuse promotion PRs and merge after current required checks without routine manual PR creation or merging. Editorial saves publish without promoting unreleased dev code. Failed checks, conflicts and unmet protections block merging visibly; automatic main synchronization preserves work without promotion loops. Merge titles follow the agreed Conventional Commit policy. Both previews identify their intended source and canonical origin. Rules enforce the approved publication path without a main bypass, and synchronization does not defeat the content guard. Required checks conclude for docs-only and rejected editorial PRs.

## Verification plan

Run `pnpm check`, `pnpm build:admin:production` when Admin configuration is affected, Markdown links, diff and workflow validation. Verify content push, both automatic PR/merge paths, required PR/main CI event propagation, repeated/no-diff pushes, title formatting, forbidden editorial code changes and main synchronization remotely. Exercise check failure, conflict, source/base changes, permission failure and pause/resume; confirm no bypass or loop. Record source SHAs, run/deployment URLs and effective settings; editor authentication/writes require deployed evidence.

## Official references to consult before implementation

- [GitHub CLI PR creation](https://cli.github.com/manual/gh_pr_create)
- [GitHub CLI merging and auto-merge](https://cli.github.com/manual/gh_pr_merge)
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Keystatic GitHub mode](https://keystatic.com/docs/github-mode)
- [Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [GitHub deployment environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)

## Verification evidence

2026-11-12: Planning only. Work, acceptance checks and deployment/service validation have not been performed. Status remains TODO.

### 2026-11-12 — Implementation prepared, activation held

The maintainer requested Task 01, then explicitly authorized committing and pushing to dev with **no merge**. Implemented local content CI/guard/Site-only deployment support and a default-disabled trusted-main promotion controller; automatic publication and protected-main bootstrap remain held under that instruction. No main merge, App registration, key generation, content branch creation, protection/environment change or editor migration has been performed. Existing remote protections/environments were read back and preserved. Task 01 cannot be marked DONE until its remote acceptance criteria are observed.

Read README, phase/task/policy and all five linked specifications. Current official GitHub workflow-run, App token, PR/branch merge, environment, Keystatic branch selection and Pages alias documentation was consulted. Source/base refs and checkout/credential boundaries use supported APIs, not framework internals. No dependency versions changed.

The implementation adds read-only content push/PR guards, per-commit inspection (including reverted code), signed bot/parent/clean-merge-tree verification for synchronization, separate content Site canonical/artifact settings, content Site deployment without Admin settings, and no content Admin deployment. The controller uses trusted main only, no untrusted cache/artifacts/code, a repository-scoped short-lived App token, one PR per source/base, protected head-matched merging, fixed Commitlint-validated titles, current PR CI/gate/base/head checks, conflict/permission/draft/closed-PR stops and explicit resume. It synchronizes main without force pushes. The default-disabled workflow does not activate from a dev push.

Added activation/operator guidance and linked it from README/customer setup/operations/workflow/deployment/tooling, preserving the current manual operating procedure until migration. The activation sequence explicitly stops at protected-main bootstrap while the no-merge instruction applies. No content preview or automated CI event propagation is claimed from local tests.

Local implementation checkboxes above do not represent deployed acceptance. Main bootstrap, App provisioning/permissions/event proof, content creation, environment/public-origin/token configuration and the remote scenarios remain unchecked. In particular GitHub workflow-run metadata and the App's verified synchronization commit attribution must be checked against real open promotion PRs after bootstrap; mocked API fixtures are not that evidence. Content/main conflicts use editorial-only alignment followed by a clean App sync and reapplication, rather than a blanket manual-merge exception.

Local verification on 2026-11-12, Darwin x86_64, Node `v22.23.5`, pnpm `12.18.0`, Git `2.52.0`: `pnpm check` exited 0 (format/lint, zero type diagnostics, 104 tests, Site/preview Admin builds and static-output verification). A subsequent explicit run after the final source-head assertion passed `pnpm lint`, all 104 tests and `pnpm build:admin:production`. Existing Admin chunk-size warnings remain. Initial lint found a missing explicit Node Buffer import in the new JWT helper; corrected it before the passing runs. Official actionlint `v1.7.12` was downloaded into ignored output, its archive SHA256 matched the official checksum file, and `output/actionlint/actionlint -shellcheck= -pyflakes=` exited 0. Shellcheck/Pyflakes were not run. No dependency or lockfile changed. Markdown/diff checks and remote push/CI evidence are recorded after their final results below.

Final pre-commit checks: `pnpm format:check` passed, `node scripts/ci/run.mjs docs` passed all 185 local Markdown links after staging the new files, `git diff --cached --check` passed, and actionlint passed again. The current main ruleset still requires strict GitHub Actions Required checks/PRs/merge commits with no bypass actors; preview/production environments still allow only dev/main. Promotion settings/App credentials remain absent, so automation is disabled by default.
