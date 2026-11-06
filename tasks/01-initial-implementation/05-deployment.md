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

### 2026-11-07 KST — final checks and exact CDN-cache blocker

- Configuration checkpoint rebased onto editor-generated commits and pushed as `7422be27cc98ee0700a2188d0b51b195b8ee4cd1` to `main` and new `preview` branch. Git hooks passed; pre-push reported 28 tests passed. GitHub Actions runs `42235590149` and `42235590093` both completed successfully for that SHA, covering the configured frozen install and root checks.
- Git-connected production deployment `adfc2c39-5191-41e9-b383-0f3ac0fe84f2` and preview deployment `dcb2a676-b49a-478b-a984-42ec5ac364e7` both succeeded. Production canonical deployment confirmed adfc2c39; preview has its separate canonical origin `https://preview.astro-keystatic-starter-site.pages.dev/` and `X-Robots-Tag: noindex`. Production Home has its production canonical and normal `public, max-age=0, must-revalidate` cache header.
- Production Home, nested photography, published Post, RSS, sitemap index and robots returned 200; draft Post and a never-existing route returned 404. Both `/journal` and `/journal/` returned 301 to `/posts/` (the slash variant was checked separately after the combined check stopped on the stale-deletion assertion).
- Verified production App settings exact deployed callback and installation `179284653`: metadata/pull requests read, code read/write, Only select repositories checked and exactly this repository selected. Preview installation restored as `179286338`; original Home description was read after restoration. Temporary unauthorized-save marker never reached Git.
- Both Worker deployment snapshots were identical across subsequent content edits/deletion, confirming content-triggered Pages builds did not redeploy Admin.
- Private value scans of all 136 tracked files, local public Site output and production Admin client output found none of either environment's actual client secrets/signing secrets. Ignored credential files remain local; no values recorded. No test proof files remain in the repository tree.

**Unresolved blocker:** ordinary URL `https://astro-keystatic-starter-site.pages.dev/projects/publication-proof/` still returns deleted HTML with HTTP 200, `CF-Cache-Status: HIT`, `Cache-Control: public, s-maxage=604800`, and an increasing Age (observed above 6,000 seconds). A unique query URL for the same path returns the current HTTP 404 with no-store. Regular Chrome, compressed curl, Cache-Control: no-cache and Range requests also observed the stale 200. This is not treated as successful deletion propagation. The latest production deployment and repository have no such Page. The source/build contains no s-maxage rule. The reason the old response has that header and a supported invalidation path for this pages.dev cache remain unverified.

