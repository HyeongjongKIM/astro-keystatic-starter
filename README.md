# astro-keystatic-starter

Reusable Astro + Keystatic starter for customer blogs, portfolios, and content-driven websites.

**Status:** runtime compatibility verified; workspace foundation complete; content model is next.

## Target architecture

| Component          | Technology                    | Deployment                                        |
| ------------------ | ----------------------------- | ------------------------------------------------- |
| Public Site        | Astro SSG                     | Cloudflare Pages                                  |
| Admin              | Astro + Keystatic GitHub Mode | Cloudflare Workers (requires compatibility proof) |
| Shared schemas     | pnpm workspace package        | Build-time                                        |
| Content and images | GitHub files                  | Committed source of truth                         |

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
pnpm dev:site
pnpm dev:admin
```

Run the apps in separate terminals; use `pnpm --filter @starter/admin dev --port 4322` when Site already uses port 4321. The static Site and Workers Admin build separately:

```sh
pnpm --filter @starter/site build
pnpm --filter @starter/admin build
pnpm check
```

`pnpm check` runs format, lint, types, deterministic unit tests and both builds. Git hooks run lint-staged, Conventional Commit validation, and pre-push types/tests. Content contract tests cover nested Pages, linked MDX/image paths, draft filtering and invalid metadata.

Admin secrets belong in ignored `apps/admin/.dev.vars` (copy `.dev.vars.example`). The public App slug belongs in ignored `apps/admin/.env` (copy `.env.example`). Never put secrets in a `PUBLIC_` variable. Set `KEYSTATIC_GITHUB_REPO=owner/repository` in Admin `.env` before provisioning/building; the tracked config defaults to a placeholder.

The selected Workers runtime passed deployed OAuth/CRUD validation in Task 00. Its local development API runner has a recorded unresolved `exports is not defined` error; a successful dev startup or editor shell response does not establish working local authentication. The separate `apps/admin/astro.setup.config.mjs` is for approved Node-only GitHub App provisioning, via `pnpm --filter @starter/admin exec astro dev --config astro.setup.config.mjs`; it is not a production hosting option. Use the default Workers config for builds and deployment. See Task 00 for evidence and limitations.

The retained `tasks/01-initial-implementation/compatibility-probe` is excluded from the workspace and root format/lint checks to preserve historical reproduction files. Root lockfile and generated outputs are excluded from formatting.
