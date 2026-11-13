# Content operations and maintenance

Independent publishing uses `dev` for ready code, `content` for editorial saves, and protected PRs to `main`. See [activation and operator guidance](publishing-setup.md) for provisioning, pause/resume and verification limits. A customer copy must complete provisioning before enabling automatic promotion.

The confirmed [repository workflow](repository-workflow.md) defines `content` editorial saves, automatic protected PR promotion from dev/content to `main`, and CI-gated deployment of both apps. See [Task 03-01](../tasks/03-publishing-workflow-improvements/01-content-branch-preview.md) for activation evidence and remaining verification limits.

Complete [customer setup](customer-setup.md) before using the deployed Admin. For configuration changes, use the [configuration reference](deployment.md#configuration-contract).

## Publish and verify

Log in to the deployed Admin, create a temporary nested Page under an existing parent, add a Rich text block and upload an image. Select branch `content` in production Admin before saving. Save. Confirm a GitHub commit on `content` contains YAML, linked MDX and an image under `apps/site/src/assets/images`; image references use `@assets`. Confirm the Actions Site validation and `Required checks` succeed, then the Site deployment uploads the same SHA to the `content` preview and the public URL/menu/breadcrumb/image updates after success. Verify image dimensions/optimized WebP, canonical origin, `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`, draft exclusion and an unknown-path 404. `/journal` and `/journal/` deliberately redirect to `/posts/` with 301; remove these rules and reserved slug together if changing the convention.

Delete temporary content through Admin and verify its image also disappears from Git and a new Site deployment removes the URL. Neither content commit should trigger an Admin deployment. The controller automatically opens/reuses content → main and merges after current PR checks; verify main CI and the production Site deployment separately. Ready code uses the independent dev → main path. Use `git pull --ff-only origin dev` before coding; integrate concurrent work without rewriting published history. No forced push is needed.

Run `pnpm check` locally and confirm GitHub Actions. Unit fixtures are independent of customer edits; `verify:site` checks built output against current Posts. Browser accessibility audits are smoke checks, not exhaustive assistive-technology validation.

## Rollback and access removal

In Pages Deployments, select a previously successful production deployment and Rollback to this deployment, or use the official rollback API. Preview deployments are not rollback targets. Confirm both the selected canonical deployment ID and actual public responses; allow propagation before concluding a failure. Restore a newer successful deployment with the same mechanism. Rollback changes the served Site, not repository content; the next Git push can publish current content again. Use an intentional Git revert if content must also be reverted.

For revocation, use GitHub Settings → Applications → Installed GitHub Apps → Configure for the exact environment's App → Uninstall (or remove a collaborator's repository access when offboarding that user). Confirm pending saves fail and no new Git commit is made. The tested procedure removes an App installation; collaborator removal is an operational alternative, not a claimed test. Public static pages must remain available. Reinstall through the registered App's Install App screen, select only the same customer repo and re-login if needed; existing credentials remain specific to that App. Do not uninstall another environment's App to test isolation.

Rotate compromised GitHub App credentials and Worker secrets, then verify a fresh login/write. If retiring a customer, remove only that customer's Pages project, Workers, App registrations/installations and local credentials after deciding what content to retain.

## Troubleshooting

- Repo not found: verify the public build-time repository setting and selected App installation; rebuild after changing identity.
- Missing credentials / OAuth failure: verify all three runtime secrets, public slug, exact callback and the matching environment's App.
- Setup loses manifest after GitHub login: return to Keystatic setup and submit again after login; avoid duplicate App registrations.
- Editor reports “Expected branch to point to … Pull and try again”: another editor or developer advanced the branch after this form loaded. Preserve any unsaved text, reload to read the current branch, then retry. Do not force-push or overwrite the newer commits.
- Newly saved content fails build: check missing parent Pages, reserved slugs, image alias/path, required date/status and the specific build error. Avoid hotfixing framework internals.
- Local runner error: confirm the tracked dependency pre-bundling configuration described in [developer tooling](tooling.md#local-admin-runtime-and-historical-fixtures). Local authenticated writes remain unverified; validate authentication and writes on the deployed Worker.
- Pages build failure: inspect the Git SHA/build logs and Node/pnpm versions. Inspect the Actions validation gate and deployment job. Independent Pages Git builds must remain disabled to preserve the CI gate.

## Known limitations

Deleted public URLs may continue returning cached HTML after a successful deletion deployment. Confirm the Git commit and deployment, then check the unchanged URL and record timestamps and response headers if old content persists. See [CACHE-01](known-issues.md#cache-01--delayed-visibility-of-deleted-pages-content) for observed behavior and investigation evidence.

Official references: [Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/), [Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/).

## Failed deployment and recovery

For a failed deployment whose SHA is still the branch head, rerun failed jobs in its Actions run. Deployment concurrency serializes each app/branch without cancelling an active upload; a head check rejects stale queued runs. If the branch advanced, run the `CI` workflow manually on the current `dev` or `main` head. Manual dispatch performs full validation and deploys both targets, including changes missed by later docs-only pushes. Do not rerun an old SHA or rely on an unrelated push to repair a failed/stale deployment. A new commit during an upload can leave the prior validated version live until the next successful run.

Local Admin recovery commands remain `pnpm deploy:admin:preview` and `pnpm deploy:admin:production`; verify the correct repository/App public settings, branch head and full checks first, and run the commands sequentially. An emergency local deployment is an operator action, not proof the automatic workflow succeeded. Keep dev/content after promotion and verify the App synchronizes main back into both; never force-push publication history.
