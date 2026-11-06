# Task 05 — Cloudflare Deployment and Customer Handoff

**Status:** TODO  
**Depends on:** Task 04 DONE  
**Read:** [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Publish Site and Admin independently through documented Cloudflare tooling and provide reproducible customer onboarding.

## Work

- [ ] Configure Pages Git integration, monorepo root/build/output settings.
- [ ] Configure Worker build and official Wrangler settings.
- [ ] Apply GitHub App OAuth callback, repository permissions, and runtime Secrets.
- [ ] Configure watch paths so content commits rebuild Site without needless Admin deployment.
- [ ] Separate preview and production variables/domains.
- [ ] Validate write-to-publish flow, 404/redirects, rollback, permission removal, secret hygiene.
- [ ] Write customer setup, operations, and troubleshooting instructions.

## Acceptance criteria

- A fresh customer repository can be deployed from written instructions.
- Admin login/edit produces a GitHub commit and Site deployment.
- Public assets contain no credentials or Admin server handlers.
- Tested rollback and permission removal procedures are documented.

## Verification evidence

_Pending: exact commands, date, deployments, outcomes, limitations._
