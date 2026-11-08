# Product roadmap

The starter provides a static Astro Site and a separate Keystatic Admin, with Git-backed content, automatic Page navigation, Posts, image optimization, SEO, and independent customer deployments. See [architecture](architecture.md) and [content model](content-model.md) for the current contracts.

Execution order, task status, acceptance criteria, and verification evidence are maintained only in the [task queue](../tasks/README.md). Current limitations are maintained in [known issues](known-issues.md). No next implementation phase is scheduled.

## Future candidates

These are deferred proposals, not committed deliverables:

- Gallery, video, and hero blocks.
- Multilingual content and search.
- Scheduled publishing and advanced draft preview.
- Automatic redirects after slug changes.
- Shared UI and themes when customer reuse demonstrates a need.

## Delivery criteria

- Task acceptance criteria pass, including deployed authentication/write checks when applicable.
- Required format, lint, type, test, and build checks pass.
- No secrets in source, unsupported APIs, or unapproved architecture changes.
- Task evidence records actual results and outstanding limitations.
- A customer can follow setup and operations documentation without access to a private reference project.
