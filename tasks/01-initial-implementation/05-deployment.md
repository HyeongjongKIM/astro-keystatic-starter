# Task 05 — Cloudflare Deployment and Customer Handoff

**Status:** IN_PROGRESS

**Depends on:** Task 04 DONE  
**Read:** [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Publish Site and Admin independently through documented Cloudflare tooling and provide reproducible customer onboarding.

## Work

- [x] Configure Pages Git integration, monorepo root/build/output settings.
- [x] Configure Worker build and official Wrangler settings.
- [x] Apply GitHub App OAuth callback, repository permissions, and runtime Secrets.
- [x] Configure watch paths so content commits rebuild Site without needless Admin deployment.
- [x] Separate preview and production variables/domains.
- [ ] Validate write-to-publish flow, 404/redirects, rollback, permission removal, secret hygiene.
- [x] Write customer setup, operations, and troubleshooting instructions.

## Acceptance criteria

- A fresh customer repository can be deployed from written instructions.
- Admin login/edit produces a GitHub commit and Site deployment.
- Public assets contain no credentials or Admin server handlers.
- Tested rollback and permission removal procedures are documented.

## Verification evidence

### 2026-11-06 — deployment configuration and E2E checkpoint

Environment: macOS arm64, Node 22.23.4/pnpm 12.18.0, Wrangler 4.158.0, official Cloudflare REST API using renewed Wrangler OAuth credential privately in memory, GitHub CLI read checks, Playwright/system Chrome with maintainer-authenticated GitHub. Started after Task 04 commit 2328c81; official Pages API/build-image/watch-path/rollback and Astro config/mode docs inspected.

- Created Git-connected Pages project `astro-keystatic-starter-site` through the official API after confirming the target did not exist; authorized GitHub repository `HyeongjongKIM/astro-keystatic-starter`. Root empty, frozen install + Site-only build, output `apps/site/dist`, build image v3. Both environments pin NODE_VERSION 22.23.4/PNPM_VERSION 12.18.0 and skip automatic install; HUSKY=0 on builder. Production PUBLIC_SITE_URL is `https://astro-keystatic-starter-site.pages.dev`; preview is the separate `https://preview.astro-keystatic-starter-site.pages.dev`. Preview source include branch `preview`, production `main`. Watch paths are preserved in the reusable non-secret JSON template.
- Initial official Git-branch deployment API created `0d914da7-f092-4fa3-8c03-25ef831f4efa` from 2328c81 and completed successfully; public Site HTTP 200. Subsequent content writes used the automatic Git integration, not Direct Upload or a substitute workflow.
- Preview Admin updated for the imported-image schema: Worker version `56acde16-c0f8-411c-b7b0-55ffa9039ec8`. Created separate production GitHub App `HyeongjongKIM Keystatic Admin` (`hyeongjongkim-keystatic-admin`) through approved Node-only provisioning, installed only on the same customer repo, then stopped the provisioning server. Verified production and preview App IDs and KEYSTATIC_SECRET differ without printing values.
- Separate `.env.preview` / `.env.production` files are ignored. Default scripts explicitly build preview mode; production uses `astro.production.config.mjs`, the official config merge/adapter configPath API and its own Wrangler name. Both deploy scripts rebuild before invoking Wrangler. Initial script name `setup` collided with pnpm's built-in command; renamed it to `setup:app` before documenting.
- `pnpm --filter @starter/admin deploy:production`: exit 0; production Worker `astro-keystatic-starter-admin`, version `09c87ef2-6b15-426a-82c2-7c4b2154dbde`, only ASSETS binding. Registered its three own runtime secrets via private stdin to named `wrangler secret bulk`; actual production client secret and signing secret absent from client artifacts. Production browser OAuth loaded the authenticated repository and Pages.
- Production UI created nested `projects/publication-proof`, rich text `Published from the Admin Worker.`, uploaded PNG. Git commit `c981164e4ec4cc57f3978285480ae560090498d0` stored linked MDX and image under the new `apps/site/src/assets/images` directory, with `@assets` references. Pages automatically created `cad8e738-e69c-44d4-8c57-d069d6d87daf` with trigger `github:push` at that SHA; deployment succeeded. Public proof URL returned the actual body and optimized WebP image. GitHub Actions on that editor commit also succeeded.
- Rollback API selected initial deployment 0d914da7; project canonical deployment confirmed that ID. The immediate public request still returned the newer page, so it was not treated as proof. Subsequent cache-distinct public request returned HTTP 404. Rolled forward to cad8e738; after propagation public proof URL returned HTTP 200. Both actual public states were verified, not just API acceptance.
- Revocation test: edited Home description locally in preview UI without saving, uninstalled preview App installation `179277601` through authenticated GitHub settings (one selected repository), then clicked Save. UI remained Unsaved with GraphQL repository-access denial; independent GitHub check confirmed no new commit and original Home description unchanged. Restored the form value and reinstalled the same App only on this repo (new installation `179286338`). Fresh preview read loaded original Home description. Local installation callback returned 401 because the running provisioning server was using the production App; no bypass attempted, and deployed preview access recovered independently. Production App was not removed.
- Production UI deleted proof Page; commit `911b39296e91741c23e0af824c1dfadc53009f5d`. Recursive Git tree returned zero proof paths, including image. Pages automatically rebuilt the deletion. Worker deployment snapshots before/after subsequent editor changes are being checked to verify no Admin deploy occurred.
- `pnpm check`: final configuration check exited 0 (format, lint, types, unit tests, independent builds, static output verification). `pnpm --filter @starter/admin build:production` also exited 0. Existing Admin chunk warning remains. No production Node runtime, extra data service or private framework patch introduced.

Remaining verification at this checkpoint: push deployment/redirect configuration, build the separate preview branch, confirm preview canonical/headers and live redirects, finish deployed secret/public-artifact checks, and record final CI and cleanup outcomes. Task 05 is not yet DONE.
