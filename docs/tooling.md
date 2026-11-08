# Developer Tooling and CI

## Tools

| Tool                   | Standard                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------- |
| ESLint                 | Flat Config, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`                 |
| Prettier               | Root config and `prettier-plugin-astro`; add Tailwind plugin only if Tailwind is used |
| eslint-config-prettier | Disable conflicting formatting rules                                                  |
| Husky                  | Official Git hook setup                                                               |
| lint-staged            | Pre-commit checks on staged files                                                     |
| Commitlint             | Conventional Commits                                                                  |
| Vitest                 | Deterministic unit tests                                                              |
| GitHub Actions         | Required pull-request and push checks                                                 |

## Required root files

`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `lint-staged.config.mjs`, `commitlint.config.mjs`, `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push`, `.github/workflows/ci.yml`, `.nvmrc`, `pnpm-workspace.yaml`.

## Script contract

- `pnpm format` / `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck` (Astro apps use `astro check`)
- `pnpm test`
- `pnpm build` (independent Site + Admin builds)
- `pnpm check` (all checks)

Check workspace package names and avoid recursive script loops.

## Hooks and CI

- pre-commit: `pnpm exec lint-staged` (ESLint fix + Prettier as appropriate for JS/TS/Astro/JSON/CSS/MD).
- commit-msg: `pnpm exec commitlint --edit "$1"`.
- pre-push: `pnpm typecheck && pnpm test`.
- CI: pinned Node/pnpm, frozen install, format, lint, typecheck, test, both builds. Hooks are not a substitute for CI.
- Commitlint enforces the [commit rules](../AGENTS.md#commit-messages) locally and in CI. CI checks PR/push commit ranges; new-branch pushes check only the latest commit.
- Runtime OAuth and GitHub writes need deployed preview tests; build success alone is insufficient.

Avoid formatting generated artifacts and lockfiles. Validate compatibility before installing any additional plugin.

## Official sources

- https://docs.astro.build/en/editor-setup/
- https://github.com/withastro/prettier-plugin-astro
- https://typicode.github.io/husky/get-started.html
- https://github.com/lint-staged/lint-staged
- https://commitlint.js.org/

## Public output verification

`pnpm check` also runs `pnpm verify:site` after both builds. It checks current published/draft Posts against built routes, index, RSS and sitemap, plus image dimensions/optimized URLs, metadata, 404 noindex and absence of server/Admin artifacts. Schema tests use isolated fixtures instead of depending on editable starter content. `axe-core` is pinned for browser accessibility smoke audits; root CI does not claim full browser or assistive-technology coverage.
