# Repository and publishing workflow

Phase 03 independent publishing is prepared but not activated. See [activation and operator guidance](publishing-setup.md) before switching editors to content or enabling automatic promotion. The existing dev/manual publication procedure below remains effective until migration and remote verification finish.

Policy confirmed by the maintainer on 2026-11-12. External configuration and deployed verification are tracked in [Phase 02](../tasks/02-repository-workflow/README.md); this policy does not establish that migration has finished.

## Branches and publication

Use two permanent branches: `dev` collects code, content and maintenance; `main` is the production source. Editors select `dev` in Keystatic before saving. Both preview and production Admin edit the same repository and use this same editorial policy; an Admin deployment environment does not select a content branch.

Promote `dev` to `main` through a PR, using a merge commit, zero required approvals and the stable required `Required checks` check. Do not squash or rebase promotions: preserving ancestry avoids repeatedly presenting already published editor commits. Keep `dev` after merging, then merge `main` back into `dev`. Pull/rebase local unpushed development onto current `dev` before pushing, preserving unrelated changes. Never force-push either operating branch. A PR publishes all accumulated code and content together; the maintainer explicitly accepted this consequence. Draft Post status still controls inclusion in the static Site.

Protect `main` with required PRs and checks, including administrators, without bypass actors. `dev` allows direct developer/editor commits, with force pushes and deletion blocked; requiring checks before these writes would prevent Keystatic from saving a new commit. Checks and preview deployments follow each save. A failed preview check prevents deployment; it does not undo the editor's commit. Do not configure a repository-wide Conventional Commit rule that rejects Keystatic saves before CI can classify them.

Keystatic officially provides a branch selector and a branch _prefix_, not an exact-branch allowlist. Keep the supported selector and instruct editors to choose `dev`; do not claim that `branchPrefix: 'dev'` enforces only `dev`. Protected `main` rejects direct saves, with no App bypass. Validate this behavior after protections are active. GitHub App code access is repository-scoped, not a content-path security boundary. No path-limited App permission is claimed.

Keep the current `preview` branch and old alias during migration. Inspect its unique commits, domains and OAuth callbacks, create `dev` from current `main` without discarding work, deploy and verify the `dev` alias, then update editor/operator links. Stop automatic Git builds for all branches once Actions deployment is ready. Do not delete or rewrite `preview`; retirement is a separate explicit action. Existing Admin callbacks use Worker origins, so changing the Pages preview alias does not require changing those callbacks.

## Validation and deployment matrix

Always run frozen installation, formatting and commit validation. Run lint for executable changes and deterministic unit tests for every non-document change. Use this path policy; mixed changes take the union, and unknown paths conservatively select both apps.

| Paths/change                                                                                                      | Additional validation                                        | Site   | Admin  |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------ | ------ |
| `docs/**`, `tasks/**`, root Markdown, editor settings                                                             | Formatting and local Markdown link checks                    | Skip   | Skip   |
| `content/**`, `apps/site/src/assets/images/**`                                                                    | Content unit tests, Site types/build/output verification     | Deploy | Skip   |
| Other `apps/site/**`                                                                                              | Lint, unit tests, Site types/build/output verification       | Deploy | Skip   |
| `apps/admin/**`                                                                                                   | Lint, unit tests, Admin types, preview and production builds | Skip   | Deploy |
| `packages/content/**`, `packages/config/**`                                                                       | Full validation and both Admin modes                         | Deploy | Deploy |
| Root dependencies/lockfile/workspace/tool versions, CI, scripts, hooks, other root configuration or unknown paths | Full validation and both Admin modes                         | Deploy | Deploy |

Site build inputs include linked MDX, settings, images, schemas, shared configuration, dependencies and build scripts. All `package.json` and lockfile changes conservatively affect both targets, including app manifests. Documentation is a skip only when no other affected paths exist. The local full `pnpm check` contract remains available.

CI validates pushes on `dev` and `main` and PRs targeting `main`. The `dev` push gives preview feedback; a promotion PR also validates the actual merge result against `main`. Avoid additional `pull_request` runs targeting `dev` or arbitrary branch pushes. Do not use workflow-level path filters: docs-only PRs must still conclude `Required checks`. That check fails if a required dependency fails, is cancelled, is missing, or is unexpectedly skipped. Only intentionally inapplicable app jobs may skip.

