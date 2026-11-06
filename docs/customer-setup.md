# Customer setup and operations

## Create an independent customer repository

Copy this starter into a new customer-owned repository; do not share a deployment, App installation, secrets or content between customers. Keep the schema test fixtures separate from editorial content. Set the customer identity in `content/settings/site.yaml`; edit Pages/Posts in Keystatic after setup. Pages determine primary menus and breadcrumbs. Use `home` for Home and create parent Pages before nested children. Use draft/published for Posts; dates do not schedule publication.

Use Node 22.23.4 and pnpm 12.18.0, then run `pnpm install --frozen-lockfile` and `pnpm check`. The default Site URL is example.com for local builds; set the real origin before publishing. The `.vscode` folder recommends Astro, ESLint and Prettier.

## Connect the static Site to Cloudflare Pages

Authorize Cloudflare's official GitHub integration for the customer repository through the normal account-owner flow. Create a Git-connected Pages project (not Direct Upload) with production branch `main` and one preview branch `preview`:

| Setting              | Value                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| Root directory       | repository root (empty)                                                       |
| Build command        | `pnpm install --frozen-lockfile && pnpm --filter @starter/site build`         |
| Output               | `apps/site/dist`                                                              |
| Build image          | v3                                                                            |
| Node / pnpm          | `NODE_VERSION=22.23.4`, `PNPM_VERSION=12.18.0`                                |
| Install              | `SKIP_DEPENDENCY_INSTALL=true` (build command performs frozen install)        |
| Git hooks on builder | `HUSKY=0`                                                                     |
| Production URL       | `PUBLIC_SITE_URL=https://CUSTOMER-SITE.pages.dev` (or approved custom origin) |
| Preview URL          | `PUBLIC_SITE_URL=https://preview.CUSTOMER-SITE.pages.dev`                     |

Use separate production/preview variables. Set preview branches to custom/include `preview` and exclude `main`. Watch includes are `apps/site/*`, `packages/content/*`, `packages/config/*`, `content/*`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.nvmrc`; excludes empty. Pages wildcards include nested directories. This catches image/content changes and skips Admin-only changes. [pages-project.json](examples/pages-project.json) is a non-secret REST API template: replace project name, owner/repository names and numeric IDs, plus both URL values. The official project API can apply it after repository authorization.

Push `main` for production and `preview` for preview. A new project can also be built from its authorized Git branch through the official deployment API. Keep a successful deployment ID before rollback testing. Site deploys contain only static assets and need no Keystatic credentials or database.

## Provision the Admin Apps and Workers

Update the Worker names in `apps/admin/wrangler.jsonc` (preview) and `wrangler.production.jsonc` (production). Both use the documented Cloudflare adapter, sessions disabled and passthrough Admin image service, avoiding unnecessary KV/Images services. Do not deploy the Node setup configuration.

Set shared `KEYSTATIC_GITHUB_REPO=OWNER/REPOSITORY` in ignored `apps/admin/.env`. Repository identity is explicitly public through Astro's environment schema. Each environment needs a separate GitHub App and unique runtime secrets.

For a new production App, run:

```sh
pnpm --filter @starter/admin setup:app --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321/keystatic/setup`, enter the exact production Worker origin and create a uniquely named App (GitHub limits names to 34 characters). Install only on the customer repository. Official setup writes generated credentials and the public App slug to ignored `.env`. Move those generated settings into ignored `.env.production`, retaining only the shared repository setting in base `.env`. Never print or commit these values. Stop setup using `pnpm --filter @starter/admin exec astro dev stop`.

For preview, provision using the same Node config with `--mode preview` and save generated settings in `.env.preview`. Ensure base `.env` contains no App credentials and that the target mode's file has no existing credentials before creating another App. Copy `.env.preview.example` / `.env.production.example` for the non-secret slug settings. GitHub installation callbacks can return to loopback; use the corresponding mode's provisioning server for that App. If it is not running, complete installation then use the deployed editor's normal login. A 401 caused by a different App's local callback must not be bypassed.

Verify exact deployed callback for each App:

```text
https://PREVIEW-WORKER.workers.dev/api/keystatic/github/oauth/callback
https://PRODUCTION-WORKER.workers.dev/api/keystatic/github/oauth/callback
```

Official setup uses metadata/pull requests read and code read/write. Check the installation selects only the customer repo. Do not widen repository scope to resolve a login failure.

Build and deploy independently:

```sh
pnpm --filter @starter/admin deploy:preview
pnpm --filter @starter/admin deploy:production
```

These commands rebuild the matching mode/config before deploying, so Wrangler uses the correct generated config and Worker name. Both currently build into Admin `dist`; deploy sequentially, never reuse a build from the other environment. Site `dist` is independent. Default `pnpm build` builds Site and preview Admin; run `pnpm --filter @starter/admin build:production` when validating production config changes.

Register each environment's `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` through official `wrangler secret put KEY --name WORKER` or `wrangler secret bulk --name WORKER` using private stdin. An initial deployment may be needed to create the Worker before registering secrets. A public slug is build-time configuration; changing it requires a rebuild. Runtime Secrets do not change the editor's built repository/App identity. Keep secrets out of Wrangler vars and all PUBLIC_/client variables.

Local Workers API development has a known unresolved `exports is not defined` issue on the selected stack. Node is approved only for App provisioning. Validate authentication and writes on the deployed Worker; do not infer support from a build or editor shell response.

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
- Local runner error: use deployed validation and retain the recorded limitation; do not move production Admin to Node as a workaround.
- Pages build failure: inspect the Git SHA/build logs and Node/pnpm versions. This starter's Site build is separate from root CI; a successful Site deployment does not establish passing lint/tests.

Official references: [Pages monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/), [build image](https://developers.cloudflare.com/pages/configuration/build-image/), [watch paths](https://developers.cloudflare.com/pages/configuration/build-watch-paths/), [rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/), [redirects](https://developers.cloudflare.com/pages/configuration/redirects/), [Keystatic GitHub mode](https://keystatic.com/docs/github-mode), [Astro Cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/).

## Reference deployment and unresolved deletion freshness

The approved reference production origin is `https://astro-starter.hyeongjongkim.dev`, backed by the existing Git-connected Pages project. Preview remains `https://preview.astro-keystatic-starter-site.pages.dev`. The personal site's apex/www connections remain intact.

