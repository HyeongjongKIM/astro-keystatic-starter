# astro-keystatic-starter

Phase 03 independent publishing is prepared but not activated. See [activation and operator guidance](docs/publishing-setup.md) before switching editors to content or enabling automatic promotion. The existing dev/manual publication procedure below remains effective until migration and remote verification finish.

Reusable Astro + Keystatic starter for customer blogs, portfolios, and content-driven websites.

## Architecture

| Component          | Technology                    | Deployment                |
| ------------------ | ----------------------------- | ------------------------- |
| Public Site        | Astro SSG                     | Cloudflare Pages          |
| Admin              | Astro + Keystatic GitHub Mode | Cloudflare Workers        |
| Shared schemas     | pnpm workspace package        | Build-time                |
| Content and images | GitHub files                  | Committed source of truth |

Each customer receives an independently deployed copy of this repository. No database or R2 in the MVP.

## Features

- Pages with nested URLs, automatic navigation, and breadcrumbs.
- Posts and Pages with MDX rich text, edited through Keystatic.
- Git-backed content and images, with build-time image optimization.
- Separate static public Site and authenticated Admin deployments.
- Editable site identity and configurable Admin branding.

## Local development

Use Node `22.23.5` (`nvm install && nvm use`) and pnpm `12.18.0` (root `packageManager`). Install pnpm using its official installation instructions, then run:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` starts both apps concurrently in one terminal using pnpm's built-in script runner. Site uses `http://localhost:4321` and Admin uses `http://localhost:4322/keystatic`. To run only one app, use `pnpm dev:site` or `pnpm dev:admin`.

Astro starts development servers in the background. Stop both before restarting:

```sh
pnpm dev:stop
```

Build the apps separately, and preview the built static Site locally:

```sh
pnpm build:site
pnpm preview:site
pnpm build:admin:preview
pnpm build:admin:production
pnpm check
```

`pnpm check` runs format, lint, types, deterministic unit tests and both builds. Git hooks run lint-staged, Conventional Commit validation, and pre-push types/tests. [Repository workflow](docs/repository-workflow.md) defines `dev` editorial saves, PR promotion to `main`, change-aware CI and CI-gated independent deployments. Content contract tests cover nested Pages, linked MDX/image paths, draft filtering and invalid metadata; `pnpm verify:site` validates built output against current content.

Admin secrets belong in ignored `apps/admin/.dev.vars` (copy `.dev.vars.example`). The shared repository setting belongs in ignored `apps/admin/.env`; environment-specific App settings belong in `.env.preview` and `.env.production` (see their examples). Never put secrets in a `PUBLIC_` variable. Set `KEYSTATIC_GITHUB_REPO=owner/repository` in Admin `.env` before provisioning/building; the tracked config defaults to a placeholder.

Site identity is editable in Keystatic Site Settings. Branding CSS variables live in `apps/site/src/styles/global.css`. Copy `apps/site/.env.example` to `.env` and set `PUBLIC_SITE_URL` to the deployment origin before building; it controls canonical, Open Graph, RSS and sitemap URLs. The development fallback is `https://example.com`, not a customer production domain.

Set `ADMIN_BRAND_NAME="Customer Brand"` in `apps/admin/.env` for the Admin's top-left title (default: `Content Admin`). Restart development servers or rebuild/redeploy Admin after changing it. This public setting is independent of the Site Settings name.

Editor images are stored in `apps/site/src/assets/images` and referenced with the `@assets` alias, then optimized at build time through Astro Image. Public Site output has no authentication routes or browser-time GitHub requests.

Deployment: [customer setup](docs/customer-setup.md). Publishing and maintenance: [operations](docs/operations.md). Preview and production Admin use separate Apps, Workers and secrets.

Deploy Admin from the repository root with `pnpm deploy:admin:preview` or `pnpm deploy:admin:production`. Each command builds the selected environment before deploying through Wrangler; run them sequentially.

## Documentation

- [Customer setup](docs/customer-setup.md) — deployment and GitHub Apps.
- [Operations](docs/operations.md) — publishing, rollback, access removal, and troubleshooting.
- [Architecture](docs/architecture.md) — application and package boundaries.
- [Content model](docs/content-model.md) — Pages, Posts, Blocks, and navigation.
- [Deployment configuration](docs/deployment.md) — environments, variables, and secrets.
- [Developer tooling](docs/tooling.md) — checks, hooks, and CI.
- [Known issues](docs/known-issues.md) — current limitations, including deleted-page cache freshness.
