# Task 01 — Change-aware CI and Deployment Verification

**Status:** TODO

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
