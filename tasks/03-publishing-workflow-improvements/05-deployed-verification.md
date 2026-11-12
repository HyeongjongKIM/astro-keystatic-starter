# Task 05 — Deployed Verification and Customer Handoff

**Status:** TODO

**Depends on:** Tasks [00](00-publishing-policy.md), [01](01-content-branch-preview.md), [02](02-deployment-recovery.md), [03](03-admin-artifacts.md), [04](04-actions-maintenance.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Verify the final publishing and recovery policy in the actual repository/hosting environments and provide a reproducible customer handoff.

## Work

- [ ] Read back effective branches/rules, required check identities, environment restrictions, preview origins/canonical values, hosting triggers and App installations/callbacks. Confirm settings match Task 00 and preserve valid secrets without printing them.
- [ ] Use deployed Keystatic to create/update/delete temporary nested content with linked MDX and an image on the editorial branch. Confirm save targets, safe handling of a stale editor form and protected-main behavior.
- [ ] Publish content while dev contains an unrelated unpromoted code change; prove the code is absent from the editorial preview and production publication. Then verify code publication and main synchronization to both branches without losing content or bypassing path checks.
- [ ] Exercise docs-only, content/image-only, Site-only, Admin-only, shared and mixed updates on applicable pushes and promotion PRs. Confirm stable required checks, correct preview origins, production CI gates and independent deployment skips.
- [ ] Exercise failed/cancelled validation, rapid unrelated follow-up commits, stale queued deployments, selected-target recovery and missing unrelated-app settings. Prove the final approved recovery policy and no stale overwrite.
- [ ] Verify both environment-specific Admin artifacts deploy without a second build, reject wrong environment/SHA/public settings, and complete real OAuth/authenticated writes. Confirm artifacts/outputs contain no authentication secrets and Site stays static.
- [ ] Verify dependency-update PR checks and deployment skips. Preserve existing access controls; any revocation test must use an isolated temporary identity or an explicitly agreed restoration procedure.
- [ ] Remove all temporary content/images/code fixtures from source and built output, and reconcile preview versus immutable deployment URLs. Preserve and accurately report accepted CACHE-01 behavior rather than claiming deletion freshness from Git/build success alone.
- [ ] Update customer setup, operations, deployment, tooling and repository workflow to the final verified behavior. Separate template-owned files from per-customer setup, include failure recovery and rollback, and update phase/queue statuses only after all required evidence is observed.

## Acceptance criteria

Code and content publish independently through the confirmed protections and previews. Actual deployment, skip, failure and recovery cases match policy. Both Admin environments pass deployed login/write verification with their validated artifacts. Temporary data is removed, customer instructions are reproducible, and unresolved setup/support issues remain blockers rather than implicit completion.

## Verification plan

Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build:admin:production`, Markdown links, diff and workflow/config validation with pinned tools. Record dates, environment names, source SHAs, run/deployment/PR URLs, effective settings and observed results for the matrix below. Do not substitute builds or editor-shell HTTP 200 for authenticated write evidence.

## Official references to consult before implementation

- [Keystatic GitHub mode](https://keystatic.com/docs/github-mode)
- [Pages previews](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Actions environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)

## Remote verification matrix

| Change/scenario                               | Required result                                                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Docs/tasks only                               | Document/commit checks conclude; both apps skip deployment                                                                   |
| Editorial content/images                      | Editorial guard and Site validation pass; editorial preview/production Site deploy after the approved promotion; Admin skips |
| Site code                                     | Code preview/production Site deploy after checks; Admin skips                                                                |
| Admin code                                    | Matching Admin artifact validates/deploys; Site skips                                                                        |
| Shared/mixed changes                          | Union of affected checks and deployments                                                                                     |
| Unrelated dev work during content publication | Content PR/preview/production excludes unpromoted dev code                                                                   |
| Main synchronization                          | Legitimate updates accepted; content and developer work preserved                                                            |
| Failed/cancelled check or stale SHA           | Required gate/deployment blocks; agreed recovery is visible and succeeds at current validated head                           |
| Missing unrelated settings                    | Requested app can validate/deploy independently                                                                              |
| Wrong/expired artifact                        | Rejected or rebuilt through validation; never silently deployed                                                              |
| Automated update PR                           | Applicable checks conclude; no deployment credentials or deployment                                                          |

## Verification evidence

2026-11-12: Planning only. Work, acceptance checks and deployment/service validation have not been performed. Status remains TODO.
