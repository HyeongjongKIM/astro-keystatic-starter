# Task 00 — Runtime Compatibility Gate

**Status:** DONE

**Depends on:** none  
**Read:** [Deployment](../../docs/deployment.md), [Architecture](../../docs/architecture.md)

**Current outcome:** deployed Workers OAuth and authenticated content/image CRUD verified on 2026-11-06. Local Workers dev remains affected by the recorded runner error; use the approved separate Node setup configuration for App provisioning. Historical BLOCKED entries below describe earlier checkpoints.

## Goal

Establish whether the current officially supported Astro + Keystatic integration can operate on Cloudflare Workers with GitHub Mode, including actual authenticated writes. No feature implementation before this gate is resolved.

## Work

- [x] Record supported Node, pnpm, Astro, `@astrojs/cloudflare`, `@keystatic/astro`, and `@keystatic/core` versions.
- [x] Create a disposable minimal Astro + Keystatic project using official integration steps.
- [x] Test the Cloudflare runtime locally with official tools.
- [x] Deploy an isolated Worker preview; configure exact GitHub App callback and least-privilege test repository access.
- [x] Verify editor rendering, OAuth login, content read, create, update, delete, image upload, and Git commit.
- [x] Identify incompatibilities using official docs/issues; do not patch private internals.
- [x] Record whether local and production results differ.

## Acceptance criteria

- A reproducible version matrix and commands are recorded.
- A deployed Worker preview completes authenticated read/write operations.
- All failures, workarounds requested but rejected, and remaining limitations are documented.
- If impossible on the official stack, set **BLOCKED** and request architecture direction; do not advance.

## Verification evidence

### 2026-11-06 — local compatibility probe

**Result: BLOCKED pending preview deployment and real GitHub App credentials.** This is not evidence that the current stack is incompatible. Task 01 must not begin until the deployed gate passes.

Environment: macOS x64; repository initially clean and documentation-only. Host tools were Node `22.13.0` and pnpm `9.15.3`. A disposable project was created at `/tmp/keystatic-runtime-4hiScB`; its source and lockfile are retained in [compatibility-probe](compatibility-probe/README.md). No production application or root workspace was initialized.

### Selected probe versions and official evidence

Versions were retrieved from the official npm registry's `/<package>/latest` JSON endpoints on 2026-11-06. They are probe selections, not a claim of authenticated Workers support.

