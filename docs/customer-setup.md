# Customer setup and operations

The confirmed [repository workflow](repository-workflow.md) defines `dev` editorial saves, PR promotion to `main`, and CI-gated deployment of both apps. See Phase 02 task evidence for verified deployment behavior and remaining limitations.

## Create an independent customer repository

Copy this starter into a new customer-owned repository; do not share a deployment, App installation, secrets or content between customers. Keep the schema test fixtures separate from editorial content. Set the customer identity in `content/settings/site.yaml`; edit Pages/Posts in Keystatic after setup. Pages determine primary menus and breadcrumbs. Use `home` for Home and create parent Pages before nested children. Use draft/published for Posts; dates do not schedule publication.

Use Node 22.23.4 and pnpm 12.18.0, then run `pnpm install --frozen-lockfile` and `pnpm check`. The default Site URL is example.com for local builds; set the real origin before publishing. The `.vscode` folder recommends Astro, ESLint and Prettier.

## Configure branches and static Site hosting

Generate only the template default branch, then create `dev` from the customer's `main`. Use [the workflow policy](repository-workflow.md) for branch protection and PR publication. Editors save on `dev`; merging the PR publishes accumulated code and content together.

Authorize Cloudflare's official GitHub integration for the customer repository. Create a Pages project with production branch `main`, repository root, build command `pnpm install --frozen-lockfile && pnpm --filter @starter/site build`, and output `apps/site/dist`. Preserve existing domains when adopting this workflow. The [Pages REST template](examples/pages-project.json) retains these recovery build settings, but disables automatic production and preview Git builds. Actions uploads validated static output with explicit `main` or `dev` branch and SHA; independent Pages Git builds would bypass the CI gate.

Set Node `22.23.4`, pnpm `12.18.0`, `HUSKY=0`, and `SKIP_DEPENDENCY_INSTALL=true` in Pages for manual Git-build recovery. Configure production `PUBLIC_SITE_URL` to the customer origin and preview to `https://dev.CUSTOMER-SITE.pages.dev`. Pages environment variables do not automatically reach Actions. The Actions configuration below is authoritative for automatic deployment.

Create GitHub environments `preview` and `production`, allowing only branches `dev` and `main` respectively, without required reviewers. Populate each environment:

| Name                               | Kind     | Value                                                    |
| ---------------------------------- | -------- | -------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`            | Variable | Customer account ID                                      |
| `CLOUDFLARE_PAGES_PROJECT`         | Variable | Existing Pages project name                              |
| `PUBLIC_SITE_URL`                  | Variable | Matching production origin or `dev` preview origin       |
| `KEYSTATIC_GITHUB_REPO`            | Variable | `OWNER/REPOSITORY`                                       |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Variable | Matching environment's App slug                          |
| `ADMIN_BRAND_NAME`                 | Variable | Optional Admin title                                     |
| `CLOUDFLARE_API_TOKEN`             | Secret   | Customer-account-scoped deployment token                 |
| `DEPLOY_ENABLED`                   | Variable | `true` only after all settings and credentials are ready |

Use the official Cloudflare token UI, limiting resources to the customer account. Grant Pages Edit, Workers Scripts Edit and Account Settings Read required for account lookup; add no unrelated zones or products. Retain the existing Worker runtime authentication secrets. Never use an expiring local Wrangler OAuth token as the CI credential.

For validation jobs without deployment secrets, set repository variables `KEYSTATIC_GITHUB_REPO`, optional `ADMIN_BRAND_NAME`, `PREVIEW_KEYSTATIC_GITHUB_APP_SLUG`, `PRODUCTION_KEYSTATIC_GITHUB_APP_SLUG`, `PREVIEW_PUBLIC_SITE_URL` and `PRODUCTION_PUBLIC_SITE_URL`. Keep these public values aligned with environment variables: Site deployment rejects an origin different from its validated artifact. Unprovisioned copies can run checks against placeholders but cannot deploy until configured.

Before activating the workflow, inspect and disable automatic Pages Git builds and any competing Workers Git build triggers, while preserving the old `preview` branch/alias until `dev` deployment succeeds. Run remote checks before making `Required checks` mandatory. Protect `main` against direct saves, deletion and force pushes, including administrators, with PRs, zero approvals, merge commits and required checks; protect `dev` against deletion/force pushes without blocking direct editorial commits. Verify the effective rules and real editor saves after activation. No App bypass is used.

## Provision the Admin Apps and Workers

The [configuration reference](deployment.md#configuration-contract) lists environment files, required values, secrecy, and rebuild requirements.

Update the Worker names in `apps/admin/wrangler.jsonc` (preview) and `wrangler.production.jsonc` (production). Both use the documented Cloudflare adapter, sessions disabled and passthrough Admin image service, avoiding unnecessary KV/Images services. Do not deploy the Node setup configuration.

Set shared `KEYSTATIC_GITHUB_REPO=OWNER/REPOSITORY` in ignored `apps/admin/.env`. Repository identity is explicitly public through Astro's environment schema. Each environment needs a separate GitHub App and unique runtime secrets.

Set `ADMIN_BRAND_NAME="Customer Brand"` in the same `.env` to customize the Admin's top-left title through Keystatic's official `ui.brand.name`. This is a public build-time value, shared by preview and production; missing or blank values display `Content Admin`. Rebuild and redeploy each Admin environment after changing it (restart local development servers). Public Site naming remains controlled by Site Settings. See [Keystatic UI configuration](https://keystatic.com/docs/user-interface) and [Astro environment variables](https://docs.astro.build/en/guides/environment-variables/).

For a new production App, run:

```sh
pnpm --filter @starter/admin setup:app --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321/keystatic/setup`, enter the exact production Worker origin and create a uniquely named App (GitHub limits names to 34 characters). Install only on the customer repository. Official setup writes generated credentials and the public App slug to ignored `.env`. Move those generated settings into ignored `.env.production`, retaining only the shared repository and Admin branding settings in base `.env`. Never print or commit these values. Stop setup using `pnpm --filter @starter/admin exec astro dev stop`.

For preview, provision using the same Node config with `--mode preview` and save generated settings in `.env.preview`. Ensure base `.env` contains no App credentials and that the target mode's file has no existing credentials before creating another App. Copy `.env.preview.example` / `.env.production.example` for the non-secret slug settings. GitHub installation callbacks can return to loopback; use the corresponding mode's provisioning server for that App. If it is not running, complete installation then use the deployed editor's normal login. A 401 caused by a different App's local callback must not be bypassed.

Verify exact deployed callback for each App:

```text
https://PREVIEW-WORKER.workers.dev/api/keystatic/github/oauth/callback
https://PRODUCTION-WORKER.workers.dev/api/keystatic/github/oauth/callback
```

Official setup uses metadata/pull requests read and code read/write. Check the installation selects only the customer repo. Do not widen repository scope to resolve a login failure.

Build and deploy Admin from the repository root:

```sh
pnpm deploy:admin:preview
pnpm deploy:admin:production
```

These commands rebuild the matching mode/config before deploying, so Wrangler uses the correct generated config and Worker name. Both currently build into Admin `dist`; deploy sequentially, never reuse a build from the other environment. Site `dist` is independent. Default `pnpm build` builds Site and preview Admin; run `pnpm --filter @starter/admin build:production` when validating production config changes.

Register each environment's `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` through official `wrangler secret put KEY --name WORKER` or `wrangler secret bulk --name WORKER` using private stdin. An initial deployment may be needed to create the Worker before registering secrets. A public slug is build-time configuration; changing it requires a rebuild. Runtime Secrets do not change the editor's built repository/App identity. Keep secrets out of Wrangler vars and all PUBLIC_/client variables.

Local Workers API development requires the tracked `vite.optimizeDeps.include` entry for `@keystatic/core > cookie`; it fixes the previously recorded `exports is not defined` error. Completed local OAuth and authenticated writes remain unverified. Node is approved only for App provisioning. Validate authentication and writes on the deployed Worker; do not infer support from a build or editor shell response.

## Next steps

Follow [publishing and verification](operations.md#publish-and-verify), then review [rollback and access removal](operations.md#rollback-and-access-removal). Current limitations are maintained in [known issues](known-issues.md).

## Custom domains

Register the customer domain in Pages before adding its CNAME; set production `PUBLIC_SITE_URL` and rebuild. Cloudflare documents account Bulk Redirects to send the production pages.dev hostname to the custom origin. Preserve query string, subpath matching and path suffix; keep Include subdomains off when preview/deployment aliases must remain independent. Manage or disable the redirect before detaching or changing the custom domain.

See [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) and [Pages domain redirects](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/).

Official references: [Pages monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/), [build image](https://developers.cloudflare.com/pages/configuration/build-image/), [watch paths](https://developers.cloudflare.com/pages/configuration/build-watch-paths/), [Keystatic GitHub mode](https://keystatic.com/docs/github-mode), [Astro Cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/).
