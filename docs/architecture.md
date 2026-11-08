# Architecture Specification

## Repository structure

```text
astro-keystatic-starter/
├── apps/
│   ├── site/
│   │   ├── src/{components,layouts,pages,styles,lib}/
│   │   ├── public/
│   │   ├── astro.config.mjs
│   │   └── package.json
│   └── admin/
│       ├── src/
│       ├── keystatic.config.ts
│       ├── astro.config.mjs
│       ├── wrangler.jsonc
│       └── package.json
├── packages/
│   ├── content/{collections,singletons,fields,blocks}/
│   └── config/
├── content/{pages,posts,settings}/
├── docs/{roadmap,architecture,content-model,deployment,tooling}.md
├── tasks/
├── AGENTS.md
├── eslint.config.mjs
├── .prettierrc.json
├── lint-staged.config.mjs
├── commitlint.config.mjs
├── .husky/
├── .github/workflows/ci.yml
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── package.json
```

See the [content storage layout](content-model.md#mvp-storage-layout) for the configured content and image paths.

## Responsibilities

- **Site:** reads committed content at build time, emits static HTML, navigation, breadcrumbs, RSS, and sitemap; never performs visitor-time GitHub API requests.
- **Admin:** hosts authenticated Keystatic UI and API routes; writes content/assets to customer-owned GitHub repository.
- **Content package:** single source for Keystatic schemas and inferred types; no duplicated hand-written models.
- **Config package:** code-level defaults only; customer-editable site name/logo/description belong to Site Settings.
- **Repository:** each customer has isolated source, content, access, domains, and deployments.

## Publish flow

Editor save → GitHub commit → Cloudflare Pages build → public static HTML. Admin must not be required to serve an ordinary visitor request.

## Constraints

- Build and deploy Site and Admin independently; no shared generated output directories.
- No Admin secrets, authentication code, or privileged SDKs in the public Site bundle.
- Reject URL namespace collisions and malformed page hierarchy during build.
- Do not create a shared UI library until reuse is demonstrated.
- Runtime changes require deployed authentication and GitHub write validation; a successful build alone does not establish compatibility.

## Official sources

- https://keystatic.com/docs/installation-astro
- https://keystatic.com/docs/content-organisation
- https://docs.astro.build/en/guides/routing/
- https://developers.cloudflare.com/pages/configuration/monorepos/