- Deleted only obsolete proof-containing deployment `cad8e738-e69c-44d4-8c57-d069d6d87daf` through the documented deployment DELETE API after confirming it was neither current canonical nor latest deployment. This was test-artifact cleanup, not a claimed cache fix; plain URL still returned 200 afterward. Initial clean rollback target and current production/preview deployments remain.
- [Official Serving Pages documentation](https://developers.cloudflare.com/pages/configuration/serving-pages/) describes stale cached assets and zone Caching → Purge Everything. The official cache purge API is zone-scoped; `GET /zones?name=pages.dev` returned no accessible zone for this account. The Pages API documents build-cache purge, which is not evidence of CDN-cache invalidation; it was not substituted. No undocumented API, proxy, forced rewrite/tombstone, alternative hosting architecture or unrelated-zone purge was used.

Maintainer direction required before continuing: arrange supported Cloudflare pages.dev cache invalidation/support and revalidate the unchanged URL, or provide an approved customer-owned production domain/zone so the documented cache controls can be configured and tested. An architecture change has not been made. Task 05 and this phase remain BLOCKED; Tasks 00–04 remain DONE. Successful compile/deploy/query-distinct checks do not close this public freshness gate.

Final cleanup: stopped the local Site preview and closed the dedicated Playwright browser; removed its ignored snapshots/logs, including OAuth callback/App settings captures. General CLI logins and the ignored mode-specific local development credential files were retained; credential files restricted to owner read/write. `git diff --check` passed before the final documentation commit.

### 2026-11-07 KST — resumed supported cache-header experiment

Maintainer requested continuation. Testing only documented Pages `_headers` and CDN-Cache-Control behavior: explicit browser revalidation and CDN no-store for static responses. This is an experiment, not a verified fix or cache purge. The original ordinary deleted URL must return 404 after deployment before closing the blocker; no custom domain or hosting architecture change has been made.

Local experiment verification: `pnpm check` exited 0, including 28 tests and both builds; built Site `_headers` matches its source. Remote behavior is still pending.

### 2026-11-07 KST — documented header experiment rejected

- Maintainer requested continuation. Consulted official Pages custom-header and CDN-Cache-Control documentation, and tested `Cache-Control: public, max-age=0, must-revalidate` plus `CDN-Cache-Control: no-store`. Header policy checkpoint 07a9369 deployed successfully; current Home showed the policy. The originally cached deleted URL still returned old HTTP 200 despite its displayed headers being updated, so header appearance was not considered a fix.
- Added a hidden temporary Page through Git commit `d3d531d399e6627129af93e59c1b1ae6e527db9f` to isolate CDN behavior from authentication. Deployment `d9685334-d7c5-4102-aa16-119b93a87589` succeeded; unchanged ordinary URL `/projects/cache-policy-check/` returned revision one with no-store. This was a Git-authored cache test, not an additional claimed Admin UI write test.
- Updated via commit `c011292843be8f6bb5f81f313c0434056598be0b`; deployment `ba06a4f4-7126-477b-b536-cf594d4fd04d` succeeded and the same query-free URL showed revision two. Rolled back to revision one's deployment then restored revision two; the same ordinary URL showed the correct revision both times.
- Removed temporary Page via commit `c12eb88e6a091c6d7082d1a119b07bbf14673dd5` and detached CDN no-store from hashed assets as a documented path exception. Production deployment `fc252f32-a277-43a0-81e4-4935279111b0` succeeded, but the previously visited ordinary Page URL still returned HTTP 200, CF-Cache-Status HIT and Age (121 observed), despite no-store headers; the temporary Page no longer exists in the source. Thus deletion staleness also reproduces for a Page first created under the tested policy. The earlier possibility that only pre-policy test cache remained is rejected.
- The final source reverses the ineffective header experiment rather than claiming support or keeping an unproven cache policy. No new framework dependencies or runtime architecture changes were made. Both temporary Page source additions were removed.
- Local `pnpm check` passed after the path exception and test-page removal: format, lint, both typecheck families, 28 tests, independent builds and static output checks. Git hooks passed for each test checkpoint.
- Read-only zone discovery found `hyeongjongkim.dev` in this Cloudflare account. Proposed optional validation hostname is `astro-starter.hyeongjongkim.dev`; no custom hostname or DNS record has been changed. Requested maintainer choice between connecting that hostname and using supported Cloudflare pages.dev cache invalidation/support. The earlier optional acceptance of only historical cache is no longer applicable, and the user-facing question was corrected.

Current outcome: Task 05/phase remain BLOCKED on public deletion freshness. The supported header experiment did not resolve the blocker; further work needs the domain choice or supported CDN invalidation.

Final experiment cleanup verification: the official deployment GET API returned HTTP 404 for both obsolete temporary-page deployments d9685334 and ba06a4f4 after deletion. The final reverted source passed `pnpm check` (exit 0) on macOS with Node 22.23.4/pnpm 12.18.0: formatting, lint, type checks, 28 tests, Site/Admin builds and static Site verification. The existing Admin bundle-size warning remains.

### 2026-11-07 KST — approved custom-domain validation

Maintainer authorized both custom-domain validation and investigation of the pages.dev support path, including disconnection of an existing Pages domain if necessary. Actual zone is `hyeongjongkim.dev`; apex and www target existing `hyeongjongkim-dev.pages.dev`. Dashboard DNS inspection found only those two records, so no disconnection was necessary. Registered `astro-starter.hyeongjongkim.dev` with this Pages project and added its proxied CNAME to `astro-keystatic-starter-site.pages.dev` through authenticated dashboard. DNS verification became active; certificate validation was pending at this checkpoint. Production PUBLIC_SITE_URL updated to the approved custom origin; preview remains separate. A hidden Git-authored temporary Page will validate unchanged-URL updates, rollback and deletion after activation.

Authenticated support portal explicitly reports Free plans can open cases only for billing/account/registrar and routes Other topics to Community/AI/docs. Prepared [support reproduction draft](pages-cache-support.md); no ticket or community post submitted.

### 2026-11-07 KST — both requested routes investigated; deletion still blocked

Environment: macOS arm64, pinned Node 22.23.4/pnpm 12.18.0, authenticated Cloudflare dashboard in dedicated Chrome via Playwright, official Pages REST API with existing Wrangler credential, ordinary curl GET without query-busting for acceptance.

- Custom domain `astro-starter.hyeongjongkim.dev` is active: DNS and certificate validation both active. Existing apex and www CNAME records remain pointed to `hyeongjongkim-dev.pages.dev`; apex still returned HTTP 200. No existing Pages connection was removed. Production PUBLIC_SITE_URL is the new custom origin, preview retains its independent pages.dev origin.
- Hidden temporary Page checkpoint 0df9f642 deployed as 8451ec17-d931-4868-ac98-c1a40a41dd9e. Plain custom URL `/projects/domain-validation/` returned HTTP 200 with revision one and correct custom canonical. Update fd11b4f0 deployed as 51d7801a-7736-4b80-8bc4-0b9d45ff9a88; same URL showed revision two. Official rollback to 8451ec17 and restoration to 51d7801a each showed the correct revision on the unchanged URL.
- Removed Page in 597be97a49cd4b9aba7a9cbed1830d60ba11422a; deployment b7bef704-5712-42f4-b4c8-c7aab9879c56 succeeded and project canonical selection matched it. However the unchanged custom URL continued returning deleted revision-two HTML, HTTP 200, CF-Cache-Status DYNAMIC, increasing Age and `public, s-maxage=604800`. A diagnostic query returned 404/no-store. Chrome reload also showed the deleted title. Custom-domain attachment alone therefore does not close deletion freshness.
- Authenticated dashboard Custom Purge by exact URL did not resolve the ordinary custom URL. Followed official Pages Serving Pages guidance and applied zone Purge Everything; the response cache alone was cleared, without changing content or domain connections. Repeated once to capture explicit response evidence: dashboard request 434 POST `/zones/53fa3217f3d4c5509d4b85f46814fd86/purge_cache/` returned HTTP 200, success true, errors empty. Ordinary custom URL still returned deleted HTML with HTTP 200 afterward (Age 204, CF-Ray a5672540b958472e-SIN). This is a failed public validation despite an accepted purge, not proof of successful invalidation.
- Applied the documented account Bulk Redirect procedure for production `astro-keystatic-starter-site.pages.dev` to `https://astro-starter.hyeongjongkim.dev`: list `starter_production_domain`, ID 178c1e0ba68b427a852c92f15af194e6, one 301 entry, preserve query/subpath/path suffix enabled, include subdomains disabled to retain preview isolation. Old `/projects/publication-proof/` and `/projects/cache-policy-check/` plain URLs now return 301 to the matching custom paths; following the former ended at 404. Photography query preserved in Location. Preview Home still returned HTTP 200 rather than redirecting. This changes entry-point routing; it does not establish a general cache fix, since the new custom-domain test still fails deletion freshness.
- Support portal → Submit a case → Other explicitly states Free plans can open cases only for billing/account/registrar; technical issues route to Community/AI/docs. No technical support case was submitted and no paid plan was enabled. [Prepared reproducible support draft](pages-cache-support.md), including both hostnames and failed supported purge. Public Community posting requires maintainer's explicit external-message authorization; requested separately.
- Removed both temporary Page source revisions and deleted only obsolete containing deployments 8451ec17 and 51d7801a after checking current canonical/latest IDs. Current production, preview and clean rollback targets retained.
- `pnpm check` exited 0 during custom-domain validation: format, lint, types, 28 unit tests, Site/Admin builds and static artifact checks. Stage commit/push hooks also passed. Existing Admin bundle-size warning remains.

Current blocker: a previously visited, deleted Page still serves old HTML on its unchanged approved production URL after successful Git deployment and an accepted documented owned-zone purge. Do not mark Task 05 or initial implementation DONE. No unsupported proxy, cache-key query workaround, framework patch or architecture replacement was introduced.

Final cleanup check: after removing the obsolete validation deployments, the plain custom test URL still returned 200 (Age 304); both the custom Home and existing personal apex returned 200. Final `pnpm check` on the cleaned source exited 0 with 28 tests; `git diff --check` passed.

### 2026-11-07 KST — deployment history and DNS routing isolation

Investigating both deployment history and caches at maintainer request. Current deployment-specific hostname returns 404 for the deleted path; queried custom-host 404 has the same body hash. Both deleted historical deployment hosts also return 404. Canonical production selection is correct. No Cache Rules/Cache Response Rules/Page Rules exist; zone Workers routes are empty; Always Online is off. Detailed evidence is in [support investigation](pages-cache-support.md).

Official Debugging Pages recommends DNS Only comparison. Temporarily switched only starter CNAME from proxied to DNS Only and observed authoritative CNAME TTL 300. After local resolver addresses updated, ordinary URL plus curl IPv4/IPv6 all returned 404. Restored proxy for controlled comparison: the formerly selected proxied IPv6/SIN route still returned 200/DYNAMIC/Age2894; proxied IPv4/HKG returned404. Current Pages target IPs for both families return404/ICN. This demonstrates route/edge-dependent behavior, not proof of an IPv6 product defect or a complete internal root cause.

Reapplied the officially documented DNS Only setting to the starter subdomain for a new end-to-end static publication/update/rollback/deletion validation. Existing personal apex/www remain proxied and unchanged. Do not mark this DNS configuration as a verified fix until the unchanged new URL passes deletion after deployment.
