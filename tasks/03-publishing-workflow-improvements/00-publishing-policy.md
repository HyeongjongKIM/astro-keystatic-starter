# Task 00 — Publishing and Synchronization Policy

**Status:** TODO

**Depends on:** [Phase 02](../02-repository-workflow/README.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Define the confirmed policy for independent code and content publication before modifying branches, permissions or deployments.

## Work

- [ ] Inspect live branches, effective rulesets, Actions triggers, environment branch policies, Pages aliases/variables, and App installations/callbacks. Distinguish verified settings from tracked examples.
- [ ] Confirm `main`/`dev`/`content` roles, both promotion PR paths, merge/review requirements, editorial save selection, and which Admin environment editors use. Content publication must not carry unreleased dev code.
- [ ] Specify how branches are created from main and kept current after either promotion, without force pushes. Cover concurrent editor/developer commits, stale forms, conflicts, content schema rollout order and trusted synchronization commits.
- [ ] Define editorial allowed paths and the comparison basis for PRs and direct saves. A legitimate main-to-content synchronization may contain code; do not reject it blindly or allow arbitrary code changes disguised as synchronization. Treat path checks as operational safeguards, not App authorization.
- [ ] Select code/content Site preview origins, canonical settings and GitHub environment restrictions. Decide whether an additional Admin deployment is actually needed; a separate content branch alone does not require one.
- [ ] Confirm production gates, affected-target matrix, automatic versus operator-triggered deployment recovery, and source-SHA/public-setting validation. Include transient dependency-update PRs targeting dev and their validation triggers.
- [ ] Decide retention/retirement of the legacy preview branch after checking unique work and external dependencies. Record the migration order, rollback plan and per-customer configuration responsibilities.
- [ ] Update the operational policy when confirmed, with unsupported or unresolved choices recorded as blockers before Task 01 starts.

## Acceptance criteria

The maintainer-confirmed policy provides concrete branch, preview, protection, synchronization and recovery requirements for Tasks 01–05. It preserves required checks, trusted editorial access and independent Site/Admin deployment. No exact Keystatic branch restriction, path-scoped App permission or hosting support is inferred from a build.

## Verification plan

Review policy examples for independent code/content PRs, legitimate synchronization, code hidden in an editorial change, schema-dependent content and rapid mixed commits. Check current official documentation. Run formatting, Markdown links and diff checks; record maintainer decisions and inspected live values. No external setting or write test is required in this policy task.

## Official references to consult before implementation

- [Keystatic GitHub mode](https://keystatic.com/docs/github-mode)
- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Pages previews](https://developers.cloudflare.com/pages/configuration/preview-deployments/)

## Verification evidence

2026-11-12: Planning only. Work, acceptance checks and deployment/service validation have not been performed. Status remains TODO.
