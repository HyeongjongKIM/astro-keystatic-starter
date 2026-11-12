# Task 01 — Content Branch, Previews and Automated Promotion

**Status:** TODO

**Depends on:** [Task 00](00-publishing-policy.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Implement the confirmed editorial branch, independent previews and automatic promotion PR creation/merging without changing content schemas or the static Site/Admin boundary.

## Work

- [ ] Read and preserve current remote settings, branch work and preview/callback dependencies. Create or synchronize content from the approved main baseline without rewriting history.
- [ ] Add the approved content-push and promotion-PR checks, stable required gate and Site deployment conditions. Preserve dev/main behavior, correct push/PR bases, new-branch fallback, deletion/rename handling and editorial commit-message compatibility.
- [ ] Implement Task 00's automatic promotion for dev → main and content → main. Create one PR when an eligible publication diff exists, reuse an open PR for later pushes and merge automatically only after current required checks and effective protection conditions are satisfied. Respect the confirmed readiness, draft/closed-PR and retry policies.
- [ ] Use the supported credentials and event strategy verified in Task 00. Observe required PR CI on automation-created PRs and main CI after automatic merging. Privileged promotion must not execute untrusted PR code, expose tokens or use an admin bypass; validation remains read-only and PRs receive no deployment secrets.
- [ ] Handle concurrent source/base updates and repeated events without duplicate PRs or merging an unvalidated revision. Stop visibly on conflicts, failed/cancelled checks, missing permissions or unmet protections; provide a documented recovery/pause mechanism.
- [ ] Apply the approved Conventional Commit merge titles without rewriting existing history or deleting long-lived branches. Synchronize main back to dev/content according to policy, preserve concurrent work and prevent no-diff/synchronization-only promotion loops.
- [ ] Implement editorial path validation using Task 00's comparison/synchronization policy. Reject unintended code/config changes and test legitimate main synchronization, mixed changes and schema rollout ordering.
- [ ] Configure separate code/content Site previews, matching PUBLIC_SITE_URL values, branch-restricted deployment environments and affected-target rules. Editorial-only changes must deploy Site and skip Admin; PRs must never receive deployment credentials.
- [ ] Apply and read back agreed protection/environment settings only after remote check names are verified. Preserve protected main and valid App secrets/permissions; use only documented editor branch selection behavior.
- [ ] Update editor entry guidance and customer setup/operations for branch selection, both automated promotion paths, publication readiness, synchronization, automation pause/resume and stale-form/conflict recovery. Reconcile live settings with tracked examples.
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
