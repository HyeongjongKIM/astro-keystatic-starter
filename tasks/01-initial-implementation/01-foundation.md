# Task 01 — Workspace and Tooling Foundation

**Status:** DONE

**Depends on:** Task 00 DONE  
**Read:** [Architecture](../../docs/architecture.md), [Tooling](../../docs/tooling.md)

## Goal

Initialize reproducible pnpm workspace with separate Astro Site and Keystatic Admin projects using current official starters/integration.

## Work

- [x] Create root workspace, package scripts, lockfile, Node/pnpm versions.
- [x] Create `apps/site` Astro static app and `apps/admin` Astro Keystatic app.
- [x] Create `packages/content`, `packages/config`, and reserved `content/` folders.
- [x] Configure ESLint Flat Config including Astro support; Prettier Astro plugin; exclusions.
- [x] Configure Husky, lint-staged, Commitlint, Vitest, GitHub Actions.
- [x] Document local commands and safe environment examples.

## Acceptance criteria

- Fresh `pnpm install --frozen-lockfile` succeeds.
- Both apps can run/build separately without shared generated artifacts.
- Root lint/format/typecheck/test scripts are executable.
- Pre-commit and commit-msg hooks work; CI uses the same checks.

## Verification evidence

### 2026-11-10 — ESLint safety rules follow-up (DONE)

