# Task Phase Queue

Organize tasks by phase. Start with the earliest phase that is not DONE, then select the earliest task whose dependencies are completed from that phase's README. Do not advance past a blocked dependency or phase.

| Phase                                                              | Goal                                                            | Dependency | Status      |
| ------------------------------------------------------------------ | --------------------------------------------------------------- | ---------- | ----------- |
| [01 — Initial implementation](01-initial-implementation/README.md) | Deliver the Astro + Keystatic MVP and customer handoff          | None       | DONE        |
| [02 — Repository workflow](02-repository-workflow/README.md)       | Define branch, content publishing, CI, and deployment workflows | 01 DONE    | IN_PROGRESS |
| [03 — Site UI foundation](03-site-ui-foundation/README.md)         | Add React, Tailwind CSS, and shadcn/ui to Site                  | 02 DONE    | TODO        |

Initial implementation is complete with the maintainer-approved [CACHE-01](../docs/known-issues.md) deferral. Repository workflow core is complete; a maintainer-requested Actions runtime maintenance task is in progress. Site UI foundation has not started.

## Organization rules

- Keep each phase in a numbered directory such as `01-initial-implementation/`.
- Each phase README records its goal, status, task order, and dependencies.
- Each task document records its scope, acceptance criteria, status, and verification evidence.
- Task numbering restarts within each phase; use the phase path when referring to a task across phases.
- Use `TODO`, `IN_PROGRESS`, `BLOCKED`, or `DONE` for phase and task statuses. Mark a phase DONE only after all its tasks are DONE.
- Update task evidence and the phase index after observed results; update this queue when the phase status changes.
- Preserve completed phase directories. Add a new numbered directory and queue entry when the next phase is defined.

Full milestone context: [../docs/roadmap.md](../docs/roadmap.md).
