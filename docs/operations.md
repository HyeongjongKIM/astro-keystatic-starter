# Content operations and maintenance

The confirmed [repository workflow](repository-workflow.md) defines `dev` editorial saves, PR promotion to `main`, and CI-gated deployment of both apps. Phase 02 is migrating the historical `preview`/manual-deployment setup described below; use its task evidence to distinguish current live settings from the confirmed target policy.

Complete [customer setup](customer-setup.md) before using the deployed Admin. For configuration changes, use the [configuration reference](deployment.md#configuration-contract).

## Publish and verify

Log in to the deployed Admin, create a temporary nested Page under an existing parent, add a Rich text block and upload an image. Save. Confirm a GitHub commit contains YAML, linked MDX and an image under `apps/site/src/assets/images`; image references use `@assets`. Confirm Pages creates a `github:push` deployment for the same SHA and the public URL/menu/breadcrumb/image updates after success. Verify image dimensions/optimized WebP, canonical origin, `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`, draft exclusion and an unknown-path 404. `/journal` and `/journal/` deliberately redirect to `/posts/` with 301; remove these rules and reserved slug together if changing the convention.

Delete temporary content through Admin and verify its image also disappears from Git and a new Site deployment removes the URL. Neither content commit should trigger an Admin deployment: Admin deployment is deliberately manual and independent. Use `git pull --rebase` before coding after editor commits; preserve unrelated local work first. No forced push is needed.

Run `pnpm check` locally and confirm GitHub Actions. Unit fixtures are independent of customer edits; `verify:site` checks built output against current Posts. Browser accessibility audits are smoke checks, not exhaustive assistive-technology validation.

## Rollback and access removal

In Pages Deployments, select a previously successful production deployment and Rollback to this deployment, or use the official rollback API. Preview deployments are not rollback targets. Confirm both the selected canonical deployment ID and actual public responses; allow propagation before concluding a failure. Restore a newer successful deployment with the same mechanism. Rollback changes the served Site, not repository content; the next Git push can publish current content again. Use an intentional Git revert if content must also be reverted.

For revocation, use GitHub Settings → Applications → Installed GitHub Apps → Configure for the exact environment's App → Uninstall (or remove a collaborator's repository access when offboarding that user). Confirm pending saves fail and no new Git commit is made. The tested procedure removes an App installation; collaborator removal is an operational alternative, not a claimed test. Public static pages must remain available. Reinstall through the registered App's Install App screen, select only the same customer repo and re-login if needed; existing credentials remain specific to that App. Do not uninstall another environment's App to test isolation.

Rotate compromised GitHub App credentials and Worker secrets, then verify a fresh login/write. If retiring a customer, remove only that customer's Pages project, Workers, App registrations/installations and local credentials after deciding what content to retain.

## Troubleshooting

- Repo not found: verify the public build-time repository setting and selected App installation; rebuild after changing identity.
- Missing credentials / OAuth failure: verify all three runtime secrets, public slug, exact callback and the matching environment's App.
- Setup loses manifest after GitHub login: return to Keystatic setup and submit again after login; avoid duplicate App registrations.
- Newly saved content fails build: check missing parent Pages, reserved slugs, image alias/path, required date/status and the specific build error. Avoid hotfixing framework internals.
- Local runner error: confirm the tracked dependency pre-bundling configuration described in [developer tooling](tooling.md#local-admin-runtime-and-historical-fixtures). Local authenticated writes remain unverified; validate authentication and writes on the deployed Worker.
- Pages build failure: inspect the Git SHA/build logs and Node/pnpm versions. This starter's Site build is separate from root CI; a successful Site deployment does not establish passing lint/tests.

## Known limitations

Deleted public URLs may continue returning cached HTML after a successful deletion deployment. Confirm the Git commit and deployment, then check the unchanged URL and record timestamps and response headers if old content persists. See [CACHE-01](known-issues.md#cache-01--delayed-visibility-of-deleted-pages-content) for observed behavior and investigation evidence.

Official references: [Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/), [Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/).