| Package/tool        | Exact selected version | Published compatibility evidence                                                                                              |
| ------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Node                | 22.23.4                | Astro and React integration require Node `>=22.23.4`; actual probe command returned `v22.23.4`                                |
| pnpm                | 12.18.0                | Published engine `node >=18`; [pnpm installation compatibility](https://pnpm.io/installation) includes Node 22                |
| Astro               | 7.4.7                  | [Registry metadata](https://registry.npmjs.org/astro/7.4.7): Node `>=22.23.4`, pnpm `>=7.1.0`                                 |
| @astrojs/cloudflare | 14.4.6                 | [Registry metadata](https://registry.npmjs.org/@astrojs/cloudflare/14.4.6): Astro `^7.4.0`, Wrangler `^4.125.0`               |
| @keystatic/astro    | 6.0.0                  | [Registry metadata](https://registry.npmjs.org/@keystatic/astro/6.0.0): Astro `5                                              |     | 6   |     | 7`, React/React DOM 18 or 19 |
| @keystatic/core     | 0.6.9                  | [Registry metadata](https://registry.npmjs.org/@keystatic/core/0.6.9): React/React DOM 18 or 19; integration accepts core `*` |
| @astrojs/react      | 7.1.4                  | Published React 19 peer range and Node `>=22.23.4`                                                                            |
| @astrojs/markdoc    | 2.1.3                  | Published Astro `^7.4.0` peer range; official Keystatic installation example uses Markdoc                                     |
| react / react-dom   | 19.3.1                 | React DOM requires React `^19.3.1`                                                                                            |
| wrangler            | 4.158.0                | Published Node `>=22.0.0`; satisfies adapter peer range                                                                       |

The probe follows the [Keystatic Astro installation](https://keystatic.com/docs/installation-astro), [GitHub mode setup](https://keystatic.com/docs/github-mode), and [Cloudflare adapter manual installation](https://docs.astro.build/en/guides/integrations-guide/cloudflare/). The simple Markdoc collection is disposable test content, not the MVP Pages/Posts body schema.

### Commands and observed results

All commands below ran on 2026-11-06. Probe commands ran in the temporary directory using `npm exec --yes --package=node@22.23.4 --package=pnpm@12.18.0 --` before the listed Node/pnpm command, preserving host tool versions.

| Command/check                                                     | Observed result                                                                                                                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --porcelain=v1` before changes                        | Empty; no unrelated changes                                                                                                                                                |
| Python `urllib.request` GETs to official npm registry metadata    | Version and peer/engine matrix above retrieved successfully                                                                                                                |
| `node --version` through pinned npm exec                          | `v22.23.4`                                                                                                                                                                 |
| `pnpm install`                                                    | Dependencies downloaded; exit 1, `ERR_PNPM_IGNORED_BUILDS` for esbuild and two workerd versions                                                                            |
| Add exact `allowBuilds` entries; `pnpm install --frozen-lockfile` | Exit 0, pnpm 12.18.0; esbuild/workerd postinstall scripts completed. Uses [documented pnpm build settings](https://pnpm.io/settings/build#allowbuilds), no framework patch |
| `pnpm build`                                                      | Exit 0; Astro server build completed with Cloudflare adapter; client chunk-size warning (>500 kB)                                                                          |
| `pnpm preview --host 127.0.0.1`                                   | Started official local Cloudflare adapter preview at `http://127.0.0.1:4321`                                                                                               |
| Python `urllib.request.urlopen` for `/` and `/keystatic`          | HTTP 200, HTML, 65 and 5432 bytes respectively. HTTP shell only; browser rendering/interactions not verified                                                               |
| Python request for `/api/keystatic/github/login`                  | HTTP 500; preview logs explicitly report missing `clientId`, `clientSecret`, and `secret`                                                                                  |
| `pnpm exec astro preview logs`                                    | Confirmed requests and missing-configuration error; no removed `locals.runtime.env` error observed on this path                                                            |
| `pnpm exec wrangler whoami`                                       | Reports not authenticated; no account selected and no Worker deployed                                                                                                      |
| `gh auth status` on host                                          | Exit 1; stored GitHub CLI token invalid. CLI authentication alone would not replace Keystatic GitHub App credentials                                                       |
| `pnpm exec astro preview stop`                                    | Exit 0; preview process stopped                                                                                                                                            |
| `git diff --check` after documentation edits                      | Initial trailing whitespace corrected; final check passed                                                                                                                  |
| Root format/lint/typecheck/test/build                             | Not run: no root `package.json` or configured root checks yet; Task 01 owns those scripts                                                                                  |

The adapter automatically enabled `SESSION` KV and `IMAGES` bindings in the probe. This does not approve adding these services to the starter; their necessity/configuration must be resolved before accepting a deployment, respecting the no-database MVP. No resources were provisioned.

### Upstream findings and limitations

- [Issue #1554](https://github.com/Thinkmill/keystatic/issues/1554) described the removed Astro Cloudflare environment API; it is closed by [PR #1606](https://github.com/Thinkmill/keystatic/pull/1606). The [official integration changelog](https://github.com/Thinkmill/keystatic/blob/main/packages/astro/CHANGELOG.md) records the fix in 6.0.0. Do not treat this historical issue as proof that the selected version fails.
- [Discussion #1547](https://github.com/Thinkmill/keystatic/discussions/1547) and [issue #1497](https://github.com/Thinkmill/keystatic/issues/1497) report historical OAuth problems. They are risk references, not reproduction evidence for these selected versions.
- No private API patches, OAuth bypasses, alternative runtime architecture, or unofficial workarounds were introduced.
- Local smoke checks passed only as described above. Production/local differences, OAuth completion, authenticated reads, create/update/delete, image upload, and Git commits remain **untested**. The deployed acceptance criterion remains unmet.

### Exact blocker and resume requirements

1. Authenticate a Cloudflare account for an isolated preview Worker and identify the test repository (`owner/repo`).
2. Provision a GitHub App restricted to that repository with the documented permissions and exact preview OAuth callback; supply secrets through local ignored files / Cloudflare Secrets, never task evidence or chat.
3. Configure the public App slug before build, deploy the isolated preview, and record its non-secret URL. Resolve automatically generated bindings under the agreed architecture.
4. Perform browser-based editor/OAuth/read/create/update/delete/image/commit checks on the deployed preview and compare local behavior. Only then consider DONE and Task 01.

Maintainer direction requested: provide the test deployment/repository setup to continue the existing architecture, or explicitly choose an architecture change if that is preferred. No architecture change has been made.

### 2026-11-06 — deployment resumed

- GitHub CLI device authorization and Wrangler OAuth login completed successfully.
- Created private test repository: https://github.com/HyeongjongKIM/astro-keystatic-compatibility-test (initialized with a README). The temporary probe config now targets this repository; the committed template retains its placeholder.
- Disabled unused Astro sessions (`session: false`) and image transformations (`imageService: 'passthrough'`) through [documented adapter settings](https://docs.astro.build/en/guides/integrations-guide/cloudflare/). This removes the previously generated KV/Images bindings without private patches.
- Pinned-tool `pnpm build`: exit 0 after the configuration change; chunk-size warning remains. Generated Wrangler config has empty KV/R2/D1 bindings and no Images binding.
- Pinned-tool `pnpm exec wrangler deploy`: exit 0; deployed https://keystatic-workers-compatibility.jonkim0309.workers.dev with version `07f72d85-245b-4429-8c6c-f4063496f5a7`. Deployment reported only `ASSETS`. This initial deployment still uses the placeholder repository and has no GitHub App credentials.
- Python urllib HTTPS request initially returned HTTP 403; subsequent `curl` requests returned HTTP 200 for `/` (HEAD) and `/keystatic` (GET). Browser rendering and authentication remain unverified; the initial discrepancy is not diagnosed.
- Started official `pnpm dev --host 127.0.0.1` in the temporary probe; `/keystatic/setup` returned HTTP 200 and was opened in the user's browser. Requested GitHub App creation/installation via Keystatic's documented setup flow, restricted to the private test repository.
- **Remaining gate:** GitHub App creation/installation, secret provisioning, rebuilding against the actual test repository/App slug, and deployed authenticated E2E operations. Status remains BLOCKED while account-owner approval is pending.

### 2026-11-06 — local GitHub App setup failure

- User reported `ReferenceError: exports is not defined` at `workers/runner-worker/index.js:107:3` while visiting `/keystatic/setup`. Pinned-tool `pnpm exec astro dev logs` confirmed the same stack through Astro `dev-nonrunnable.js` and Cloudflare's dev handler. Initial HTTP 200 checks did not detect the browser/API failure and must not be treated as successful setup validation.
- [Keystatic issue #1554](https://github.com/Thinkmill/keystatic/issues/1554) includes a related report about CommonJS React dependencies in the Workers dev runner. Tested Vite's [documented `optimizeDeps.include`](https://vite.dev/config/dep-optimization-options#optimizedeps-include) with `react`, `react-dom`, `react/jsx-runtime`, `react-dom/server`, and `react-dom/server.edge` in the temporary probe only.
- Browser verification used cached Playwright with system Chrome (default bundled Chromium was unavailable). The setup form and Create GitHub App button became visible without a pageerror, but browser network events showed HTTP 500 for `/api/keystatic/github/refresh-token`. Direct requests to `/api/keystatic/github/created-app` and `/api/keystatic/github/refresh-token` also returned HTTP 500 with the same runner error. Therefore the configuration experiment did **not** establish a fix; it was reverted and was not added to the retained probe.
- Inspected the published `@keystatic/core@0.6.9` worker entry: its GitHub App creation handler explicitly returns that non-Node environments do not support GitHub App creation. This is a separate setup limitation; the runner error prevented this handler from being reached in the observed requests. No internal handlers were patched or invoked as a workaround.
- **Exact blocker:** the current local Workers API routes fail in the dev module runner; full root cause and a supported fix are unverified. GitHub App creation and deployed authenticated operations remain incomplete. Task 00 remains BLOCKED.
- **Proposal at the time of diagnosis:** provision the GitHub App using a documented Node-based setup or GitHub's [manual App registration](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app), then test the existing deployed Workers runtime separately. This does not demonstrate that the local Workers error is fixed and does not move Admin to Node hosting. Maintainer direction is needed before proceeding with a different setup workflow.
- No commit made: the user's instruction is to commit when this stage is complete; the compatibility gate has not completed.

### 2026-11-06 — approved provisioning workflow

- Maintainer approved Node-only GitHub App provisioning, followed by authentication/write validation on the existing Worker. Admin deployment remains Cloudflare Workers; the local Workers dev runner failure remains unresolved.
- Added a separate `astro.setup.config.mjs` with the official React, Markdoc and Keystatic integrations and no Cloudflare adapter. This configuration is only for the local provisioning server, never production deployment.
- Stopped the Workers dev server and ran pinned-tool `pnpm exec astro dev --config astro.setup.config.mjs --host 127.0.0.1 --port 4321` in the temporary probe. Node dev server started successfully. App creation/installation is still pending.
- Maintainer explicitly requested an intermediate commit of the current findings and plan before resuming provisioning. Task and phase status remain BLOCKED until deployed E2E validation passes.

### 2026-11-06 — App provisioning and credentialed deployment

- Node setup was verified with Playwright/system Chrome: Create GitHub App form visible and no browser pageerrors. User completed App creation and repository installation. Confirmed that the official setup generated all four expected environment keys in the ignored temporary `.env`; values were not printed or copied into tracked source.
- Pinned-tool `pnpm build` with the default Workers configuration and actual test repository/App slug: exit 0, existing chunk-size warning only.
- First `wrangler secret bulk` attempt failed because no Worker name was resolved after using the separate setup configuration. Retried with explicit `--name keystatic-workers-compatibility`; exit 0, three secrets registered. Secrets were passed via subprocess stdin, never shell arguments or tracked files.
- Pinned-tool `pnpm exec wrangler deploy`: exit 0; credentialed test deployment version `d3323fba-c7c8-445d-87d6-8802362134cb`, same isolated workers.dev URL, only ASSETS binding reported.
- Secret scan of all five files in `dist/client`: neither actual `KEYSTATIC_GITHUB_CLIENT_SECRET` nor `KEYSTATIC_SECRET` appeared.
- Node fetch smoke checks: deployed `/keystatic` HTTP 200; `/api/keystatic/github/login` HTTP 307 to GitHub's OAuth authorization endpoint. OAuth completion remains pending; redirects alone do not prove authentication.
- GitHub CLI installation-list request returned HTTP 403 because its OAuth token is not a GitHub App user token; public App metadata lookup was unavailable. No privilege bypass attempted. Installation scope must be confirmed through the App's authenticated flow/settings.
- Opened a separate Chrome test profile for user-controlled GitHub login. Browser test session data stays outside the repository; no credentials or cookies are included in evidence. Authenticated content E2E remains pending.

### 2026-11-06 — OAuth user confirmation

- User reported completing login in the regular Chrome profile. After closing only the earlier automated test-profile browser, AppleScript confirmed the regular Chrome active tab was at deployed `/keystatic/branch/main` (OAuth callback parameters were not printed). This is evidence of return to the editor route, not yet proof of authenticated reads/writes.
- Chrome refused AppleScript JavaScript execution because “Allow JavaScript from Apple Events” is disabled. The setting was not changed. Requested user-driven browser create/image/update checks and will independently inspect the resulting repository files and commits.
- No authenticated create/update/delete/image verification is claimed at this point. Task 00 remains BLOCKED until the remaining evidence is collected.

### 2026-11-06 — deployed authenticated E2E completed

**Result: DONE for the runtime gate.** The selected stack completed the required authenticated operations on the isolated deployed Worker; this does not claim that local Workers dev is fixed.

Environment: deployed version `d3323fba-c7c8-445d-87d6-8802362134cb`; Playwright from the existing local tooling cache with installed Chrome; user completed real GitHub OAuth in a dedicated test profile. Browser state was held privately outside the repository. After OAuth, fresh automated browser contexts reused that state for UI actions (no direct GitHub API writes substituted for editor operations).

| Operation                             | Observed evidence                                                                                                                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editor rendering / authenticated read | Dashboard displayed authenticated account, `main` branch and Posts collection with 0 entries; fresh entry visits loaded saved body and image                                                                                                                        |
| OAuth completion                      | Real GitHub login returned to deployed editor and established the Keystatic auth cookies; subsequent fresh contexts accessed authenticated content                                                                                                                  |
| Create / image upload                 | Browser Add → title `Compatibility Test`, body `Worker write test`, generated 8×8 PNG via Choose file → Create; UI reported Entry created                                                                                                                           |
| Git commit for creation               | [5859c13e5654](https://github.com/HyeongjongKIM/astro-keystatic-compatibility-test/commit/5859c13e5654a2546834b40508745c7c80807e2b) added `src/content/posts/compatibility-test.mdoc` and `public/images/compatibility-test/image.png`                              |
| Read image                            | Fresh browser context loaded saved editor image with `complete=true` and nonzero natural width; independent `gh api .../contents/...` read confirmed PNG signature                                                                                                  |
| Update                                | Fresh entry visit read original body; changed it to `Worker update test` and clicked Save. Independent repository content read confirmed updated text; commit prefix `4addba116191`                                                                                 |
| Read updated content                  | Another fresh browser context loaded `Worker update test` before deletion                                                                                                                                                                                           |
| Delete                                | Browser Delete entry → Yes, delete returned to Empty collection; commit prefix `93643cb32711`                                                                                                                                                                       |
| Delete cleanup                        | `gh api repos/HyeongjongKIM/astro-keystatic-compatibility-test/git/trees/main?recursive=1` returned only `README.md`; both entry and uploaded image removed                                                                                                         |
| App permissions / isolation           | Authenticated GitHub installation settings (`/settings/installations/179199323`) displayed metadata/pull requests read, code read/write, checked `install_target=selected`, and exactly one selected repository: `HyeongjongKIM/astro-keystatic-compatibility-test` |
| Exact callback                        | Authenticated App settings confirmed `https://keystatic-workers-compatibility.jonkim0309.workers.dev/api/keystatic/github/oauth/callback`; official setup also registered loopback callbacks with and without port 4321                                             |

Commands: temporary Node/Playwright drivers `create-entry.cjs`, `update-entry.cjs`, `delete-entry.cjs`, and installation/settings inspection; `gh api` read-only commit/content/tree checks. Driver locator corrections were needed (`Add` is a button, and deletion confirmation is `Yes, delete`); initial locator timeouts did not perform writes and were not product failures. Successful create/update/delete runs exited 0. Driver files and authenticated state are not retained in tracked source; reproduce using the browser sequence above and the pinned probe configuration.

Local/production comparison: local Workers dev API threw `exports is not defined`; an attempted documented dependency-optimization setting did not resolve it and was reverted. Node dev was used solely for approved App provisioning. Production Workers completed real OAuth and CRUD without that configuration or framework patches. The initial production probe without credentials returned a missing-configuration error; configured deployment passed.

Remaining limitations: local Workers dev is unresolved; no public Site/workspace functionality has been implemented, no production customer deployment is claimed, and the selected version matrix applies only to this isolated test. The private test repository and isolated Worker/App were subsequently deleted during the cleanup recorded below. No root quality scripts are configured yet; Task 01 owns those checks.

Final repository verification: `git diff --check` passed on 2026-11-06. Next task is Task 01 (workspace foundation); no dependent task was implemented in this run.

### 2026-11-06 — test resource cleanup requested; authentication pending

- Maintainer requested cleanup before Task 01. Runtime compatibility remains DONE; cleanup is not yet complete.
- `gh repo view HyeongjongKIM/astro-keystatic-compatibility-test --json name,url` confirmed the test repository still exists. `gh repo delete HyeongjongKIM/astro-keystatic-compatibility-test --yes` failed with HTTP 403 and an explicit requirement for the `delete_repo` scope. No repository deletion occurred.
- `npx --yes wrangler whoami` (Wrangler 4.158.0, macOS, Node 22.21.1) failed: the stored OAuth token expired and could not be refreshed. No Worker deletion occurred. Started interactive `wrangler login` and `gh auth refresh -h github.com -s delete_repo`; account-owner authentication is pending.
- No matching Keystatic/compatibility temporary directories were found directly under `/tmp` or `/private/tmp`; no test Astro server or dedicated Chrome test process was running. Recorded temporary credentials/browser state were not available at those paths. This does not establish that all other local locations are clean. Existing unrelated browser profiles and CLI account credentials were preserved.
- Remaining: delete and verify absence of the isolated Worker (including its secrets), test GitHub App/installation `179199323`, and test repository; inspect any remaining identifiable local test state. Retain tracked probe source and historical evidence. GitHub App deletion has not been verified or performed.

### 2026-11-06 — Worker and repository cleanup completed; App pending

- Both interactive authentication commands completed successfully after maintainer authorization.
- Using the renewed Wrangler OAuth credential privately in memory, Cloudflare's official REST API listed the exact `keystatic-workers-compatibility` script, accepted its DELETE with `success: true`, and a subsequent script list confirmed its absence. The Worker and its attached configuration/secrets were removed; no unrelated Workers were targeted.
- `gh repo delete HyeongjongKIM/astro-keystatic-compatibility-test --yes` completed successfully. A subsequent authenticated `gh api repos/HyeongjongKIM/astro-keystatic-compatibility-test` returned HTTP 404; `gh api user --jq .login` confirmed `HyeongjongKIM`.
- GitHub App/installation cleanup remains pending: the separate Playwright Chrome session navigated to installation `179199323` and was redirected to GitHub login. CLI OAuth authorization does not authenticate that browser, and `gh api user/installations` returned HTTP 403 requiring a GitHub App user access token. No authentication bypass attempted. Requested maintainer browser login to inspect/delete the test App and installation.
- Historical test URLs/commit links above now refer to deleted resources and are retained as original verification evidence. Runtime compatibility remains DONE; Task 01 has not started.

### 2026-11-06 — test App cleanup completed

- After maintainer browser login, inspected the registered `HyeongjongKIM Keystatic Test` App (`hyeongjongkim-keystatic-test`). Its homepage and deployed OAuth callback matched the exact isolated compatibility Worker URL, establishing the deletion target; unrelated Apps were preserved.
- Through GitHub's Advanced settings, clicked Delete GitHub App, entered its exact name and submitted the deletion confirmation. The browser returned to the App list, which no longer contained this App. Revisiting its settings URL returned HTTP 404 while authenticated.
- The authenticated Installed GitHub Apps list contained neither the test App nor installation `179199323`. The old installation URL had already returned HTTP 404 after login. App registration and test installation are no longer available.
- Closed the dedicated nonpersistent Playwright browser. `playwright-cli delete-data` reported no saved user data for the session. Removed the cleanup session's generated `.playwright-cli` snapshots/logs, including the App settings snapshot, from the workspace. Earlier recorded `/tmp` test directories were absent as noted above; unrelated profiles and general CLI logins were preserved.
- Cleanup outcome: the identified test Worker, repository and GitHub App/installation are removed. Tracked probe source and verification evidence remain. No application implementation or deployment was performed. `git diff --check` passed; root application checks remain unconfigured and were not run. Next task: Task 01, workspace foundation.

### 2026-11-06 — Task 01 tooling selections

Official npm registry metadata (`https://registry.npmjs.org/<package>/latest`, and full TypeScript metadata for the supported 6.0 line) was inspected before installation. Existing Astro/Keystatic/runtime selections above are retained. Additional exact selections:

- `@astrojs/check@0.9.12`
- `typescript@6.0.3`
- `eslint@10.14.0`
- `@eslint/js@10.0.1`
- `typescript-eslint@8.72.1`
- `eslint-plugin-astro@3.2.1`
- `eslint-config-prettier@10.1.8`
- `prettier@3.9.10`
- `prettier-plugin-astro@1.1.2`
- `husky@9.1.7`
- `lint-staged@17.6.0`
- `@commitlint/cli@21.2.4`
- `@commitlint/config-conventional@21.2.4`
- `vitest@5.1.0`
- `@types/node@26.6.6`
- `@types/react@19.3.0`
- `@types/react-dom@19.3.0`

TypeScript latest was 7.0.2, outside `@astrojs/check`'s declared `^5.0.0 || ^6.0.0` and `typescript-eslint`'s `>=4.8.4 <6.1.0` peers. Selected 6.0.3 satisfies both. ESLint 10 satisfies the Astro plugin and TypeScript ESLint peers; selected Node 22.23.4 satisfies the plugin's Node floor. Optional accessibility plugin peers were not enabled. Package versions are pinned; transitive resolution is recorded in the root lockfile. Installation and actual check outcomes belong to Task 01 evidence, not this metadata-based compatibility statement.

Official setup references consulted: [Astro installation](https://docs.astro.build/en/install-and-setup/), [Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), [Keystatic integration](https://keystatic.com/docs/installation-astro), [pnpm build permissions](https://pnpm.io/settings/build), [Astro ESLint](https://ota-meshi.github.io/eslint-plugin-astro/user-guide/), [Husky](https://typicode.github.io/husky/get-started.html), [lint-staged](https://github.com/lint-staged/lint-staged), [Commitlint](https://commitlint.js.org/guides/local-setup.html), and [Vitest](https://vitest.dev/guide/).

### 2026-11-06 — Task 02 dependency additions

- Official registry metadata selected `@astrojs/mdx@8.1.3`, declaring Astro `^7.2.10`; selected Astro 7.4.7 satisfies it. Added the official integration to the static Site only.
- Strict shared-package type checking exposed `@types/markdown-it@12.2.3` resolving its wildcard `@types/linkify-it` dependency to a version without the expected `LinkifyIt` namespace. This matches [upstream issue #111](https://github.com/markdown-it/linkify-it/issues/111). Official published `@types/linkify-it@3.0.5` declarations retain that namespace. Used pnpm's documented parent-specific [dependency override](https://github.com/pnpm/pnpm/blob/main/pnpm/docs/settings/dependency-resolution.md) to pin only `@types/markdown-it@12.2.3>@types/linkify-it` to 3.0.5. No runtime dependency, private framework code, or declaration file was patched; strict library checking remains enabled. Actual subsequent type checks passed.
