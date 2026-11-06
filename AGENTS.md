# Coding Agent Instructions — astro-keystatic-starter

## Purpose

Build a reusable, customer-specific Astro + Keystatic starter. This file governs implementation work in this repository. Read [README.md](README.md) and the relevant specification before changing code.

## Execution workflow

1. Read [tasks/README.md](tasks/README.md); open the earliest phase that is not DONE, then read its README and select the earliest task whose dependencies are completed. Do not advance past a blocked dependency or phase.
2. Read that task, the linked specification files, and applicable current official documentation.
3. Inspect existing files and Git status before editing. Preserve unrelated work.
4. Implement only the selected task. Do not silently extend the feature scope or redesign the architecture.
5. Run the task's verification commands, plus applicable root checks.
6. Update the task's checkboxes, status, and verification evidence only after observing the results. Update its phase index and, when the phase status changes, the phase queue.
7. Report changed files, tests, limitations, and the next task.

## Engineering rules

- **Official-first:** Prefer officially documented Astro, Keystatic, Cloudflare, and tooling APIs. No private framework internals, unofficial patches, or workaround architectures.
- **Stop on uncertainty:** If required compatibility or a documented API cannot be verified, stop and report the exact blocker. Do not claim support based on compilation alone.
- **Separation:** Keep public Astro Site static and independent from authenticated Admin Worker.
- **Single content source:** Pages generate public paths, navigation, and breadcrumbs. Do not introduce a separate Navigation model or Directory page type.
- **Reusable schemas:** Page/Post body uses Keystatic Blocks with only an MDX rich-text block in MVP.
- **Security:** Never commit secrets or embed them in frontend artifacts. Do not bypass protected deployment or GitHub permission flows.
- **Customer isolation:** One independent repository and deployment per customer.
- **Changes:** Keep diffs small and task-specific; add tests for behavior and regressions.
- **Version policy:** Record selected dependency versions and official support evidence in Task 00. Pin reproducible tooling as specified.
- **No assumptions:** Mark inferred proposals as proposals; record actual results in task evidence.

## Required checks

When configured, run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and relevant `pnpm build`. Never mark a check passed without running it. Workers auth and write operations require deployed E2E validation.

## Reference index

- Architecture: [docs/architecture.md](docs/architecture.md)
- Content: [docs/content-model.md](docs/content-model.md)
- Deployment: [docs/deployment.md](docs/deployment.md)
- Tooling: [docs/tooling.md](docs/tooling.md)
- Milestones: [docs/roadmap.md](docs/roadmap.md)
- Task queue: [tasks/README.md](tasks/README.md)

## Task status format

Use `TODO`, `IN_PROGRESS`, `BLOCKED`, or `DONE`. Record the command, environment, observed result, and date in the task evidence section. If blocked, state exactly what is unresolved and ask the maintainer for direction before changing the agreed architecture.
