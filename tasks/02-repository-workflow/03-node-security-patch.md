# Task 03 — Node 22 security patch

**Status:** DONE

**Depends on:** [Task 02](02-actions-runtime.md) DONE

## Scope

Maintainer explicitly requested the security patch after reviewing the November 2026 advisory. Update project Node from `22.23.4` to `22.23.5` across local tooling, root engine, Actions, Pages recovery configuration and current customer documentation. Preserve historical verification records, pnpm/dependency versions, Workers architecture and deployment protections. This maintenance task is selected before Phase 03 UI work.

## Work

- [x] Verify the official security release and framework engine compatibility.
- [x] Install and use Node 22.23.5 locally; update all active version pins and current guides.
- [x] Read, update and verify preview/production Pages NODE_VERSION without changing other settings.
- [x] Run frozen installation, full root checks, production Admin build, links, diff and workflow validation under Node 22.23.5.
- [x] Verify preview push, protected PR and production builds/deployments use Node 22.23.5, then record results and synchronize branches.

## Official evidence

- [November 2026 advisory](https://nodejs.org/en/blog/vulnerability/november-2026-security-releases) and [Node 22.23.5 release](https://nodejs.org/en/blog/release/v22.23.5): released 2026-11-11 as the 22.x security update. Local analysis previously identified the existing 22.23.4 pin as needing this patch.
- Official npm registry metadata read on 2026-11-12: [Astro 7.4.7](https://registry.npmjs.org/astro/7.4.7) and [React integration 7.1.4](https://registry.npmjs.org/@astrojs/react/7.1.4) both specify Node `>=22.23.4`, satisfied by 22.23.5. [Cloudflare integration 14.4.6](https://registry.npmjs.org/@astrojs/cloudflare/14.4.6) retains Astro `^7.4.0` and Wrangler `^4.125.0` peer requirements; no dependency upgrade is needed.
- Project Node is distinct from the Node 24 JavaScript Action host runtime. Action/runtime implementation upgrades are owned by GitHub; changing node-version installs the patched project runtime for build/test commands.

## Verification evidence

2026-11-12 initial inspection: clean working tree on synchronized `dev`/`main` at `161b20e6a87382e4cc38205db2e9c98e0fa433ab`, Darwin x86_64, installed Node `v22.23.4` through nvm, pnpm `12.18.0`. Active pins were found in `.nvmrc`, root `package.json`, both Actions configuration files, Pages template, README and customer guide. Historical tasks/probe evidence is retained.

2026-11-12 local verification on Darwin x86_64:

- `nvm install 22.23.5` fetched the official darwin-x64 archive and reported matching SHA256 checksums. Installed pnpm `12.18.0` for that nvm Node version. `nvm use` against the updated `.nvmrc`, `node --version`, and `pnpm --version` returned `v22.23.5` and `12.18.0`. Other Node installations were retained; project commands explicitly selected the patched runtime.
- Under that runtime, `pnpm install --frozen-lockfile` exited 0 with an unchanged lockfile. `pnpm check` exited 0: format/lint, shared/app types (zero diagnostics), all 70 tests, Site/preview Admin builds and static-output verification passed. `pnpm build:admin:production`, Markdown link validation (119 tracked links before staging the new task) and `git diff --check` also passed. Existing Admin chunk-size warnings remain; nvm's host locale warnings did not prevent checksum validation or installation.
- actionlint 1.7.12 with `-shellcheck=` exited 0. A read-only scan of 15 active tooling/current documentation files found no remaining 22.23.4 pin; historical task/probe records retain their original versions.
- Used the existing authenticated Cloudflare session to verify this repository's Pages project `astro-keystatic-starter-site`, then patched preview/production `NODE_VERSION` from 22.23.4 to 22.23.5. Readback matched 22.23.5 in both environments; assertions confirmed every other environment value, source setting, build setting, production branch and domain was preserved. Worker authentication secrets and GitHub deployment environments were not changed.

Remote CI/deployment verification and protected promotion are pending. The security patch changes the Node binary used by local and CI tooling; it does not claim to change GitHub-managed Action-host patch versions or the Cloudflare Workers runtime implementation.

2026-11-12 preview and PR verification:

- Security patch commit `5a8f24f2c4a0cfb2631aae1eedd45730d4397ab5`, preview run [43156827433](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43156827433): all six jobs passed. Every setup-node job log reported `node: v22.23.5`, including classification/tests, Site/Admin validation, required gate, and both deployment jobs. Frozen installation, 70 tests, types, builds, Site artifact transfer and both deployments succeeded.
- Preview Site deployment [25c92cdf](https://25c92cdf.astro-keystatic-starter-site.pages.dev) succeeded; preview Worker version `7ee0ac4e-5091-4d35-8e71-38d9a1e88237` deployed successfully. Browser HTTP checks returned 200 for both the dev Site origin and preview Admin editor shell.
- [PR 7](https://github.com/HyeongjongKIM/astro-keystatic-starter/pull/7) merge-result run [43156910051](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43156910051) passed all required checks and skipped both PR deployments. Merged normally to `63761da26e9e7fea84b72f73e095a805f6612096` through the existing rules, then fast-forwarded dev to that merge commit without force.
- Production run [43157135344](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43157135344) is pending at this checkpoint; no production success is claimed yet.

2026-11-12 production verification and completion:

- Production run [43157135344](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43157135344), source `63761da26e9e7fea84b72f73e095a805f6612096`: all six jobs passed. Downloaded full run logs and confirmed all six setup-node environments reported `node: v22.23.5`. Site artifact transfer and both production deployments succeeded after the required gate.
- Production Site deployment [6cdac6cd](https://6cdac6cd.astro-keystatic-starter-site.pages.dev) and Worker version `20cd4988-0df7-4938-8d38-fe11f62a827c` succeeded. Browser HTTP checks returned 200 for the production Site custom domain and Admin editor shell. No authentication/write implementation or Worker runtime settings changed; the earlier deployed OAuth/CRUD evidence remains in Task 01 rather than being claimed as a new CRUD test here.
- Both active repository version pins and the live Pages preview/production recovery environment settings now select 22.23.5. pnpm 12.18.0 and dependency/lockfile versions remain unchanged. Official support evidence was appended to Phase 01 Task 00 while preserving its historical probe matrix.
- Task 03 is DONE. Completion evidence and task/phase statuses are promoted through the normal documentation-only PR/check path, then main/dev are synchronized. No new application behavior tests were added for this patch-only version update; existing 70 tests and real builds/deployments passed.

Usage: new shells should run `nvm use` in the repository to activate the installed 22.23.5 runtime. nvm selection is per-shell; this task does not rewrite unrelated global shell defaults or remove older rollback installations. The existing Admin bundle-size warning and accepted CACHE-01 behavior remain unchanged. GitHub-managed Node 24 Action-host patch versions and Cloudflare's runtime implementation remain provider-managed, separate from the patched project Node toolchain.
