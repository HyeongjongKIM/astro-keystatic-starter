# Task 00 — Branch and Content Publishing Policy

**Status:** IN_PROGRESS

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

## Decisions still to resolve

- Inspect current Pages and Keystatic dependencies on `preview` before confirming its transition to `dev`. Do not delete or repoint the existing branch or environment as part of planning.
- Confirm the Keystatic content-save target: `main` for direct publication, or `dev` for preview followed by a `dev` to `main` PR. Content and code accumulated on `dev` are promoted together; discuss that consequence before selecting the target.
- Verify the chosen publishing path against branch protections, App permissions, and supported Keystatic behavior. No content-save target or bypass permission is approved yet.
- Resolve review/merge details and whether CI success must gate Site production deployment. Admin automatic deployments must already wait for applicable checks to pass.
- Define customer-specific template-update PRs without requiring additional permanent branches; template generation does not imply automatic update propagation.

## Work

- [ ] Inspect current GitHub Actions triggers, Keystatic branch behavior, and tracked Pages settings; separately inspect actual repository rules, GitHub App access, and Cloudflare settings when access is available. Mark unknown external settings explicitly.
- [ ] Consult current official GitHub, Keystatic, and Cloudflare documentation. Verify support before proposing bypass actors or branch restrictions; do not widen App permissions as a workaround.
- [ ] Document the agreed `main`/`dev` roles and `dev` to `main` PR path; resolve merge/review details, how `dev` stays synchronized after promotion, and how developers reconcile editor commits without force-pushing production history.
- [ ] Confirm with the maintainer whether content publishes directly or requires review. Document how the selected policy works with required PR/check rules and the exact GitHub App identity and allowed paths/operations where supported. Do not infer compatibility from a UI build.
- [ ] Define which checks are required for each change category: docs/tasks, content/images, Site, Admin, shared schema/configuration, dependencies, and CI/build tooling. Mixed or uncertain changes must receive the union of affected checks or a conservative full check.
- [ ] Define relevant-file production (`main`) and preview (`dev`) triggers, including non-UI changes that affect public output. Resolve migration from the existing `preview` setup and whether CI success must gate production deployment; record that independent Pages Git builds do not inherently wait for Actions.
- [ ] Specify Admin automatic deployment through the existing environment-specific build/deploy commands and supported Wrangler/GitHub Actions APIs. Define exact affected paths/dependencies, required checks, retry behavior, environment-specific serialization, and prevention of stale or duplicate deployments. Content, Site-only, and docs-only changes must not trigger an unrelated Admin deployment.
- [ ] Define per-customer Cloudflare deployment credentials and environment-specific public Admin build settings. Keep Keystatic authentication secrets in the matching Workers; do not expose deployment tokens to PR validation or log secrets.
- [ ] Define how commit-message validation handles developer commits and Keystatic-generated commits without disabling validation for all bots.
- [ ] Define template-local configuration versus per-customer GitHub/Cloudflare/App setup, update delivery, and operator responsibilities.
- [ ] Update customer setup, operations, deployment, and tooling documentation where applicable. Avoid duplicating task status in the product roadmap.

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
