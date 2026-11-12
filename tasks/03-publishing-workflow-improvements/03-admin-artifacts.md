# Task 03 — Validated Admin Deployment Artifacts

**Status:** TODO

**Depends on:** [Task 02](02-deployment-recovery.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Deploy the same environment-specific Admin output that passed validation, avoiding the current second build during deployment.

## Work

- [ ] Verify documented Astro Cloudflare output, Wrangler deployment configuration and artifact portability with the pinned tools before implementation. Inspect generated path references and required files; do not rely on private adapter internals or claim portability from compilation alone.
- [ ] Produce separate preview/production validation artifacts without shared-output races. Record source SHA, environment, public repository/App/branding settings and selected tool versions; never include authentication credentials, local env files or tokens.
- [ ] Download only the approved artifact for the same trusted source/run and deployment environment after required checks pass. Reject missing, mismatched, tampered, expired or stale inputs. Preserve environment origin/settings checks already used by Site.
- [ ] Deploy through documented Wrangler commands without rebuilding the validated Admin artifact. Keep runtime secrets in the matching Worker and deployment credentials out of artifact creation and PR validation.
- [ ] Retain documented local build-and-deploy recovery commands. For absent/expired artifacts, revalidate and rebuild the approved current head rather than silently rebuilding inside an otherwise validated deployment step.
- [ ] Test environment/config/SHA mismatch rejection, artifact extraction/layout, build count and deployment failure recovery. Verify deployed OAuth and authenticated writes for both modes in Task 05.
- [ ] Update scripts and operator documentation around the final supported artifact contract. If a required output/config API is unsupported or unverified, stop and report the precise blocker before changing architecture.

## Acceptance criteria

Each Admin deployment uses its matching validated artifact with no second build and no preview/production output mix-up. Supported Wrangler deployment works after artifact extraction. Artifacts contain no secrets; mismatched or stale artifacts are rejected. Local recovery remains available.

## Verification plan

Run full root checks, both Admin validation builds, artifact contract/integration tests and workflow validation. Deploy trusted preview/production artifacts and record matching source SHA, public inputs and Worker versions. Build success alone does not establish OAuth/write support; complete that deployed gate in Task 05.

## Official references to consult before implementation

- [Astro Cloudflare integration](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Store workflow artifacts](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow)
- [Actions security guidance](https://docs.github.com/en/actions/reference/security/secure-use)

## Verification evidence

2026-11-12: Planning only. Work, acceptance checks and deployment/service validation have not been performed. Status remains TODO.
