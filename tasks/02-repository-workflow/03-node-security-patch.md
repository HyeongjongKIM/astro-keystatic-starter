# Task 03 — Node 22 security patch

**Status:** IN_PROGRESS

**Depends on:** [Task 02](02-actions-runtime.md) DONE

## Scope

Maintainer explicitly requested the security patch after reviewing the November 2026 advisory. Update project Node from `22.23.4` to `22.23.5` across local tooling, root engine, Actions, Pages recovery configuration and current customer documentation. Preserve historical verification records, pnpm/dependency versions, Workers architecture and deployment protections. This maintenance task is selected before Phase 03 UI work.

## Work

- [x] Verify the official security release and framework engine compatibility.
- [x] Install and use Node 22.23.5 locally; update all active version pins and current guides.
- [x] Read, update and verify preview/production Pages NODE_VERSION without changing other settings.
- [x] Run frozen installation, full root checks, production Admin build, links, diff and workflow validation under Node 22.23.5.
- [ ] Verify preview push, protected PR and production builds/deployments use Node 22.23.5, then record results and synchronize branches.

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
