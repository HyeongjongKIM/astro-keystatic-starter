# astro-keystatic-starter

Reusable Astro + Keystatic starter for customer blogs, portfolios, and content-driven websites.

**Status:** Initial implementation (Tasks 00–05) is complete. Site and Admin are deployed and the customer handoff guide is available. Deleted-page cache freshness remains unresolved and is deferred by maintainer decision as [CACHE-01](docs/known-issues.md).

## Target architecture

| Component          | Technology                    | Deployment                |
| ------------------ | ----------------------------- | ------------------------- |
| Public Site        | Astro SSG                     | Cloudflare Pages          |
| Admin              | Astro + Keystatic GitHub Mode | Cloudflare Workers        |
| Shared schemas     | pnpm workspace package        | Build-time                |
| Content and images | GitHub files                  | Committed source of truth |

Each customer receives an independently deployed copy of this repository. No database or R2 in the MVP.

## Agent documentation

1. [AGENTS.md](AGENTS.md) — mandatory coding-agent instructions
2. [tasks/README.md](tasks/README.md) — phase queue, with task execution order and status in each phase README
3. [docs/roadmap.md](docs/roadmap.md) — milestones and definition of done
4. [docs/architecture.md](docs/architecture.md) — app and package boundaries
5. [docs/content-model.md](docs/content-model.md) — Pages, Posts, Blocks, automatic navigation
6. [docs/deployment.md](docs/deployment.md) — environments, secrets, deployment
7. [docs/tooling.md](docs/tooling.md) — lint, format, hooks, tests, CI

## Non-negotiable product decisions

- Pages are the source of truth for URLs, navigation, and breadcrumbs; no Navigation singleton.
- All navigable items are Pages, with nested slugs; no separate Directory type.
- Page and Post bodies begin with one Keystatic `fields.blocks()` type containing an MDX rich-text field.
- Use official APIs and integrations. Do not introduce unsupported runtime workarounds.
- Validate Keystatic/Astro/Workers compatibility before implementing the rest of the project.
- Custom blocks, search, multilingual support, complex theming, and scheduled publishing are deferred.

The project has no dependency on any separate reference repository.

## Local development

Use Node `22.23.4` (`nvm install && nvm use`) and pnpm `12.18.0` (root `packageManager`). Install pnpm using its official installation instructions, then run:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` starts both apps concurrently in one terminal using pnpm's built-in script runner. Site uses `http://localhost:4321` and Admin uses `http://localhost:4322/keystatic`. To run only one app, use `pnpm dev:site` or `pnpm dev:admin`. The static Site and Workers Admin build separately:

Astro starts development servers in the background. Stop both before restarting:

```sh
pnpm --filter @starter/site exec astro dev stop
pnpm --filter @starter/admin exec astro dev stop
```

```sh
pnpm --filter @starter/site build
pnpm --filter @starter/admin build
pnpm check
```

`pnpm check` runs format, lint, types, deterministic unit tests and both builds. Git hooks run lint-staged, Conventional Commit validation, and pre-push types/tests. Content contract tests cover nested Pages, linked MDX/image paths, draft filtering and invalid metadata; `pnpm verify:site` validates built output against current content.

Admin secrets belong in ignored `apps/admin/.dev.vars` (copy `.dev.vars.example`). The shared repository setting belongs in ignored `apps/admin/.env`; environment-specific App settings belong in `.env.preview` and `.env.production` (see their examples). Never put secrets in a `PUBLIC_` variable. Set `KEYSTATIC_GITHUB_REPO=owner/repository` in Admin `.env` before provisioning/building; the tracked config defaults to a placeholder.

The selected Workers runtime passed deployed OAuth/CRUD validation in Task 00. The local development API runner's `exports is not defined` error is fixed by pre-bundling Keystatic's nested CommonJS `cookie` dependency. Local unauthenticated auth routes were verified; completed local OAuth and authenticated writes remain unverified. The separate `apps/admin/astro.setup.config.mjs` is for approved Node-only GitHub App provisioning, via `pnpm --filter @starter/admin setup:app`; it is not a production hosting option. Use the default Workers config for builds and deployment. See Task 00 for deployed evidence and limitations.

The retained `tasks/01-initial-implementation/compatibility-probe` is excluded from the workspace and root format/lint checks to preserve historical reproduction files. Root lockfile and generated outputs are excluded from formatting.

Site identity is editable in Keystatic Site Settings. Branding CSS variables live in `apps/site/src/styles/global.css`. Copy `apps/site/.env.example` to `.env` and set `PUBLIC_SITE_URL` to the deployment origin before building; it controls canonical, Open Graph, RSS and sitemap URLs. The development fallback is `https://example.com`, not a customer production domain.

Set `ADMIN_BRAND_NAME="Customer Brand"` in `apps/admin/.env` for the Admin's top-left title (default: `Content Admin`). Restart development servers or rebuild/redeploy Admin after changing it. This public setting is independent of the Site Settings name.

Editor images are stored in `apps/site/src/assets/images` and referenced with the `@assets` alias, then optimized at build time through Astro Image. Public Site output has no authentication routes or browser-time GitHub requests.

Deployment and customer operations: [customer setup](docs/customer-setup.md). Preview and production Admin use separate Apps, Workers and secrets.
