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
