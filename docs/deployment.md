# Cloudflare Deployment and Configuration

Phase 03 independent publishing is prepared but not activated. See [activation and operator guidance](publishing-setup.md) before switching editors to content or enabling automatic promotion. The existing dev/manual publication procedure below remains effective until migration and remote verification finish.

The confirmed [repository workflow](repository-workflow.md) defines `dev` editorial saves, PR promotion to `main`, and CI-gated deployment of both apps. See Phase 02 task evidence for verified deployment behavior and remaining limitations.

## Targets

- `apps/site`: Astro static build to Cloudflare Pages.
- `apps/admin`: Astro + Keystatic server routes to Cloudflare Workers.

Keystatic uses server-side Node APIs and the Workers runtime is different from Node.js. An Astro adapter compiling successfully does not prove OAuth and GitHub write behavior.

## Configuration contract

All file paths below are relative to the repository root. Real environment files are ignored; tracked `.example` files provide templates.

| Variable                           | Location                                                        | Required                                                | Classification                        | Rebuild after change       |
| ---------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------- | -------------------------- |
| `PUBLIC_SITE_URL`                  | `apps/site/.env` locally; Pages production/preview variables    | For deployment; local fallback is `https://example.com` | Public Site origin                    | Site                       |
| `KEYSTATIC_GITHUB_REPO`            | `apps/admin/.env`                                               | Yes, before provisioning/building                       | Public `owner/repository`             | Admin                      |
| `ADMIN_BRAND_NAME`                 | `apps/admin/.env`                                               | No; defaults to `Content Admin`                         | Public Admin title                    | Admin                      |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | `apps/admin/.env.preview` / `.env.production`                   | Yes, for the matching App                               | Public App slug                       | Admin                      |
| `KEYSTATIC_GITHUB_CLIENT_ID`       | Local Workers: `apps/admin/.dev.vars`; deployed: Worker secrets | Yes, for authentication                                 | App identifier; keep with credentials | No; update runtime setting |
| `KEYSTATIC_GITHUB_CLIENT_SECRET`   | Local Workers: `apps/admin/.dev.vars`; deployed: Worker secrets | Yes, for authentication                                 | Secret                                | No; update runtime secret  |
| `KEYSTATIC_SECRET`                 | Local Workers: `apps/admin/.dev.vars`; deployed: Worker secrets | Yes, for authentication                                 | Secret                                | No; update runtime secret  |

GitHub App provisioning initially generates credentials in `apps/admin/.env`. Move them into the matching mode file as described in [customer setup](customer-setup.md#provision-the-admin-apps-and-workers), and register them separately as Worker runtime secrets. Keep only shared repository/branding values in base `.env`. Restart local development servers after configuration changes.

Starter-defined variables must actually be consumed in application code. Never put secrets in `PUBLIC_` values, tracked config, or Wrangler `vars`.

## Setup rules

1. Commit only `.env.example` / `.dev.vars.example`; ignore real secret files.
2. Use Cloudflare Secrets or official Wrangler secret commands for production.
3. Follow current Astro Cloudflare adapter's generated Wrangler configuration, adding manual settings only when needed.
4. Restrict GitHub App installation to the customer repository and register the exact OAuth callback for each environment.
5. Separate preview and production domains, secrets, and callback URLs.

## Build triggers

GitHub Actions owns automatic deployments: affected `dev` pushes deploy preview; affected `main` pushes deploy production after `Required checks`. PRs only validate. Docs-only changes deploy neither app, editorial content/images and Site-only changes skip Admin, and Admin-only changes skip Site. Dependencies, shared configuration and unknown paths conservatively affect both. See the [path matrix](repository-workflow.md#validation-and-deployment-matrix).

Disable Pages automatic production/preview Git builds and competing Workers Git build triggers. Site uploads a validated artifact using official Wrangler Pages commands, with branch and SHA supplied explicitly. Admin uses the existing environment-specific build/deploy commands. The local full `pnpm check` remains independent of change classification.

Configure public validation values as repository variables and deployment settings/token separately in branch-restricted GitHub environments, as listed in [customer setup](customer-setup.md#configure-branches-and-static-site-hosting). Do not expose deployment tokens to PR jobs. Worker authentication secrets remain in each Worker. Deployments are serialized per app/environment; stale queued SHAs fail and require [recovery](operations.md#failed-deployment-and-recovery).

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

Full reproducible setup and operations: [customer-setup.md](customer-setup.md). The [Pages REST template](examples/pages-project.json) includes build settings, watch paths and separated URL/tooling variables. Admin deployment scripts select explicit preview/production configs and Astro modes; editorial-only changes do not trigger Admin deployment.