Validate developer commits with Commitlint. Keystatic's observed messages are `Update content/...` and `Delete content/...`, authored by the user and committed by GitHub, rather than an identifiable generic bot. Permit only the exact editorial message grammar `Create|Update|Delete content/(pages|posts)/<entry>` or `Update content/settings/site`, and only when every changed path is editorial content or a Site editor image. Reject an otherwise matching commit touching executable code, CI, or schemas. This narrow compatibility rule is not an actor authentication claim or a blanket bot exemption. Validate every commit in the push/PR range; a new branch conservatively validates all changed paths and its latest commit message. Normal GitHub merge messages retain Commitlint's standard merge handling.

## Deployment gates and recovery

Use GitHub Actions for both apps after `Required checks` succeeds. Only affected `dev` pushes deploy preview; only affected `main` pushes deploy production. PRs never deploy or receive deployment credentials. Keep existing Git-connected Pages hosting, disable its automatic production and preview builds, and upload the validated Site through official `wrangler pages deploy` with explicit branch and source SHA. Pages Git integration by itself does not wait for Actions. Keep existing domains and production branch `main`; Pages preview uploads use `--branch dev`.

Admin uses `pnpm deploy:admin:preview` or `pnpm deploy:admin:production`, which build the matching Astro mode and deploy through pinned Wrangler. Do not enable a second Workers Git build trigger. Preserve separate Site and Admin outputs and the static public/authenticated Admin boundary.

Serialize each app/environment with a concurrency group and do not cancel a running deployment. Before deployment, compare the run SHA to the current branch head; reject stale runs visibly. Never silently skip a changed target because a newer unrelated commit exists: rerun validation for the current head with a base covering the failed/stale run, or use the documented full-target recovery. A workflow-dispatch recovery on `dev` or `main` runs full checks and deploys both targets at that branch head, so later docs-only commits cannot strand an earlier affected change. A failed deployment is visible in Actions. Rerun its failed jobs when it remains the branch head; otherwise use full recovery at the current head. Do not rely on a later unrelated push. Serialization and the head check prevent an older queued run from overwriting a newer completed deployment; a commit arriving during an upload can temporarily leave the prior validated version live until its next successful deployment.

## Customer configuration and updates

Each independent repository provisions GitHub environments `preview` and `production`, restricted respectively to `dev` and `main`. Environment variables: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PAGES_PROJECT`, `PUBLIC_SITE_URL`, `KEYSTATIC_GITHUB_REPO`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, and optional `ADMIN_BRAND_NAME`. Enable deployment only after readback using environment variable `DEPLOY_ENABLED=true`. Store `CLOUDFLARE_API_TOKEN` as an environment secret. Use a customer-specific account-scoped token with Pages Edit and Workers Scripts Edit plus the account-read permission required by Wrangler; do not reuse local interactive OAuth credentials as an unattended CI token. Keep deployment credentials only in deployment jobs. Use the matching public build settings for validation without attaching deployment environments or secrets to PR jobs.

Public validation settings use repository variables `KEYSTATIC_GITHUB_REPO`, `ADMIN_BRAND_NAME`, `PREVIEW_KEYSTATIC_GITHUB_APP_SLUG`, `PRODUCTION_KEYSTATIC_GITHUB_APP_SLUG`, `PREVIEW_PUBLIC_SITE_URL`, and `PRODUCTION_PUBLIC_SITE_URL`. A newly generated, unprovisioned template may validate against non-secret placeholders, but deployment must reject missing environment values. Local ignored `.env` files are never an implicit CI input.

Keep each App's `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` and `KEYSTATIC_SECRET` in its existing Worker runtime secrets. Preserve valid secrets. App identity, repository, branding and Site URL are public build inputs; changing them requires a rebuild. Never copy authentication secrets into Actions public variables, client code or Wrangler vars.

The template owns workflows, scripts, schemas and documentation. Operators own repository protections, environment restrictions, deployment tokens, App installations/callbacks, domains and deployment verification. Generate customers from only the default template branch, then create `dev` from their own `main`: generating all template branches can produce unrelated histories. Template changes do not propagate automatically. Select applicable upstream changes, apply them on the customer's `dev`, resolve content/config differences, validate and promote through the usual PR. Temporary update branches are optional; no additional permanent branch is required.

## Official support

- [Keystatic GitHub mode and branch selection](https://keystatic.com/docs/github-mode)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [GitHub concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [Pages: disable Git builds and deploy using Wrangler](https://developers.cloudflare.com/pages/configuration/git-integration/#disable-automatic-deployments)
- [Pages upload from CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Workers deployment from Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Template repository histories](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)
