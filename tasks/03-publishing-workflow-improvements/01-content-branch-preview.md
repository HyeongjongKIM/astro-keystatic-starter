# Task 01 — Content Branch and Preview Workflow

**Status:** TODO

**Depends on:** [Task 00](00-publishing-policy.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Implement the confirmed editorial branch, independent preview and PR publication flow without changing content schemas or the static Site/Admin boundary.

## Work

- [ ] Read and preserve current remote settings, branch work and preview/callback dependencies. Create or synchronize content from the approved main baseline without rewriting history.
- [ ] Add the approved content-push and promotion-PR checks, stable required gate and Site deployment conditions. Preserve dev/main behavior, correct push/PR bases, new-branch fallback, deletion/rename handling and editorial commit-message compatibility.
- [ ] Implement editorial path validation using Task 00's comparison/synchronization policy. Reject unintended code/config changes and test legitimate main synchronization, mixed changes and schema rollout ordering.
- [ ] Configure separate code/content Site previews, matching PUBLIC_SITE_URL values, branch-restricted deployment environments and affected-target rules. Editorial-only changes must deploy Site and skip Admin; PRs must never receive deployment credentials.
- [ ] Apply and read back agreed protection/environment settings only after remote check names are verified. Preserve protected main and valid App secrets/permissions; use only documented editor branch selection behavior.
- [ ] Update editor entry guidance and customer setup/operations for branch selection, both promotion paths, synchronization and stale-form recovery. Reconcile live settings with tracked examples.
- [ ] Add meaningful branch/classification/path-guard regressions and record remote preview/PR results. Leave comprehensive deployed matrix and cleanup evidence for Task 05.

## Acceptance criteria

Editorial saves can be reviewed and published without promoting unreleased dev code. Both previews identify their intended source and canonical origin. Rules enforce the approved publication path without a main bypass, and synchronization does not defeat the content guard. Required checks conclude for docs-only and rejected editorial PRs.

## Verification plan

Run `pnpm check`, `pnpm build:admin:production` when Admin configuration is affected, Markdown links, diff and workflow validation. Verify content push, both PR paths, forbidden editorial code changes and main synchronization remotely. Record source SHAs, run/deployment URLs and effective settings; editor authentication/writes require deployed evidence.

## Official references to consult before implementation

- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Keystatic GitHub mode](https://keystatic.com/docs/github-mode)
- [Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [GitHub deployment environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)

## Verification evidence

2026-11-12: Planning only. Work, acceptance checks and deployment/service validation have not been performed. Status remains TODO.
