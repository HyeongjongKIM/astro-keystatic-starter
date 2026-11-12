# Task 00 — Branch and Content Publishing Policy

**Status:** DONE

**Depends on:** [Phase 01](../01-initial-implementation/README.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Deployment](../../docs/deployment.md), [Customer setup](../../docs/customer-setup.md), [Operations](../../docs/operations.md), [Tooling](../../docs/tooling.md)

## Goal

Define a lightweight branch, content publishing, and validation policy reusable by the template and independent customer repositories. Distinguish CI validation from Cloudflare deployment and resolve Keystatic publishing behavior before changing protection rules.

## Agreed branch baseline

The maintainer agreed to the following branch model on 2026-11-10. These decisions have not been applied to repository or deployment settings:

- Operate two branches: `main` is the stable template baseline and customer production source; `dev` collects feature, fix, documentation, and maintenance work. Do not require separate role-based branches.
- Promote development changes through a `dev` to `main` PR. Determine applicable checks and deployments from changed files, not feature/fix/docs branch names.
- Use `dev` as the intended Site preview source and `main` as the production source when relevant files change. A preview environment does not require a separate `preview` branch.
- Automatically deploy Admin through GitHub Actions after the required checks pass: relevant `dev` updates deploy the preview Worker, and relevant `main` updates deploy the production Worker. PR validation alone must not deploy Admin. Keep Site and Admin deployment decisions independent.

## Agreed deployment scope

Determine deployment impact from changed files and actual build dependencies, not commit-message prefixes. This is the required policy for implementation; external settings have not been applied:

| Change                                                     | Site deployment            | Admin deployment                                |
| ---------------------------------------------------------- | -------------------------- | ----------------------------------------------- |
| Documentation or task planning only                        | Skip                       | Skip                                            |
| Editorial content or Site images only                      | Deploy                     | Skip                                            |
| Site application code/styles only                          | Deploy                     | Skip                                            |
| Admin application code/build configuration only            | Skip                       | Deploy after checks                             |
| Shared content schemas or runtime/config code              | Deploy affected targets    | Deploy affected targets after checks            |
| Dependencies, lockfile, or shared build/deployment tooling | Determine affected targets | Determine affected targets; deploy after checks |

Mixed changes use the union of affected targets. Use a clear path-based policy for shared files and dependencies; conservative validation and deployment of both targets is acceptable when impact cannot be safely separated. Fine-grained dependency-graph analysis is not required. Content schema changes can require Admin deployment even though editorial content changes do not; never silently skip a potentially affected target.

## Confirmed decisions

On 2026-11-12 the maintainer confirmed all recommended options: content saves to `dev`, code/content promotion together through `dev` to `main`, Site and Admin deployments after successful CI, merge commits with zero required approvals and required checks. The complete implementation contract is [repository workflow](../../docs/repository-workflow.md). No App bypass or permission expansion is needed; exact branch enforcement comes from protected `main` and editor selection of `dev`, not an undocumented Keystatic option.

## Work