- [x] Added eight individual type-aware safety rules to the existing TS/TSX project-service configuration: floating/misused promises, await-thenable, only-throw-error, unnecessary assertions/conditions, deprecated APIs, and exhaustive switches. Conditions and deprecations report warnings; the other six report errors. Added strict equality and core duplicate-import checks, allowing separate type imports. Removed one unnecessary non-null assertion from the RSS publication date. No new dependencies or React rules.
- Official sources: [individual typed rules](https://typescript-eslint.io/getting-started/typed-linting/#enabling-individual-type-checked-rules), [duplicate imports](https://eslint.org/docs/latest/rules/no-duplicate-imports), and [strict equality](https://eslint.org/docs/latest/rules/eqeqeq).
- macOS arm64, Node 22.23.4/pnpm 12.18.0: `PATH=/Users/dsntech/.nvm/versions/node/v22.23.4/bin:$PATH pnpm check` exited 0: format, lint (no warnings), types, 28 tests, Site/Admin builds, and static output verification passed. Existing Admin chunk-size warning remains. An in-memory ESLint `lintText` smoke check using Node assertions confirmed diagnostics from all ten added rules and accepted separate value/type imports; no fixture files were written. `git diff --check` passed. No deployed authentication/write validation needed for this tooling change. Next task: none queued.

### 2026-11-09 — documentation organization follow-up (DONE)

- [x] Maintainer-requested documentation cleanup: reconciled historical proposals with current content/runtime contracts, centralized environment variable metadata in deployment docs, separated customer setup from operations, and moved reference deployment/investigation details into [historical notes](reference-deployment.md). Roadmap now records product direction; execution status remains in task indexes. README links to setup and operations separately.
- macOS arm64, pinned Node 22.23.4/pnpm 12.18.0 via `npm exec --yes --package=node@22.23.4 --package=pnpm@12.18.0 -- pnpm check`: exit 0; format, lint, types, 28 tests, Site/Admin builds and static output verification passed. A Python check of local Markdown link targets in README, top-level docs and historical notes found no missing files. Existing Admin chunk-size warning remains. No runtime changes or deployed authentication/write validation. Next task: none queued.

### 2026-11-09 — project README documentation follow-up (DONE)

- [x] Maintainer-requested documentation cleanup: README now introduces the project, features, local usage, configuration, and user-facing documentation. Removed task status, agent workflow links, and implementation planning; moved local runtime caveats and historical fixture exclusions to `docs/tooling.md`. Known issues remain linked for users.
- macOS arm64, pinned Node 22.23.4/pnpm 12.18.0 via `npm exec --yes --package=node@22.23.4 --package=pnpm@12.18.0 -- pnpm check`: exit 0; format, lint, types, 28 tests, Site/Admin builds and static output verification passed. Existing Admin client chunk size warning remains. Documentation-only change; no deployed OAuth/write validation performed. Next task: none queued.

### 2026-11-09 — root development/build shortcuts (DONE)

- [x] Added `dev:stop`, `build:site`, `build:admin:preview`, `build:admin:production`, and `preview:site`; updated README. Stop uses [pnpm recursive exec](https://pnpm.io/cli/exec) with both app filters and `--no-bail` so both commands are attempted.
- macOS arm64, Node 22.23.4/pnpm 12.18.0: `pnpm check` and `pnpm build:admin:production` exited 0 (28 tests, Site/Admin builds, static verification). Existing Admin size warning remains. A read-only `node -p process.cwd()` using the stop command's recursive flags confirmed both app directories; running development servers were not stopped, and Site preview was not launched. Next task: none queued.

### 2026-11-09 — root Admin deployment aliases (DONE)

- [x] Added `deploy:admin:preview` and `deploy:admin:production` at root, forwarding to existing Admin build/Wrangler scripts; updated README and customer guide.
- macOS arm64, Node 22.23.4/pnpm 12.18.0: Node assertions confirmed both aliases target existing scripts. `pnpm check` exited 0 (28 tests, both builds, static verification); existing Admin size warning remains. Deployment commands were not executed. Next task: none queued.

### 2026-11-09 — commit scope policy follow-up (DONE)

- [x] Added the agreed commit rules to AGENTS.md, Commitlint and CI. Official sources: [rules](https://commitlint.js.org/reference/rules.html), [CI setup](https://commitlint.js.org/guides/ci-setup.html).
- macOS arm64, Node 22.23.4/pnpm 12.18.0: eight accept/reject cases via `pnpm exec commitlint` passed; `pnpm exec commitlint --from 53bf965 --to HEAD --verbose` accepted all three commits. CI YAML parsed and run steps passed `bash -n`.
- `pnpm check`: exit 0 (including 28 tests and both builds); existing Admin size warning remains. Remote CI unverified. Next task: none queued.

### 2026-11-09 — combined local development command

- [x] Maintainer-requested tooling follow-up: root `pnpm dev` starts `dev:site` and `dev:admin` concurrently, with Site on 4321 and Admin on 4322. Individual commands remain available; README documents usage. No dependencies added.
- Official API: [pnpm run](https://pnpm.io/cli/run), regex script selection runs concurrently on the pinned pnpm 12.18.0.
- Environment: macOS arm64; shell Node 22.21.1 was rejected by Astro, so verification used `npm exec --yes --package=node@22.23.4 --package=pnpm@12.18.0 --`.
- `pnpm dev`: exit 0; both Astro background servers reported running on their assigned ports. `curl` against Site `/` and Admin `/keystatic` returned HTTP 200. Servers left running for local use; authentication and writes were not tested.
- `pnpm check`: exit 0; format, lint, typecheck, 28 tests, both builds and static output verification passed. Existing Admin client chunk size warning remains.
- Next task: no queued phase; the maintainer's Posts/Pages Admin column issue remains pending as a separate request.

### 2026-11-06 — local verification

Environment: macOS arm64, pinned Node 22.23.4 and pnpm 12.18.0 through `npm exec --yes --package=node@22.23.4 --package=pnpm@12.18.0 --`. Additional dependency selections and official peer/engine evidence are recorded in Task 00.

- `pnpm install`: exit 0, five workspace projects; exact lockfile generated and approved esbuild/workerd build scripts executed.
- `pnpm install --frozen-lockfile`: exit 0 in the workspace and in a fresh temporary directory containing only workspace manifests/lockfile. Fresh install added 630 packages; Husky reported no `.git` in the isolated directory as expected. Temporary directory removed.
- `pnpm check`: exit 0. Format and ESLint passed; shared packages passed `tsc --noEmit`; both apps passed `astro check` with zero errors/warnings/hints; Vitest exited 0 with no test files (foundation has no behavior tests); Site static build and Admin Workers build both succeeded in separate `dist` directories. Admin retains the existing >500 kB client chunk warning.
- `pnpm --filter @starter/site dev --host 127.0.0.1 --port 4321`: Site `/` returned HTTP 200. Admin equivalent on 4322 started and `/keystatic` returned HTTP 200. These are shell smoke checks only, not authentication/write proof. Astro starts background servers; an initial process-group stop attempt failed, then official `astro dev stop` stopped each server.
- `sh .husky/_/commit-msg <temporary-invalid-message-file>`: rejected `invalid message` with exit 1, confirming Husky invokes Commitlint. The completion commit exercises pre-commit lint-staged and valid commit-msg hooks. CI configuration invokes the same frozen install and `pnpm check`; no remote Actions run is claimed.
- `git diff --check`: passed before commit. Existing Markdown specification changes are Prettier normalization only. Historical probe excluded from workspace/lint/format; its source is unchanged.

Limitations: no customer repository/App credentials configured yet; Admin config has no collections until Task 02. Known local Workers API runner error from Task 00 remains unresolved and is documented in root README. Separate Node config is only for approved App provisioning. Build/shell success does not claim authenticated functionality. Next task: Task 02, content model.

### 2026-11-06 — VS Code workspace settings

- Added `.vscode/extensions.json` recommendations for Astro, ESLint and Prettier, plus `.vscode/settings.json` for format-on-save, explicit ESLint fixes, workspace TypeScript (`js/ts.tsdk.path`) and Astro formatting/lint validation. Uses the existing root Prettier config/plugin. No Tailwind/custom CSS at-rules are configured, so unknown-at-rule diagnostics are left enabled.
- Consulted [Astro editor setup](https://docs.astro.build/en/editor-setup/), [official Astro Prettier plugin setup](https://github.com/withastro/prettier-plugin-astro), [VS Code workspace extension recommendations](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace), and [workspace TypeScript configuration](https://code.visualstudio.com/docs/typescript/typescript-transpiling).
- Pinned Node 22.23.4/pnpm 12.18.0: `pnpm format:check`, `pnpm lint`, `pnpm typecheck` and `pnpm test` all exited 0. Type checks reported no errors/warnings/hints; Vitest has no test cases yet. No application source changed, so the earlier successful builds were not repeated for editor settings. Editor extension behavior was not interactively tested. `git diff --check` passed.
- Maintainer requested folding this addition into the Task 01 foundation commit. Task 02 remains unstarted; the broader initial-implementation goal is paused.
