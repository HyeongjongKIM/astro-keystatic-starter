# Task 01 — Workspace and Tooling Foundation

**Status:** TODO  
**Depends on:** Task 00 DONE  
**Read:** [Architecture](../../docs/architecture.md), [Tooling](../../docs/tooling.md)

## Goal

Initialize reproducible pnpm workspace with separate Astro Site and Keystatic Admin projects using current official starters/integration.

## Work

- [ ] Create root workspace, package scripts, lockfile, Node/pnpm versions.
- [ ] Create `apps/site` Astro static app and `apps/admin` Astro Keystatic app.
- [ ] Create `packages/content`, `packages/config`, and reserved `content/` folders.
- [ ] Configure ESLint Flat Config including Astro support; Prettier Astro plugin; exclusions.
- [ ] Configure Husky, lint-staged, Commitlint, Vitest, GitHub Actions.
- [ ] Document local commands and safe environment examples.

## Acceptance criteria

- Fresh `pnpm install --frozen-lockfile` succeeds.
- Both apps can run/build separately without shared generated artifacts.
- Root lint/format/typecheck/test scripts are executable.
- Pre-commit and commit-msg hooks work; CI uses the same checks.

## Verification evidence

_Pending: exact commands and observed output._
