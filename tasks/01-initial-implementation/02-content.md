# Task 02 — Shared Content System

**Status:** DONE

**Depends on:** Task 01 DONE  
**Read:** [Content model](../../docs/content-model.md), [Architecture](../../docs/architecture.md)

## Goal

Create Keystatic Pages, Posts, and Site Settings with schema sharing and a minimal extensible Blocks body.

## Work

- [x] Implement one shared schema and type inference entrypoint.
- [x] Add nested Pages Collection with title, slug, description, order, showInNavigation, content.
- [x] Add Posts Collection with publishedDate and draft/published status.
- [x] Add Site Settings Singleton with title, description, logo, SEO defaults.
- [x] Use `fields.blocks()` containing only an MDX rich-text block in both collections.
- [x] Validate GitHub pathPrefix, storage paths, image directories, and Astro content reading.
- [x] Add fixtures and tests for serialization, content validation, and images.

## Acceptance criteria

- Admin CRUD writes files exactly where Site build expects them.
- Sample MDX body and image render correctly in the Site build.
- No duplicated schema definitions or extra block types.
- Draft posts can be filtered reliably.

## Verification evidence

### 2026-11-06 — implementation checkpoint; deployed validation pending

Environment: macOS arm64, Node 22.23.4/pnpm 12.18.0 via pinned `npm exec`. Official Blocks, MDX, nested wildcard, content organization, Reader API and Astro MDX/config-import documentation consulted. Root was clean at start, following foundation commit 57c9a2f.

- `pnpm install`: passed; pinned MDX integration and root lockfile updated. Type dependency resolution rationale is recorded in Task 00.
- Initial strict shared-package check failed on incompatible transitive markdown-it/linkify-it declarations; parent-specific type dependency pin resolved it. A subsequent missing Node test typing error was fixed by declaring the test's Node types/dependencies.
- Initial Site build located content relative to a bundled module and failed to find Home. Switched to documented `root` from `astro:config/server`, then derived the repository root, which works across prerender bundling.
- `pnpm check`: exit 0 after fixes: format, ESLint, shared `tsc`, both Astro checks (zero errors/warnings/hints), 4 Vitest tests, static Site and Workers Admin builds. Existing Admin chunk-size warning remains.
- Tests read nested `projects/photography`, linked MDX rich text, image URLs/PNG signatures, settings and published/draft fixtures; public schema fields round-trip metadata; invalid status is rejected by Reader API.
- Python inspection of `apps/site/dist/index.html`: `<strong>Keystatic</strong>` and `/images/pages/home/sample.png` present; matching built image exists.
- Paths and `pathPrefix` decision documented in `docs/content-model.md`; fixtures are Reader-validated, but actual new-schema Admin writes are not yet claimed.
- Started approved Node-only provisioning configuration and opened `/keystatic/setup` in dedicated Chrome; prepared deployed preview URL and requested account-owner GitHub App creation/installation for this repository only. No credentials committed. Runtime deployment and actual UI CRUD/image validation remain pending; Task 03 must not start yet.

### 2026-11-06 — preview deployment and browser validation checkpoint

- Implementation checkpoint committed as `fbe5acf` and pushed to `origin/main`, including cleanup/foundation history. Pre-commit/commit-msg hooks passed; pre-push typecheck and all 4 tests passed.
- `pnpm install --frozen-lockfile`: exit 0 after final dependency changes.
- `pnpm --filter @starter/admin exec wrangler deploy`: exit 0 with official generated config; preview Worker `astro-keystatic-starter-admin-preview`, version `8872b224-42e8-4be5-8df3-22e5806da00a`, URL `https://astro-keystatic-starter-admin-preview.jonkim0309.workers.dev`. Deployment reported only ASSETS; no KV/R2/D1/Images bindings were provisioned. This deployment has no GitHub App credentials yet.
- Python urllib preview request returned HTTP 403; `curl` for `/keystatic` returned HTTP 200. As in the earlier probe, the client-dependent discrepancy is undiagnosed; a shell response is not OAuth/write evidence.
- Official Site `astro preview` on port 4323 plus Playwright/system Chrome: rendered `strong` text was `Keystatic`; sample image had alt `Starter sample`, `complete=true`, natural dimensions 8×8. Closed the Site tab and stopped preview through `astro preview stop`.
- GitHub Actions run `42228796905` on fbe5acf completed with `conclusion: success`, confirmed via `gh run view 42228796905 --json status,conclusion`. This verifies the configured frozen install and root checks on the Linux runner.

