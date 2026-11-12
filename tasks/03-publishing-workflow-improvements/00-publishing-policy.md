# Task 00 — Publishing and Synchronization Policy

**Status:** DONE

**Depends on:** [Phase 02](../02-repository-workflow/README.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Define the confirmed policy for independent code and content publication with automatic promotion PR creation and merging before modifying branches, permissions or deployments. The maintainer requested both forms of automation, not just PR creation.

## Work

- [x] Inspect live branches, effective rulesets, Actions triggers, environment branch policies, Pages aliases/variables, and App installations/callbacks. Distinguish verified settings from tracked examples.
- [x] Confirm `main`/`dev`/`content` roles, both promotion PR paths, merge/review requirements, editorial save selection, and which Admin environment editors use. Content publication must not carry unreleased dev code.
- [x] Define publication readiness for each branch. Confirm whether every dev push/content save may reach production after checks or whether an explicit readiness signal is needed. Specify where unfinished code lives; temporary work branches feeding dev are a proposal to confirm, not an already adopted rule.
- [x] Define automatic PR creation/reuse and merging for dev → main and content → main, including no-diff pushes, multiple rapid pushes, closed/draft PRs, retries and manual intervention. Preserve required checks and effective review rules without a bypass; identify the supported merge mechanism and latest source/base validation.
- [x] Verify supported GitHub token/App permissions, repository Actions PR-creation settings and event propagation before choosing credentials. Prove automation-created PRs run required CI, automatic merges trigger main CI, and synchronization pushes trigger necessary checks without loops. Keep privileged automation separate from untrusted PR code and deployment secrets; stop if owner configuration is required.
- [x] Specify a Conventional Commit merge-title policy using only allowed scopes, the source of titles for cumulative PRs and supported enforcement at merge time. Preserve merge history and long-lived branches; do not rewrite prior commits to normalize titles.
- [x] Specify how branches are created from main and kept current after either promotion, without force pushes. Cover concurrent editor/developer commits, stale forms, conflicts, content schema rollout order and trusted synchronization commits. Define automatic synchronization versus maintainer conflict resolution, prevent synchronization-only PR loops, and revalidate the other promotion path after main advances.
- [x] Define editorial allowed paths and the comparison basis for PRs and direct saves. A legitimate main-to-content synchronization may contain code; do not reject it blindly or allow arbitrary code changes disguised as synchronization. Treat path checks as operational safeguards, not App authorization.
- [x] Select code/content Site preview origins, canonical settings and GitHub environment restrictions. Decide whether an additional Admin deployment is actually needed; a separate content branch alone does not require one.
- [x] Confirm production gates, affected-target matrix, automatic versus operator-triggered deployment recovery, and source-SHA/public-setting validation. Include transient dependency-update PRs targeting dev and their validation triggers. Decide their review/merge eligibility separately from dev/content promotion; merging one into dev may initiate automatic production promotion.
- [x] Decide retention/retirement of the legacy preview branch after checking unique work and external dependencies. Record the migration order, rollback plan and per-customer configuration responsibilities.
- [x] Update the operational policy when confirmed, with unsupported or unresolved choices recorded as blockers before Task 01 starts.

## Acceptance criteria

The maintainer-confirmed policy provides concrete branch, preview, protection, synchronization and recovery requirements for Tasks 01–05. It specifies automatic PR creation/merge eligibility, readiness, credentials, title policy, synchronization and visible stop conditions while preserving required checks, trusted editorial access and independent Site/Admin deployment. No exact Keystatic branch restriction, path-scoped App permission or hosting support is inferred from a build.

## Verification plan

Review policy examples for independent code/content PRs, legitimate synchronization, code hidden in an editorial change, schema-dependent content and rapid mixed commits. Include duplicate/no-diff PR handling, failed/cancelled checks, head/base changes, conflicting promotion paths, synchronization loops and dependency updates reaching dev. Check current official documentation. Run formatting, Markdown links and diff checks; record maintainer decisions and inspected live values. No external setting or write test is required in this policy task.

## Official references to consult before implementation

- [GitHub CLI PR creation](https://cli.github.com/manual/gh_pr_create)
- [GitHub CLI merging and auto-merge](https://cli.github.com/manual/gh_pr_merge)
- [Keystatic GitHub mode](https://keystatic.com/docs/github-mode)
- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Pages previews](https://developers.cloudflare.com/pages/configuration/preview-deployments/)

## Verification evidence

2026-11-12: Planning only. Work, acceptance checks and deployment/service validation have not been performed. Status remains TODO.

### 2026-11-12 — Read-only investigation and policy proposal

Implementation is limited to Task 00. Read README, the phase queue, this task and all five linked specifications; initial working tree was clean on dev. Added the reviewable [publishing policy proposal](../../docs/publishing-policy.md). It covers readiness, automatic PR reuse/merge, source/base freshness, Conventional Commit subjects, trusted synchronization, editorial guards, schema sequencing, preview/environment mappings, independent targets/recovery, dependency review, migration/rollback and scenario review. The existing repository workflow remains active. At this initial inspection the remaining work checkboxes were open, pending policy selection; the subsequent decision record below closes policy work.

Observed live settings through authenticated GitHub CLI REST reads:

- Repository `HyeongjongKIM/astro-keystatic-starter`: default main; merge commits enabled; squash/rebase disabled; branch deletion after merge disabled; native auto-merge disabled. At inspection dev `6f321282683cd590f0a1ef3122de41a61b66e1f4`, main `cf3e71c5d222f6fc804ccb5f8cfd5b0988c976e7`, preview `c97563de2ab592ff58ff8d58c5d5bbd5aaee8ea4`; no content branch or open PR. `compare/main...preview` reported ahead 0, behind 40; no unique preview commits, but external dependencies are not proven absent.
- Active ruleset 27089910 requires main PRs with zero approvals, merge commits and strict `Required checks` from GitHub Actions integration 15368; deletion/non-fast-forward blocked, no bypass actors. Ruleset 27089912 blocks dev deletion/non-fast-forward without blocking editor direct writes. Actions default token permission read; Actions PR approval setting false.
- Environment preview allows only dev, production only main; both enabled. Repository and environment public variables match the current dev/production origins and App slugs. Both environments contain the named `CLOUDFLARE_API_TOKEN` secret; only names/timestamps were inspected, never values. No repository secrets listed, so no dedicated automation App key is currently provisioned there.
- GitHub repository installation endpoint returned HTTP 404 with this CLI token; this is not evidence that installations are absent. After maintainer browser login, read installations 179286338 (`astro-keystatic-admin-preview`) and 179284653 (`hyeongjongkim-keystatic-admin`): both select only this repository, metadata/PR read and code read/write. Read both App settings pages: deployed callbacks point to the corresponding existing Worker `/api/keystatic/github/oauth/callback`; loopback callbacks are also retained. No settings were saved.

Wrangler 4.158.0 `whoami` confirmed account `199c99f6a960ac0f6d972bf769a837bb`. Authenticated read-only Cloudflare API calls inspected Pages project `astro-keystatic-starter-site`: source is this repository, production main, automatic production builds false, preview setting none, preview include dev. Both pages.dev and `astro-starter.hyeongjongkim.dev` domains remain. Pages preview/production public URL variables match GitHub values. Worker settings reads for both existing Admin Workers showed the three named Keystatic secret bindings and assets binding; no secret values were read. Historical Phase 02 evidence records no Workers Git trigger; this investigation has not freshly rechecked their Builds screens. An initial Python read attempt exited 1 because host Python lacks tomllib, then the bounded configuration reader was corrected and all three API reads succeeded without exposing credentials.

Current official GitHub/Keystatic/Cloudflare documentation was read, with links and API limits recorded in the proposal. Important distinction: native auto-merge is currently disabled; proposed automatic merging uses protected, head-matched merge calls after checks, so it does not require enabling deferred native auto-merge. The proposed App must still be provisioned and its exact permissions/events tested in Task 01. No automation, service write, dependency installation, auth/write E2E or deployment was performed.

Pending maintainer decisions: (1) every dev push/content save is publish-ready, unfinished code stays on work branches; (2) existing preview Admin with explicit schema pause/compatibility handling, separate content Site preview, manual review for dependency PRs, operator-triggered recovery and legacy preview retention; (3) dedicated automation App and trusted-main controller with head-matched automatic merge. Questions were presented with the concrete proposal. No answer is inferred from elapsed time; Task 00 remains IN_PROGRESS and Task 01 is not started.

### 2026-11-12 — Recommended policy selected

The maintainer said “잘 모르겠어 너가 추천하는 방식으로 해줘” and delegated the pending choices to the agent’s recommendation. Selected the complete linked policy, with one improvement to the initial proposal: editors use the existing **production Admin** on content so its schema follows published main; preview Admin is for development checks. This avoids exposing unpublished dev schemas to routine editorial work without adding a Worker. Schema-breaking releases still require an editing pause and staged compatibility validation.

Selected every ready dev push/content save as a publication request, unfinished code on temporary work branches; merge-commit promotion with zero approvals and strict required checks/no bypass; a dedicated repository-only automation App and trusted-main controller using protected head-matched automatic merging (not native deferred auto-merge); clean automatic main synchronization and visible conflict stops; distinct dev/content Site previews; operator-triggered independent recovery; manual review/merge of dependency PRs before automatic dev promotion; and retention of legacy preview. Exact credential grant, event propagation, head/base races and deployed behavior remain mandatory empirical gates in Tasks 01/05. The permissions/event work checkbox records official support and a concrete verification contract, not a claim that an unprovisioned App has already produced CI events. The task explicitly requires no external write test at policy stage.

Task 00 is DONE as confirmed policy work. No implementation task was started, no external setting was changed and no commit/push was made. Task 01 is next, subject to a separate implementation request; it must stop if owner provisioning or supported API behavior cannot be verified.

Validation on 2026-11-12, Darwin x86_64, Node `v22.23.5`, pnpm `12.18.0`: `pnpm check` exited 0 (format, lint, shared/app types with zero diagnostics, 70 tests, Site and preview Admin builds, static output verification). After the final policy selection, `pnpm format:check` exited 0; `node scripts/ci/run.mjs docs` passed 176 tracked local Markdown links; a separate Python existence check passed the one local link in the new untracked policy document (the repository checker uses git ls-files); `git diff --check` exited 0. Existing Admin chunk-size warning remains. These are documentation/existing-project regression checks, not proof of future automation or deployed OAuth/writes. No new behavior tests were added for this policy-only task.
