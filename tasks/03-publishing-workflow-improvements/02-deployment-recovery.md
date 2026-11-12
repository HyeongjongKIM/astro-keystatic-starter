# Task 02 — Deployment Recovery and Target Isolation

**Status:** TODO

**Depends on:** [Task 01](01-content-branch-preview.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Make failed/stale deployments recoverable at the current branch head and require only each app's own settings.

## Work

- [ ] Reproduce the current gap: an affected commit A becomes stale after docs-only or other-target commit B, A's deployment is rejected and B skips the affected app. Cover dev/content/main where applicable.
- [ ] Implement Task 00's approved recovery policy with supported Actions triggers and per-target/environment serialization. Retain stale-SHA protection; removing the head check or deploying an unvalidated old artifact is not a recovery.
- [ ] Provide explicit current-head recovery for Site, Admin or both, with validation appropriate to the requested targets. Account for earlier undeployed changes rather than classifying only the last docs-only commit. Keep PRs unprivileged.
- [ ] For any approved automatic follow-up, prove a later docs-only/other-target push cannot silently strand an affected target. Otherwise make the required operator action and target visible in failed-run output/summary. Do not imply automatic recovery if only a manual dispatch exists.
- [ ] Split public-setting validation by app: Site needs its account/project/origin; Admin needs its account/repository/App identity and matching mode. Missing settings for the unrelated app must not block deployment. Keep credentials environment-specific and validate them without printing values.
- [ ] Test failed/cancelled validation, stale queued runs, mixed updates, selective retries, invalid inputs and environment separation. Use straightforward concurrency; any persistent deployment ledger/service requires separate approval.
- [ ] Document retry inputs, validation gates, concurrency limitations and recovery evidence. Verify chosen recovery remotely and preserve the full local check command.

## Acceptance criteria

An affected deployment cannot be lost silently after a newer unrelated commit. Recovery operates on the current validated head and the required app(s), with no stale overwrite or unrelated deployment. Each app can validate its configuration independently; failures remain visible and actionable.

## Verification plan

Run full root checks and workflow validation plus regression tests for rapid Admin→docs, Site→Admin, content→docs and mixed sequences. Exercise failed validation and selected-target recovery remotely. Record current head, recovered targets, validation/deployment outcomes and URLs; demonstrate an unrelated app remains skipped.

## Official references to consult before implementation

- [Actions concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [Workflow syntax and dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)

## Verification evidence

2026-11-12: Planning only. Work, acceptance checks and deployment/service validation have not been performed. Status remains TODO.