For a customer custom domain, register it in Pages before adding its CNAME; set production PUBLIC_SITE_URL and rebuild. Cloudflare documents account Bulk Redirects to send the production pages.dev hostname to the custom origin. Preserve query string, subpath matching and path suffix; keep Include subdomains off when preview/deployment aliases must remain independent. The reference uses list `starter_production_domain`, one 301 entry from `astro-keystatic-starter-site.pages.dev` to its custom origin. Manage or disable this rule before detaching/changing that custom domain. See [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) and [Pages domain redirects](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/).

Task 05 remains BLOCKED: unchanged, previously visited deleted paths can still return HTTP 200 with old HTML. The custom-domain test passed edits and rollback, but deletion failed even after a successful dashboard URL purge and the documented zone Purge Everything operation. Query variants return current 404; treat that as diagnosis, not resolution. Earlier CDN no-store header experimentation also failed and was reverted. Do not claim customer handoff complete from successful builds or accepted cache-purge responses.

The account's authenticated Free-plan support portal restricts cases to billing/account/registrar and directs technical issues to Community/AI/docs. No paid upgrade or public support message was sent. See the [support reproduction draft](../tasks/01-initial-implementation/pages-cache-support.md) and Task 05 for observed responses and exact deployment IDs. Cloudflare guidance on stale Pages assets is [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/); its suggested purge did not resolve this observed test.

Follow-up deployment-history investigation verified that the current deployment-specific URL and both deleted old deployment hosts return404, while an unchanged custom path can still return old200. No custom Cache Rules, Cache Response Rules, Page Rules or zone Worker routes were present. A documented temporary DNS Only comparison initially returned 404 after DNS refreshed, but a newly created Page under DNS Only reproduced stale200 after its deletion deployment. DNS Only was therefore rejected as a general fix and the reference CNAME was restored to Proxied. Do not infer recovery from a newly selected network path alone. Per-data-center Pages asset retention is documented; its role in this response and the supported deletion propagation time remain unresolved.

Final route comparison also found ordinary proxy access returning 404/SIN while the same host/path connected to previously visited Pages addresses still returned old 200/ICN. Record the response location and timestamps when investigating; a single newly routed 404 is not evidence of global invalidation.
