# Task 02 — Deployment Recovery and Target Isolation

**Status:** DONE

**Depends on:** [Task 01](01-content-branch-preview.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Make failed/stale deployments recoverable at the current branch head and require only each app's own settings.

## Work

- [x] Reproduce the current gap: an affected commit A becomes stale after docs-only or other-target commit B, A's deployment is rejected and B skips the affected app. Cover dev/content/main where applicable.
- [x] Implement Task 00's approved recovery policy with supported Actions triggers and per-target/environment serialization. Retain stale-SHA protection; removing the head check or deploying an unvalidated old artifact is not a recovery.
- [x] Provide explicit current-head recovery for Site, Admin or both, with validation appropriate to the requested targets. Account for earlier undeployed changes rather than classifying only the last docs-only commit. Keep PRs unprivileged.
- [x] For any approved automatic follow-up, prove a later docs-only/other-target push cannot silently strand an affected target. Otherwise make the required operator action and target visible in failed-run output/summary. Do not imply automatic recovery if only a manual dispatch exists.
- [x] Split public-setting validation by app: Site needs its account/project/origin; Admin needs its account/repository/App identity and matching mode. Missing settings for the unrelated app must not block deployment. Keep credentials environment-specific and validate them without printing values.
- [x] Distinguish successful automatic PR merging from successful production deployment. Surface a failed post-merge deployment and recover the current validated main head without reopening/merging duplicate promotion PRs. Coordinate recovery with automatic branch synchronization and provide an operator pause/resume procedure.
- [x] Test failed/cancelled validation, stale queued runs, mixed updates, selective retries, invalid inputs and environment separation. Use straightforward concurrency; any persistent deployment ledger/service requires separate approval.
- [x] Document retry inputs, validation gates, concurrency limitations and recovery evidence. Verify chosen recovery remotely and preserve the full local check command.

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

2026-11-13: Started after Task 01 DONE. Clean dev `baf1dfd`, remote main `5a044078`, content `2ea26087`; latest main CI 43379195414 and dev/content synchronization CI passed (docs-only app/deployment skips). PROMOTION_ENABLED=true. Active main ruleset 27089910 requires strict Required checks and merge PRs, with no bypass actors; no protection changes/history rewriting. Read current official Actions concurrency/workflow-dispatch and Wrangler command documentation. Implementing explicit selected-target recovery and independent public-setting guards; remote recovery acceptance pending.

2026-11-13, Darwin x86_64, Node v22.23.5/pnpm 12.18.0: `pnpm check` exited 0 (format/lint, zero type diagnostics, 119 tests at that run, Site/preview Admin builds and static-output verification). Added rapid Admin→docs, Site→Admin and Admin→Site fixtures afterward; `pnpm test` passed 122 tests. `pnpm build:admin:production` exited 0; existing Admin bundle-size warning remains. `node scripts/ci/run.mjs docs` passed 195 links, `git diff --check` and `output/actionlint/actionlint -shellcheck= -pyflakes=` passed (no Shellcheck/Pyflakes). Local fixtures reproduce affected→docs staleness on dev/content/main; settings isolation, selected app recovery, invalid input/mode and failure/cancellation gating are tested. Remote acceptance remains pending, so the task is not DONE.

2026-11-13 hosted implementation acceptance: commit `129c2cc` passed [dev CI 43381225839](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381225839), including both preview deployments. The App created [PR 25](https://github.com/HyeongjongKIM/astro-keystatic-starter/pull/25); [PR CI 43381630908](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381630908) passed and automatically merged through protection to main `046801f749b227b65b5d5ec44c95c149335ec4c7`. [Main CI 43381872017](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381872017) passed both production deployments. Content synchronization `403e7af4ef38e11c2b654c8fb842970d33337952` [CI 43381877023](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381877023) passed Site deployment and skipped Admin; ancestry-only dev synchronization `cdb08583f3fdb303c5812f865910f1a0c4314b48` [CI 43381942825](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381942825) passed with both apps intentionally skipped. No duplicate promotion PR was created by dispatch recovery.

Hosted recovery matrix on the above current heads:

| Scenario                                                                                                                                                                        | Observed result                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Main `targets=site`, [43381980493](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381980493)                                                           | Full common/Site validation and Site deployment passed; Admin validation and deployment skipped. Site job has no Admin repository/App settings.                                                                                      |
| Main `targets=admin`, [43381984128](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381984128)                                                          | Full common/Admin validation and production Admin deployment passed; Site validation, artifact/build and deployment skipped. Admin job has no Pages project/Site-origin settings.                                                    |
| Content `targets=admin`, [43381944754](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381944754)                                                       | Planning explicitly failed `Content has no Admin deployment`; Required checks failed and both deployments skipped. Summary supplied Site recovery action.                                                                            |
| Content `targets=site`, [43382214807](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43382214807)                                                        | Common/Site validation and editorial Site deployment passed; Admin validation/deployment skipped.                                                                                                                                    |
| Dev Site recovery cancellation, [43381706430 attempt 1](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381706430/attempts/1)                           | Cancelled during prepare; Required checks failed; no upload. Native cancelled result and summary remain visible.                                                                                                                     |
| Same dev run retried after ancestry-only synchronization, [43381706430 attempt 2](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43381706430/attempts/2) | Old `129c2cc` Site validation passed, but upload guard rejected against current `cdb0858` with `Stale deployment`; Admin skipped. Summary reported Site failure and exact `gh workflow run ci.yml --ref dev -f targets=site` action. |

The affected-A/docs-B and rapid Admin→docs, Site→Admin, Admin→Site and mixed-input reproductions use isolated real-Git fixtures, not deliberate production content corruption. The hosted stale case is a retried old SHA after synchronization, not a claim of an injected Cloudflare outage or observed FIFO scheduling. Default single-pending concurrency, cancellation and upload-time branch races remain explicit operator-visible limitations; there is no automatic retry/ledger. Recovery keeps current-head validation and credentials/environment restrictions, and does not reopen already merged PRs.

Read back environment branch policies: preview/dev, production/main and content/content. They were unchanged, as were main's strict checks, PR/merge requirement and empty bypass list. PROMOTION_ENABLED remained true. No secret, callback, domain, permission, protection or history changes were made. HTTP smoke checks with `curl` returned 200 for production Site, dev Site, content Site and both Workers' `/keystatic` URLs. This task changes CI orchestration only; it does not claim a new OAuth/authenticated write E2E result. Task 03 validated Admin artifacts and Task 05 full deployed handoff remain separate.

2026-11-13: Current-head dev Site recovery [43382304543](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43382304543) passed common/Site validation, current-head/origin guards, upload and outcome summary at `cdb08583f3fdb303c5812f865910f1a0c4314b48`; Admin validation/deployment skipped. This follows the hosted stale failure and the later synchronization run which skipped both apps, and verifies the documented operator recovery rather than an automatic retry. All requested recovery/environment paths are now verified. The final local `pnpm check` exited 0 with 122 tests, zero type diagnostics, Site/preview Admin builds and static-output verification; the content-gap fixture now uses an allowed editorial content path. Task 02 is DONE. Next: Task 03 — Validated Admin deployment artifacts; it has not started.
