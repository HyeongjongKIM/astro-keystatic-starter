# Task 01 — Change-aware CI and Deployment Verification

**Status:** IN_PROGRESS

**Depends on:** [Task 00](00-branch-publishing-policy.md) DONE

**Read:** Task 00's confirmed policy, [Tooling](../../docs/tooling.md), [Deployment](../../docs/deployment.md), [Customer setup](../../docs/customer-setup.md), [Operations](../../docs/operations.md)

## Goal

Implement the confirmed `main`/`dev` workflow, run checks appropriate to changed files, and deploy Site and Admin independently only when affected. Apply and verify the actual GitHub and Cloudflare settings, not only tracked examples.

## Initial transition

Prepare and locally verify the initial workflow on `main`, then push it and configure the remote services under the implementation session's authorization. Identify the intended repository, Cloudflare account, Pages project, and preview/production Workers first; do not assume historical reference resources are the target. Publishing the workflow can activate deployment jobs, so arrange environment values and credentials before enabling them.

Create or synchronize `dev` without discarding existing work. Confirm remote checks report correctly before enabling the agreed required-check rules, preserving existing protections throughout. Adopt normal `dev` to `main` PR development after remote verification. Resolve policy questions in Task 00 rather than redesigning the publishing flow here.

## Work

- [ ] Configure `dev` push, `dev` to `main` PR, and `main` update checks according to Task 00; reduce duplicate runs while retaining useful development feedback.
- [ ] Detect changes with correct push/PR comparison bases, including new branches, deletions, renames, and mixed changes. Apply Task 00's path matrix; use conservative full validation when impact is unclear. Keep pinned tooling, frozen installs, commit validation, and the full local `pnpm check` command.
- [ ] Provide a stable required final check that reports applicable failures/cancellations correctly and does not leave docs-only PRs Pending because a workflow was filtered out.
- [ ] Configure Site production from `main` and preview from `dev` using the hosting mechanism resolved in Task 00. Apply the approved transition from `preview` and the agreed Site CI gate; do not assume Pages Git integration waits for Actions.
- [ ] Automate Admin deployment through official Wrangler/GitHub Actions tooling and the existing environment-specific build/deploy commands: affected `dev` updates deploy preview, affected `main` updates deploy production, only after required checks pass. PR checks must not deploy or receive deployment credentials.
- [ ] Apply actual GitHub and Cloudflare settings using the checklist below. Inspect current values and the intended diff before changes, then read back effective settings. If access or required values are missing, report the exact remaining step instead of claiming setup is complete.
- [ ] Add meaningful tests for change classification and required-check results. Verify both deployment and skip cases, including shared/mixed changes and failed checks. Use straightforward environment-specific concurrency and a documented failed-deployment retry procedure; a custom deployed-SHA tracking system is not required.
- [ ] Verify remote Actions, Site deployments, Admin deployments, and deployed OAuth/GitHub writes. Record run/deployment URLs, source SHAs, environment, dates, and results; clean up temporary validation content.
- [ ] Update existing setup/operations/tooling documentation for the changed workflow, environment values, and recovery procedure. Distinguish reusable template files from settings each customer must provision; update task and phase status from observed results.

## External settings checklist

### Site — Cloudflare Pages

- [ ] Verify Git repository, production branch `main`, preview branch selection `dev`, and the approved migration from `preview`. Preserve existing domains and callback dependencies until the transition is verified.
- [ ] Verify repository-root frozen-install/Site build settings, `apps/site/dist`, pinned Node/pnpm, and environment-specific `PUBLIC_SITE_URL`. Reconcile the [Pages template](../../docs/examples/pages-project.json) with live settings and Task 00's selected deployment mechanism.
- [ ] Apply Site watch paths or the selected deployment conditions for content/images, Site code, shared dependencies, and relevant build configuration. Docs/task-only and Admin-only changes must skip Site deployment. Check Cloudflare wildcard semantics separately from GitHub path matching.

### Admin — Workers and GitHub Actions

- [ ] Verify matching preview/production Worker names, Wrangler/Astro configurations, and `dev`/`main` mapping. Configure automatic deployment in Actions without a second conflicting Worker Git deployment trigger; retain local recovery commands.
- [ ] Configure Cloudflare deployment credentials and environment-specific public build values through GitHub secrets/variables: account identity, deployment token, `KEYSTATIC_GITHUB_REPO`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, and optional `ADMIN_BRAND_NAME`. Ignored local `.env` files are not available in CI.
- [ ] Confirm each Worker has its own valid `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, and `KEYSTATIC_SECRET`, matching GitHub App installation and OAuth callback. Preserve existing valid secrets; provision only missing/changed values through authorized secret operations and never print them.

### GitHub and verification

- [ ] Apply Task 00's branch protection/ruleset with actual remote check names and the approved Keystatic content-save path. Confirm effective settings and successful publication after protection is active.
- [ ] Verify the following matrix in the intended environments. For shared code/dependencies, use a clear path-based policy; conservatively checking and deploying both targets is acceptable when impact cannot be safely separated. Fine-grained dependency-graph analysis is not required.

| Change                                    | Expected CI                         | Site deployment | Admin deployment             |
| ----------------------------------------- | ----------------------------------- | --------------- | ---------------------------- |
| Docs/tasks only                           | Document checks                     | Skip            | Skip                         |
| Editorial content/Site images only        | Content and Site validation         | Deploy          | Skip                         |
| Site application code only                | Site validation                     | Deploy          | Skip                         |
| Admin application code only               | Admin validation                    | Skip            | Deploy after checks          |
| Shared code/dependencies or mixed changes | Affected checks, or full validation | Affected target | Affected target after checks |

Deployment rows apply to branch updates in the matching preview/production environment, not PR validation events. A failed Admin deployment must be visible and recoverable by rerunning the failed job or documented recovery command, rather than relying on a later unrelated push.

## Acceptance criteria

- Change-aware checks follow Task 00's policy; required PR checks conclude correctly, including skipped jobs and failed/cancelled dependencies.
- Relevant branch updates deploy the correct environments. Docs-only changes deploy neither app; content/Site-only changes do not deploy Admin; Admin-only changes do not deploy Site.
- Admin deployment waits for successful checks, uses the matching configuration/secrets, and avoids duplicate or stale deployments. The selected Site gating behavior is demonstrated.
- Actual GitHub/Cloudflare settings and remote behavior are verified, including deployed Admin OAuth and authenticated content writes under the selected branch protections. Builds alone do not establish completion.
- Existing customer guides describe changed settings and retry/recovery steps. Missing access, unresolved outcomes, and known limitations are recorded accurately.

## Verification plan

Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm verify:site`, and `git diff --check`. Also build production Admin with `pnpm build:admin:production` to validate its separate configuration.

