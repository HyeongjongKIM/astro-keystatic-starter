# astro-keystatic-starter

Reusable Astro + Keystatic starter for customer blogs, portfolios, and content-driven websites.

**Status:** specification only; no application code has been implemented yet.

## Target architecture

| Component | Technology | Deployment |
| --- | --- | --- |
| Public Site | Astro SSG | Cloudflare Pages |
| Admin | Astro + Keystatic GitHub Mode | Cloudflare Workers (requires compatibility proof) |
| Shared schemas | pnpm workspace package | Build-time |
| Content and images | GitHub files | Committed source of truth |

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
