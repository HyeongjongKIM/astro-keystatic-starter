# Customer setup and operations

The confirmed [repository workflow](repository-workflow.md) defines `dev` editorial saves, PR promotion to `main`, and CI-gated deployment of both apps. Phase 02 is migrating the historical `preview`/manual-deployment setup described below; use its task evidence to distinguish current live settings from the confirmed target policy.

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