Validate workflow YAML and meaningful classification/gate tests, then exercise the matrix remotely on `dev`, `dev` to `main` PRs, and `main`. Inspect live settings and deployments, verify the agreed Site gate and failed Admin-check behavior, and exercise deployed login/write-to-publish without unrelated Admin redeployment. Record actual commands, environment, dates, source SHAs, and outcomes in the evidence section.

## Official references to consult

- [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Keystatic GitHub mode](https://keystatic.com/docs/github-mode)
- [Pages GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Pages build watch paths](https://developers.cloudflare.com/pages/configuration/build-watch-paths/)
- [Pages branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Workers deployment with GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)

## Verification evidence

2026-11-10: Planning only. Scope includes change-aware CI, Site deployment conditions, and Admin automatic deployment after successful checks. The maintainer requested consolidation of repeated requirements while retaining external setup and remote verification details. No workflow or external setting has been changed; implementation verification is pending. Status remains TODO.

Documentation validation on macOS arm64: `pnpm format:check` and `git diff --check` exited 0; a Python path-existence check passed for 16 local links across the three Phase 02 documents. Existing staged content was preserved; this revision remains unstaged. Application and remote checks were not run for the documentation revision.

### 2026-11-12 — Local implementation and environment preparation

Environment verified with `uname -sm`: Darwin x86_64; Node `22.23.4`, pnpm `12.18.0`, pinned Wrangler `4.158.0`. Local implementation remains on `main` during the authorized initial transition. Task 00 completed in `42687b7`; this task has not yet activated a remote workflow.

Implemented path classification and NUL-delimited Git comparisons (push base, PR merge base, deletion/rename endpoints, conservative full validation for missing/new-branch bases). Docs-only changes still run formatting, local Markdown links and per-commit checks. The stable `Required checks` job validates required and intentionally skipped results; deployment jobs explicitly reject failed/cancelled validation. Validation jobs have no deployment environment or secrets.

Added Site artifact deployment with validated-origin matching and explicit branch/SHA, environment-specific Admin deployment through existing commands, app/branch concurrency without cancelling active uploads, branch-head checks through the authenticated GitHub API (supports private customers), and full manual recovery. Deployment tokens are supplied only to deployment steps. Both environments require `DEPLOY_ENABLED=true`; unconfigured deployment fails visibly.

Local verification observed:

- `pnpm check` exited 0: format, lint, app/shared types, 69 tests in four files, Site/preview Admin builds and static-output verification passed. `pnpm build:admin:production` separately exited 0. Both Admin modes retain the existing chunk-size warning.
- After the private-repository head-query and explicit deployment status-condition changes, `pnpm lint` and `pnpm test` exited 0 (69 tests), and actionlint passed again.
- Tests include real temporary Git repositories for PR target divergence, deletion/rename, unavailable/new-branch bases, manual recovery after docs-only commits, and stale/disabled/missing-setting deployment rejection. Workflow boundary tests check required-job wiring and secret isolation. These are local tests, not remote deployment evidence.
- `node scripts/ci/run.mjs docs` passed 114 tracked local Markdown links before the evidence update. `git diff --check` exited 0.
- actionlint `1.7.12`, downloaded from its official release with SHA256 verified against the release checksum file, passed `.github/workflows/ci.yml` with `-shellcheck=`. Shellcheck was not installed/invoked. An initial arm64 binary could not run on this x86_64 host; the verified amd64 binary passed. This is a local verification tool, not a new repository dependency.
- Initial lint found a duplicate/missing test import; it was corrected before the passing checks. Browser snapshots initially interfered with root formatting; generated `.playwright-mcp/` files are now ignored alongside existing browser artifacts.

External writes observed and read back:

- Created GitHub environments `preview` and `production`, no required reviewers, custom branch policies restricted respectively to branch `dev` and branch `main`. Registered verified account/project, environment Site origins, repository and matching public App slugs. `DEPLOY_ENABLED=false` in both environments.
- Registered matching repository public validation variables for the repository, both App slugs and both Site origins. No authentication credential was copied from Worker secrets or local Wrangler OAuth.
- At preparation time, both environment secret lists were empty. Maintainer asked the agent to create/register the deployment token directly; Cloudflare browser currently requires account login. Token provisioning, effective token permissions, activation, branches/protections, competing Cloudflare triggers and deployed validation remain pending. Existing Pages Git deployment settings are unchanged until credentials and activation are ready. No workflow push or deployment has occurred in this task yet.
