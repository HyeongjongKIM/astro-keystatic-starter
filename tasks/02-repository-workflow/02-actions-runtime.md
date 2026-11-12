# Task 02 — Actions runtime maintenance

**Status:** DONE

**Depends on:** [Task 01](01-ci-deployment.md) DONE

## Scope

Maintainer reported Node 20 deprecation annotations on 2026-11-12. Update the five JavaScript Actions to official Node 24 releases, preserving application Node/pnpm pins, workflow checks, credentials and deployment policy. This is a Phase 02 maintenance follow-up; Phase 03 is not selected.

## Work

- [x] Inspect official tagged metadata, documented inputs and breaking changes.
- [x] Update Actions and verify existing local checks and workflow syntax.
- [x] Verify preview push/PR and production runs, including artifact transfer, and inspect annotations for removal of Node 20 warnings.
- [x] Record results and synchronize branches through the protected PR path.

## Official version evidence

On 2026-11-12, GitHub REST reads of the latest official releases and their tagged `action.yml` files confirmed `runs.using: node24` for all five Actions:

| Action            | Selected release                                                   | Compatibility reviewed                                                                                                           |
| ----------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| checkout          | [v7.0.1](https://github.com/actions/checkout/tree/v7.0.1)          | Existing fetch-depth/persist-credentials inputs supported; new unsafe-fork protections concern events this workflow does not use |
| setup-node        | [v7.1.0](https://github.com/actions/setup-node/tree/v7.1.0)        | Explicit Node version and pnpm cache inputs supported; no registry-url, always-auth or dummy NODE_AUTH_TOKEN dependency          |
| pnpm/action-setup | [v6.1.1](https://github.com/pnpm/action-setup/tree/v6.1.1)         | Officially supports pnpm 12; version input preserved; own store caching defaults false                                           |
| upload-artifact   | [v7.0.2](https://github.com/actions/upload-artifact/tree/v7.0.2)   | Existing named archive upload, path and retention inputs supported                                                               |
| download-artifact | [v8.0.2](https://github.com/actions/download-artifact/tree/v8.0.2) | Existing named artifact extraction and path inputs supported                                                                     |

Use exact release tags for reproducibility. Node 24 Actions require hosted runner support (documented minimum v2.327.1 for the Node 24 migration); actual hosted runner execution remains part of verification. Application Node stays `22.23.4` and pnpm stays `12.18.0`. No framework/dependency upgrade or new regression test is needed for this release-only change; existing behavior tests and real workflow runs cover the integration.

## Verification evidence

Pending local and remote verification. Historical annotations in Task 01 remain accurate for the old runs; this task records their resolution in new runs. GitHub's separate ubuntu-latest image-migration notices are distinct from the Node 20 warnings.

2026-11-12, Darwin x86_64, Node 22.23.4/pnpm 12.18.0: `pnpm check` passed format, lint, all shared/app types, 70 tests, Site/preview Admin builds and static-output checks. `pnpm build:admin:production`, `node scripts/ci/run.mjs docs` (116 tracked local links before staging the new task), `git diff --check`, and actionlint 1.7.12 with `-shellcheck=` exited 0. Existing Admin bundle-size warnings remain unrelated to Action runtime deprecation.

2026-11-12 remote verification:

- Preview push [43154783183](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43154783183), source `0ab63fcfa5d9e7b96170d958e503ff97bd13d43e`: all six jobs passed, including Site artifact upload/download and both preview deployments. The hosted runner reports version `2.338.2`, above the documented minimum.
- [PR 5](https://github.com/HyeongjongKIM/astro-keystatic-starter/pull/5) validation [43154831160](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43154831160): all required checks passed; deployments skipped. Merged using the protected merge-commit path.
- Production push [43155110651](https://github.com/HyeongjongKIM/astro-keystatic-starter/actions/runs/43155110651), source `68c4c9942f42d269e16ff11a728b991b652e5cac`: all six jobs passed, including artifact transfer and both production deployments. Synchronized `dev` to that merge commit without force.
- Read every job's check-run annotations through GitHub's REST API on all three runs: zero warning annotations, including zero Node 20 deprecation messages. Only the independent ubuntu-latest → Ubuntu 26 image-migration notices remain. Historical annotations on old run `beb7c56` are unchanged historical records.

The maintainer then requested assessment of the separate [November 2026 Node security advisory](https://nodejs.org/en/blog/vulnerability/november-2026-security-releases). Current application/local Node `22.23.4` predates the official `22.23.5` security release. Updating Actions' Node 24 runtime does not apply that application Node patch, and `using: node24` alone does not establish the embedded Node patch version. The assessment recommends a separate 22.23.5 project/toolchain patch; it is not implemented or claimed resolved by this Actions-only maintenance task. Site remains static and Admin runs on Workers; no production Node HTTP/2 server is introduced.

Task 02 is DONE. This completion evidence is promoted as documentation through the same required-check PR path. Existing bundle warnings, accepted CACHE-01 freshness behavior and the separately reported project Node security-patch recommendation remain distinct from the resolved Action-runtime warning.
