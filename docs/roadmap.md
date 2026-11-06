# Implementation Roadmap

Detailed executable acceptance criteria are maintained in [tasks/](../tasks/README.md).

| Order | Deliverable | Task | Status |
| --- | --- | --- | --- |
| 0 | Validate Admin runtime and GitHub writes | [00-compatibility](../tasks/01-initial-implementation/00-compatibility.md) | DONE |
| 1 | Initialize workspace and quality tools | [01-foundation](../tasks/01-initial-implementation/01-foundation.md) | TODO |
| 2 | Implement shared content schema and reader | [02-content](../tasks/01-initial-implementation/02-content.md) | TODO |
| 3 | Generate static routes, navigation, breadcrumbs | [03-navigation](../tasks/01-initial-implementation/03-navigation.md) | TODO |
| 4 | Build accessible public templates and SEO | [04-site](../tasks/01-initial-implementation/04-site.md) | TODO |
| 5 | Configure Cloudflare and customer handoff | [05-deployment](../tasks/01-initial-implementation/05-deployment.md) | TODO |

## Definition of done

- Every task acceptance criterion passes, including commands and end-to-end checks when specified.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and appropriate builds pass once available.
- No secrets in source, unsupported APIs, unapproved architecture changes, or unrelated refactors.
- Task status, verification evidence, version information, and outstanding limitations are recorded.
- A customer can follow the final deployment guide without access to a private reference project.

## Deferred

Gallery/video/hero blocks; multilingual content; search; scheduled publishing; advanced draft preview; automatic redirect migration; shared UI/themes until needed.
