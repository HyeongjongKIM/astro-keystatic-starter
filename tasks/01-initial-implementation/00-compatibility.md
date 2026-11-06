# Task 00 — Runtime Compatibility Gate

**Status:** BLOCKED

**Depends on:** none  
**Read:** [Deployment](../../docs/deployment.md), [Architecture](../../docs/architecture.md)

## Goal

Establish whether the current officially supported Astro + Keystatic integration can operate on Cloudflare Workers with GitHub Mode, including actual authenticated writes. No feature implementation before this gate is resolved.

## Work

- [x] Record supported Node, pnpm, Astro, `@astrojs/cloudflare`, `@keystatic/astro`, and `@keystatic/core` versions.
- [x] Create a disposable minimal Astro + Keystatic project using official integration steps.
- [x] Test the Cloudflare runtime locally with official tools.
- [ ] Deploy an isolated Worker preview; configure exact GitHub App callback and least-privilege test repository access.
- [ ] Verify editor rendering, OAuth login, content read, create, update, delete, image upload, and Git commit.
- [x] Identify incompatibilities using official docs/issues; do not patch private internals.
- [ ] Record whether local and production results differ.

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

| Package/tool | Exact selected version | Published compatibility evidence |
| --- | --- | --- |
| Node | 22.23.4 | Astro and React integration require Node `>=22.23.4`; actual probe command returned `v22.23.4` |
| pnpm | 12.18.0 | Published engine `node >=18`; [pnpm installation compatibility](https://pnpm.io/installation) includes Node 22 |
| Astro | 7.4.7 | [Registry metadata](https://registry.npmjs.org/astro/7.4.7): Node `>=22.23.4`, pnpm `>=7.1.0` |
| @astrojs/cloudflare | 14.4.6 | [Registry metadata](https://registry.npmjs.org/@astrojs/cloudflare/14.4.6): Astro `^7.4.0`, Wrangler `^4.125.0` |
| @keystatic/astro | 6.0.0 | [Registry metadata](https://registry.npmjs.org/@keystatic/astro/6.0.0): Astro `5 || 6 || 7`, React/React DOM 18 or 19 |
| @keystatic/core | 0.6.9 | [Registry metadata](https://registry.npmjs.org/@keystatic/core/0.6.9): React/React DOM 18 or 19; integration accepts core `*` |
| @astrojs/react | 7.1.4 | Published React 19 peer range and Node `>=22.23.4` |
| @astrojs/markdoc | 2.1.3 | Published Astro `^7.4.0` peer range; official Keystatic installation example uses Markdoc |
| react / react-dom | 19.3.1 | React DOM requires React `^19.3.1` |
| wrangler | 4.158.0 | Published Node `>=22.0.0`; satisfies adapter peer range |

The probe follows the [Keystatic Astro installation](https://keystatic.com/docs/installation-astro), [GitHub mode setup](https://keystatic.com/docs/github-mode), and [Cloudflare adapter manual installation](https://docs.astro.build/en/guides/integrations-guide/cloudflare/). The simple Markdoc collection is disposable test content, not the MVP Pages/Posts body schema.

### Commands and observed results

All commands below ran on 2026-11-06. Probe commands ran in the temporary directory using `npm exec --yes --package=node@22.23.4 --package=pnpm@12.18.0 --` before the listed Node/pnpm command, preserving host tool versions.

| Command/check | Observed result |
| --- | --- |
| `git status --porcelain=v1` before changes | Empty; no unrelated changes |
| Python `urllib.request` GETs to official npm registry metadata | Version and peer/engine matrix above retrieved successfully |
| `node --version` through pinned npm exec | `v22.23.4` |
| `pnpm install` | Dependencies downloaded; exit 1, `ERR_PNPM_IGNORED_BUILDS` for esbuild and two workerd versions |
| Add exact `allowBuilds` entries; `pnpm install --frozen-lockfile` | Exit 0, pnpm 12.18.0; esbuild/workerd postinstall scripts completed. Uses [documented pnpm build settings](https://pnpm.io/settings/build#allowbuilds), no framework patch |
| `pnpm build` | Exit 0; Astro server build completed with Cloudflare adapter; client chunk-size warning (>500 kB) |
| `pnpm preview --host 127.0.0.1` | Started official local Cloudflare adapter preview at `http://127.0.0.1:4321` |
| Python `urllib.request.urlopen` for `/` and `/keystatic` | HTTP 200, HTML, 65 and 5432 bytes respectively. HTTP shell only; browser rendering/interactions not verified |
| Python request for `/api/keystatic/github/login` | HTTP 500; preview logs explicitly report missing `clientId`, `clientSecret`, and `secret` |
| `pnpm exec astro preview logs` | Confirmed requests and missing-configuration error; no removed `locals.runtime.env` error observed on this path |
| `pnpm exec wrangler whoami` | Reports not authenticated; no account selected and no Worker deployed |
| `gh auth status` on host | Exit 1; stored GitHub CLI token invalid. CLI authentication alone would not replace Keystatic GitHub App credentials |
| `pnpm exec astro preview stop` | Exit 0; preview process stopped |
| `git diff --check` after documentation edits | Initial trailing whitespace corrected; final check passed |
| Root format/lint/typecheck/test/build | Not run: no root `package.json` or configured root checks yet; Task 01 owns those scripts |

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