- [x] Inspect current GitHub Actions triggers, Keystatic branch behavior, and tracked Pages settings; separately inspect actual repository rules, GitHub App access, and Cloudflare settings when access is available. Mark unknown external settings explicitly.
- [x] Consult current official GitHub, Keystatic, and Cloudflare documentation. Verify support before proposing bypass actors or branch restrictions; do not widen App permissions as a workaround.
- [x] Document the agreed `main`/`dev` roles and `dev` to `main` PR path; resolve merge/review details, how `dev` stays synchronized after promotion, and how developers reconcile editor commits without force-pushing production history.
- [x] Confirm with the maintainer whether content publishes directly or requires review. Document how the selected policy works with required PR/check rules and the exact GitHub App identity and allowed paths/operations where supported. Do not infer compatibility from a UI build.
- [x] Define which checks are required for each change category: docs/tasks, content/images, Site, Admin, shared schema/configuration, dependencies, and CI/build tooling. Mixed or uncertain changes must receive the union of affected checks or a conservative full check.
- [x] Define relevant-file production (`main`) and preview (`dev`) triggers, including non-UI changes that affect public output. Resolve migration from the existing `preview` setup and whether CI success must gate production deployment; record that independent Pages Git builds do not inherently wait for Actions.
- [x] Specify Admin automatic deployment through the existing environment-specific build/deploy commands and supported Wrangler/GitHub Actions APIs. Define exact affected paths/dependencies, required checks, retry behavior, environment-specific serialization, and prevention of stale or duplicate deployments. Content, Site-only, and docs-only changes must not trigger an unrelated Admin deployment.
- [x] Define per-customer Cloudflare deployment credentials and environment-specific public Admin build settings. Keep Keystatic authentication secrets in the matching Workers; do not expose deployment tokens to PR validation or log secrets.
- [x] Define how commit-message validation handles developer commits and Keystatic-generated commits without disabling validation for all bots.
- [x] Define template-local configuration versus per-customer GitHub/Cloudflare/App setup, update delivery, and operator responsibilities.
- [x] Update customer setup, operations, deployment, and tooling documentation where applicable. Avoid duplicating task status in the product roadmap.

## Acceptance criteria

- Code and content publishing paths, protections, preview behavior, and production gates are explicit and maintainer-confirmed.
- The policy supports independent customer repositories and preserves the static Site/authenticated Admin boundary.
- Required checks and deployment decisions have an unambiguous change-category matrix, including shared dependencies and mixed changes.
- Admin automatic deployment is restricted to affected targets on `dev`/`main` updates after successful checks. Docs-only, editorial-content-only, and Site-only changes do not deploy Admin; Admin-only changes do not deploy Site.
- Direct publishing limitations or required external permissions are documented; no unsupported bypass or automatic template sync is claimed.
- Task 01 has concrete configuration and validation requirements; unresolved policy decisions remain blockers rather than implicit choices.

## Verification plan

- Review each change category and both publishing-policy alternatives against official documented behavior and existing repository files.
- Run `pnpm format:check` and `git diff --check`; check local Markdown links.
- Record date, environment, inspected settings, maintainer decisions, and unresolved limitations. This task does not apply external settings or perform deployed writes.

## Official references to consult

- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Repository rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Creating repositories from templates](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)
- [Keystatic GitHub mode](https://keystatic.com/docs/github-mode)
- [Pages branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Pages build watch paths](https://developers.cloudflare.com/pages/configuration/build-watch-paths/)
- [Workers deployment with GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)

## Verification evidence

2026-11-10: Task created for planning. The maintainer subsequently agreed to `main` and `dev` as the two operating branches, collecting all development work on `dev` and promoting it through PRs to `main`, and requested change-aware Admin automatic deployment after checks. The intended preview source is `dev`; migration from `preview`, the Keystatic content-save target, protection details, and Site deployment gating remain unresolved. External settings and implementation are unverified. Status remains TODO.

### 2026-11-12 — Initial inspection

Environment: macOS arm64, Node `v22.23.4`, pnpm `12.18.0`. Initial working tree was clean on `main` at `f933c524dcede2559bcdfab9ff55c7f8f8d5b735`.

- `git ls-remote --heads origin` exited 0: remote branches are `main` and `preview`; `dev` does not exist. Remote `preview` is at `c97563de2ab592ff58ff8d58c5d5bbd5aaee8ea4`. No branch was changed.
- `gh api repos/HyeongjongKIM/astro-keystatic-starter` exited 0: intended repository is private, default branch is `main`, and merge, squash, and rebase merging are enabled.
- Rulesets and `branches/main/protection` API reads both exited 1 with HTTP 403: GitHub requires upgrading to Pro or making this repository public. This response does not establish absence of protection. The maintainer subsequently said they would make the repository public; completion and effective rules still require readback.
- Inspected `.github/workflows/ci.yml`: all pushes and PRs run commitlint and full `pnpm check`; no automatic Admin deployment exists.
- Inspected `packages/content/index.ts` and Admin config: GitHub storage sets repository identity but no branch restriction. The official [Keystatic GitHub mode documentation](https://keystatic.com/docs/github-mode) documents the branch selector and `branchPrefix`; neither proves an exact save-target restriction or protected-branch write compatibility.
- Tracked Pages example and customer setup select `preview`; production is `main`. Live Pages settings, GitHub App identity/installation permissions, callbacks, and Worker settings have not been inspected. Tracked Worker names are reference values, not verified deployment targets.
- Consulted official GitHub rulesets, Keystatic GitHub mode/configuration, Cloudflare Pages branch controls/Git integration/watch paths, and Workers GitHub Actions documentation. [GitHub ruleset availability](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) distinguishes public Free repositories from private paid-plan repositories.

Pending maintainer decisions: content save target (including joint code/content promotion on `dev`), Site CI gate, and merge/review policy. Recommendations are proposals only: save on `dev`, deploy both targets after successful CI, and use merge commits with zero required approvals plus required checks for a solo maintainer. Keep `dev` after promotion and synchronize it by merging `main`; never force-push production history. No bypass, permission widening, branch transition, workflow activation, or deployment is approved by these proposals. Task 01 remains dependent on Task 00 completion.

Verification for this documentation-only inspection: `pnpm format:check` and `git diff --check` exited 0; Python local Markdown link validation passed all 21 links across the phase queue and Phase 02 documents. A subsequent repository API read still reported `private`. Application checks and builds were not run because no application or workflow code changed.

### 2026-11-12 — Confirmed policy and live inventory

The maintainer made the repository public and confirmed the recommendations above. `gh api repos/HyeongjongKIM/astro-keystatic-starter` returned `public`; rulesets read returned `[]`; `branches/main/protection` returned HTTP 404 `Branch not protected`. The earlier plan-related 403 is resolved. No rules were changed in Task 00.

Wrangler 4.158.0 `whoami` and `pages project list` exited 0. Authenticated Cloudflare API reads verified account `199c99f6a960ac0f6d972bf769a837bb`, Pages project `astro-keystatic-starter-site` connected to this exact repository, production `main`, preview include `preview`, the tracked root build/output settings, production URL `https://astro-starter.hyeongjongkim.dev`, and preview URL `https://preview.astro-keystatic-starter-site.pages.dev`. Existing domains are preserved. Workers `astro-keystatic-starter-admin-preview` and `astro-keystatic-starter-admin` exist, each with all three named Keystatic secret bindings; only names/types were read, never secret values. No Cloudflare setting was changed.

After maintainer browser login, inspected installations `179286338` (App slug `astro-keystatic-admin-preview`) and `179284653` (`hyeongjongkim-keystatic-admin`). Both select only `HyeongjongKIM/astro-keystatic-starter`, with metadata/pull requests read and code read/write. Each App settings page has the matching `https://<worker>.jonkim0309.workers.dev/api/keystatic/github/oauth/callback`; neither callback depends on the Pages `preview` alias. Exact protected-branch save behavior remains a Task 01 deployed acceptance test, not a Task 00 compatibility claim. GitHub CLI installation reads were unavailable (403/404); browser inspection supplied the evidence.

`gh variable list` and `gh secret list` exited 0 with no entries. CI token/environment provisioning and remote deployment tests belong to Task 01. Existing local Admin environment files are absent; no credential regeneration is required because deployed Worker secrets are retained. Public Worker requests through Python returned HTTP 403, so this inspection does not establish editor availability.

Final Task 00 verification on macOS arm64, 2026-11-12: `pnpm format:check`, `git diff --check`, and local Markdown link validation (36 links) passed. `pnpm check` exited 0: format, lint, both app type checks (zero diagnostics), 28 tests, Site/preview Admin builds and static-output verification passed. Admin retained the existing chunk-size warning. Browser-generated inspection snapshots initially caused format-check failures; those disposable files were removed and the check passed. No remote write or deployment was performed for Task 00. Task 01 is next.
