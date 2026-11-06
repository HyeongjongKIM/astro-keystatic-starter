# Cloudflare Deployment and Configuration

## Targets

- `apps/site`: Astro static build to Cloudflare Pages.
- `apps/admin`: Astro + Keystatic server routes to Cloudflare Workers, **only after Task 00 validates compatibility**.

Keystatic uses server-side Node APIs and the Workers runtime is different from Node.js. An Astro adapter compiling successfully does not prove OAuth and GitHub write behavior.

## Configuration contract

| Name                               | Scope | Classification                                  |
| ---------------------------------- | ----- | ----------------------------------------------- |
| `PUBLIC_SITE_URL`                  | Site  | Public build-time URL; starter-defined          |
| `KEYSTATIC_GITHUB_REPO`            | Admin | Public build-time `owner/repo`; starter-defined |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Admin | Public Keystatic Astro setting                  |
| `KEYSTATIC_GITHUB_CLIENT_ID`       | Admin | GitHub App identifier                           |
| `KEYSTATIC_GITHUB_CLIENT_SECRET`   | Admin | Secret                                          |
| `KEYSTATIC_SECRET`                 | Admin | Secret                                          |

Starter-defined variables must actually be consumed in application code. Never put secrets in `PUBLIC_` values, tracked config, or Wrangler `vars`.

## Setup rules

1. Commit only `.env.example` / `.dev.vars.example`; ignore real secret files.
2. Use Cloudflare Secrets or official Wrangler secret commands for production.
3. Follow current Astro Cloudflare adapter's generated Wrangler configuration, adding manual settings only when needed.
4. Restrict GitHub App installation to the customer repository and register the exact OAuth callback for each environment.
5. Separate preview and production domains, secrets, and callback URLs.

## Build triggers

- Site must rebuild when `apps/site/**`, `packages/content/**`, `packages/config/**`, `content/**`, or relevant lock/config files change.
- Admin builds independently from its root directory and Wrangler config.
- A Keystatic content commit must trigger a Site deployment without rebuilding Admin unnecessarily.

## Customer handoff

Create customer repository → create Pages/Worker → configure domain and GitHub App → provision variables/secrets → login/write test → verify Git commit and static rebuild → verify rollback, access removal, canonical metadata and 404.

## Security gates

- Confirm no Admin secrets/auth code in public output.
- Validate GitHub permissions, OAuth callback and image uploads on deployed Worker.
- Use Pages `_redirects` for supported static redirects and validate them in production preview.

## Official sources

- https://keystatic.com/docs/github-mode
- https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- https://developers.cloudflare.com/pages/configuration/monorepos/
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/pages/configuration/redirects/

Admin repository identity uses Astro `env.schema` as a public client variable, consumed from `astro:env/client`, because Keystatic config runs in both client and server bundles. Keep the same environment schema in default and Node provisioning configs. Set `KEYSTATIC_GITHUB_REPO` before building; runtime Worker secrets do not change the already-built editor repository selection. Never classify authentication credentials as public client variables.

Full reproducible setup and operations: [customer-setup.md](customer-setup.md). The [Pages REST template](examples/pages-project.json) includes build settings, watch paths and separated URL/tooling variables. Admin deployment scripts select explicit preview/production configs and Astro modes; no content-triggered Admin build is configured.
