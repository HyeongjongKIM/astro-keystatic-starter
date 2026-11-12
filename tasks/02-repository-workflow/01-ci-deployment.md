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

### 2026-11-12 — Activation and protected publication

The maintainer explicitly asked the agent to create/register the deployment token, then logged into Cloudflare. Created user API token `astro-keystatic-starter-actions` through the official token UI: Cloudflare Pages Edit, Workers Scripts Edit and Account Settings Read, scoped to account `199c99f6a960ac0f6d972bf769a837bb`, no expiration. Verified token active and registered it as `CLOUDFLARE_API_TOKEN` in both branch-restricted GitHub environments, using an ephemeral loopback transfer directly to `gh secret set` stdin. Its value was never returned, logged or saved to a file; the loopback listener was terminated. Both secret-name lists were read back and both environments were enabled with `DEPLOY_ENABLED=true`.

Read and patched the existing Pages project's source configuration: automatic production builds disabled, preview deployment setting `none`, preview include metadata changed to `dev`; preview `PUBLIC_SITE_URL` changed to `https://dev.astro-keystatic-starter-site.pages.dev`. Readback confirmed these values and both existing domains were preserved. The old `preview` branch remains at its original SHA, with no unique commits relative to the transition baseline. Both Worker Settings → Builds screens showed the Git connection setup choices, with no connected Git repository or competing build trigger. Existing Worker authentication secrets and App installations/callbacks were preserved.

Initial remote runs on `2914d4a72de0900ce9b231e4355243a384eaad5e` passed all validation and Admin deployment but failed Site upload: the workflow named `upload-site` while the runner lacked its implementation. This was an implementation defect, not a Cloudflare permission failure. Added the handler and an executable Wrangler-stub regression test in `2b32515933403746ba255f2ccf4791fe86c6cd13`; lint, formatting, diff checks and all 70 tests passed. Pre-push types/tests also passed. No dependency/tool version changed.

After the real `Required checks` check reported success with GitHub Actions App ID `15368`, created active rulesets `27089910` (`main publishing`) and `27089912` (`dev publishing`). Readback of effective branch rules confirmed deletion/force-push prevention on both branches; `main` additionally requires PRs, zero approving reviews, only merge commits, and strict `Required checks` from App `15368`. Both rulesets have empty bypass actors, so administrators and Apps receive no exception. Readback also confirmed repository squash/rebase merging disabled and automatic branch deletion disabled.

Remote verification observed so far:

| Scenario                                      | Source SHA                                 | Actions run / PR                                                                                                                                                          | Observed result                                                                        |
| --------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Initial activation on main                    | `2914d4a72de0900ce9b231e4355243a384eaad5e` | [43148417266](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43148417266)                                                                          | Checks/Admin passed; Site command defect failed visibly                                |
| Fixed shared tooling on dev                   | `2b32515933403746ba255f2ccf4791fe86c6cd13` | [43148810241](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43148810241)                                                                          | Both checks and both preview deployments passed                                        |
| Protected code promotion                      | `2b32515933403746ba255f2ccf4791fe86c6cd13` | [PR 1](https://github.com/HyeongjongKIM/astro-keystatic-starter/pull/1), [43148848398](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43148848398) | Merge-result validation passed; both PR deployments skipped; merged normally           |
| Shared tooling on main                        | `71820ca130157edd6f98c5c1ae6aad0237616683` | [43149103734](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43149103734)                                                                          | Both checks and both production deployments passed                                     |
| Synchronize dev, unchanged tree               | `71820ca130157edd6f98c5c1ae6aad0237616683` | [43149142882](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43149142882)                                                                          | Stable required check passed; both app checks and deployments skipped                  |
| Real editor content/image save on dev         | `dd5e427b86ee7cbfacab01a0bf81855a1e795541` | [43149159557](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43149159557)                                                                          | Content/Site checks and preview Site deployment passed; Admin check/deployment skipped |
| Content-only protected PR                     | `dd5e427b86ee7cbfacab01a0bf81855a1e795541` | [PR 2](https://github.com/HyeongjongKIM/astro-keystatic-starter/pull/2), [43149341926](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43149341926) | Site/required checks passed; Admin and both PR deployments skipped; merged normally    |
| Content-only main publication                 | `33057b7f102fe903757753c55ff020413d62b57e` | [43149569630](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43149569630)                                                                          | Production Site passed; Admin skipped                                                  |
| Intentional Admin type failure on dev         | `48e5d1b486c3a86bcd72c5a7c7502f79fa71ab03` | [43149573051](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43149573051)                                                                          | Admin check failed with TS2322; required check failed; both deployment jobs skipped    |
| Remove failure fixture, Admin-only dev change | `dabc57a8087074db133c4ecbfd52d5c409a59348` | [43149819941](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43149819941)                                                                          | Admin checks/deployment passed; Site checks/deployment skipped                         |

On deployed preview Admin, a direct `main` save displayed Keystatic's “Changes must be made via pull request” new-branch dialog; cancelling it left `main` unchanged. Selected existing `dev`, created `projects/workflow-proof` with a rich-text block and uploaded image, and observed the exact Keystatic commit above with YAML, linked MDX and image paths. Its non-Conventional editorial message passed the narrow path/message compatibility check. Preview and production Admin both completed GitHub login and authenticated reads against the intended repository; the previously deployed placeholder repository was replaced by the verified public build settings.

Confirmed public preview Page HTTP 200, breadcrumb ancestry, body, canonical `https://dev.astro-keystatic-starter-site.pages.dev/projects/workflow-proof/`, and an optimized WebP image with explicit 8×8 dimensions and successful load. After PR 2's gated deployment, confirmed the same behavior on production with canonical `https://astro-starter.hyeongjongkim.dev/projects/workflow-proof/`. Before deployment completed, production returned 404 for this new route. Browser checks used the unchanged route without cache-busting query strings.

Cloudflare readback confirmed successful Wrangler (`ad_hoc`) Site deployments: preview `b43d90dc-726a-4623-af9a-31a5283db439` for the upload fix, production `c9806dcf-ba7a-46e9-b9ad-bdff62b47601` for PR 1 merge, and preview `62e47347-5e55-4d51-a2c4-2b15a051e944` for the editor save. Their canonical URLs are `https://<first-eight-ID-chars>.astro-keystatic-starter-site.pages.dev`. The retained Git integration also creates idle `github:push` webhook records with no build start; these are not successful deployments. Actions uploads are the successful serving deployments after the gate.

Observed limitations: GitHub warns that the retained Actions major versions target deprecated Node 20 (the runner executes them on Node 24); all jobs used pinned application Node 22.23.4 and pnpm 12.18.0 successfully. Existing Admin chunk-size warnings remain. Site-only marker deployment, production-editor cleanup writes, docs-only PR validation and final cleanup/evidence are still pending at this checkpoint; Task 01 is not DONE yet.

Site-only marker `35c385b657c6bbd8842fdc983a2a127105bb9394` passed [43150105886](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43150105886): Site checks/deployment passed, Admin checks/deployment skipped. Browser request to `/workflow-verification.txt` on the `dev` alias returned HTTP 200 with the expected marker text. Removed the marker in `622ac95abb9fbc120dbef541256385c178a94661`.

The production Admin's first deletion request encountered Keystatic's expected-head conflict because developer validation commits had advanced `dev` since the form loaded. It did not overwrite the newer branch. Reloaded the form and retried through the normal UI; the editor redirected to the Page collection and committed `a4b95c1409b72d506ea7e0022089b0e7baa0798a` (`Delete content/pages/projects/workflow-proof`), removing YAML, linked MDX and the uploaded image. This verifies authenticated production-Worker writes and normal editor/developer reconciliation without bypass or force pushes. Added the observed recovery procedure to operations. [PR 3](https://github.com/HyeongjongKIM/astro-keystatic-starter/pull/3) promotes that cleanup; temporary Admin/Site validation files have no remaining application diff.

### 2026-11-12 — Cleanup and final application checks

- Stale marker-removal run [43150374123](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43150374123), source `622ac95abb9fbc120dbef541256385c178a94661`, failed its deployment guard with `Stale deployment: run full recovery on the current branch head` after the editor deletion advanced `dev`. It did not overwrite the newer deployment. Latest-head cleanup run [43150463191](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43150463191), source `a4b95c1409b72d506ea7e0022089b0e7baa0798a`, passed Site/required checks and Site deployment, skipping Admin; its full Site output includes both pending deletions.
- Cleanup [PR 3](https://github.com/HyeongjongKIM/astro-keystatic-starter/pull/3) passed merge-result validation [43150468493](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43150468493) and merged to `5c1f85f5c0ff21dc83c3d770cf7fee28191e6e9d`. Production run [43150636834](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43150636834) passed Site/required checks and Site deployment, skipping Admin. Fast-forwarded `dev` to the merge commit without force and retained both permanent branches plus the historical `preview` branch.
- Preview cleanup deployment [573e65ae](https://573e65ae.astro-keystatic-starter-site.pages.dev) and production cleanup deployment [5b258f99](https://5b258f99.astro-keystatic-starter-site.pages.dev) succeeded for those source SHAs; production canonical-deployment readback confirmed its ID and disabled Git builds. Preview canonical deployment returned 404 for the temporary Page and marker, and its sitemap excluded the Page. The unchanged preview alias still returned cached 200 responses for both removed paths while its sitemap was current: this is the previously accepted CACHE-01 freshness limitation, not remaining repository/build content. No cache-busting workaround or architecture change was introduced.
- After all temporary application files were removed, `pnpm check`, `pnpm build:admin:production`, `node scripts/ci/run.mjs docs` (114 local links) and `git diff --check` all exited 0 on Darwin x86_64, Node 22.23.4/pnpm 12.18.0. All 70 tests passed, both app type checks reported zero diagnostics, both Admin modes built, and static output verification passed. The existing Admin chunk-size warning remained. Remaining work at this checkpoint is documentation-only PR validation and final task/phase status evidence.