**Exact blocker:** account-owner browser login and new GitHub App creation/installation are required to obtain the documented credentials and perform deployed UI writes. Dedicated Chrome remains at GitHub login after the official setup form submission. Requested App name `Astro Keystatic Starter Admin Preview` and installation restricted to `HyeongjongKIM/astro-keystatic-starter`. Node-only provisioning server remains at `http://127.0.0.1:4321`; no local auth file values are included in tracked evidence.

After creation/installation: provision Worker secrets privately, rebuild with the public App slug, complete real OAuth and create/read/update/delete/image checks, inspect the resulting repository files/commits, pull those commits and validate Site reading/rendering against actual serialized output. Only then mark Task 02 DONE and begin Task 03. No architecture change is proposed.

### 2026-11-06 — deployed new-schema E2E passed

- Maintainer completed GitHub browser login. Login had discarded the original manifest POST, so resubmitted through official Keystatic setup. Initial requested App name exceeded GitHub's 34-character limit; registered `Astro Keystatic Admin Preview` (`astro-keystatic-admin-preview`) instead. Setup wrote credentials to ignored `apps/admin/.env`; a repeated callback displayed an already-configured notice after the first callback successfully generated credentials.
- Installed App using Only select repositories, selecting exactly `HyeongjongKIM/astro-keystatic-starter`; authenticated installation settings `179277601` confirmed metadata/pull requests read and code read/write. App settings confirmed exact deployed callback `https://astro-keystatic-starter-admin-preview.jonkim0309.workers.dev/api/keystatic/github/oauth/callback` (plus official local provisioning callbacks).
- Private Python subprocess stdin to `wrangler secret bulk --name astro-keystatic-starter-admin-preview`: exit 0, three runtime secrets registered. No values in command arguments or tracked files. Rebuilt and redeployed through default Workers config.
- Actual deployed OAuth succeeded but initially opened Repo not found for `customer/replace-me`: ordinary non-PUBLIC `import.meta.env.KEYSTATIC_GITHUB_REPO` was missing from the client bundle. Fixed using Astro's documented `env.schema` with `context: client`, `access: public`, imported from `astro:env/client`. Shared environment schema is used by default Workers and provisioning configs. Repository identity is public; auth credentials are still runtime secrets.
- Final tested Worker version `227f95c6-a0f7-4c1f-b2ce-0c866659b496`; only ASSETS binding. Client artifact inspection confirmed actual repo present and actual client secret/KEYSTATIC_SECRET absent. Browser loaded authenticated Pages with `home`, `projects`, `projects/photography`.
- Browser Add Page → title `Content E2E`, slug `projects/content-e2e` → Add Rich text → body `Deployed MDX block write test` → Image file chooser with 8×8 PNG → Add → Create. GitHub commit `1ab462c318fc8032bbe7805acd09e718a91cc24b` contained expected `content/pages/projects/content-e2e/index.yaml`, `content/0/value/body.mdx` and `apps/site/public/images/pages/projects/content-e2e/sample.png`. Public image URL was `/images/pages/projects/content-e2e/sample.png`. No pathPrefix was applied.
- Reloaded saved entry, opened Rich text: body loaded and image `complete=true`, natural dimensions 8×8. Updated Description to `Deployed update verified` and clicked Save; independent commit read confirmed `685ebaddd37d2efcf6142dbd5e63b330f29304b8`.
- Pulled actual UI-generated commits while preserving local environment fix. Temporarily pointed the existing Home renderer at the saved E2E Page, ran `pnpm --filter @starter/site build`, and asserted actual MDX text, image URL and copied image file. All passed; restored source immediately in `finally`. No temporary public route was added.
- Browser Delete entry → Yes, delete produced commit `da7120547b49f5fbe02e5fcc92a268ddb75e4b8d`. Independent recursive GitHub tree read found zero paths containing `content-e2e`; pulled deletion, retaining no test content/image. Original samples preserved. Provisioning server stopped after credentials were installed.

The authenticated UI tests validate the shared Blocks/MDX serializer and repository-relative image paths on Workers, in addition to local fixture/type/unit/build checks. No private internals, direct API writes substituting for UI, or runtime architecture changes were used.

Final verification after deployed fixes and test cleanup: `pnpm check` exited 0 (format, lint, types, 4 tests, both builds); `git diff --check` passed on 2026-11-06. Known local Workers dev and client chunk-size limitations remain as recorded. Next task: Task 03, nested routes and automatic navigation.
