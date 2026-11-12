# Task 04 — Action Pinning and Update Automation

**Status:** TODO

**Depends on:** [Task 03](03-admin-artifacts.md) DONE

**Read:** [Architecture](../../docs/architecture.md), [Content model](../../docs/content-model.md), [Repository workflow](../../docs/repository-workflow.md), [Deployment](../../docs/deployment.md), [Tooling](../../docs/tooling.md)

## Goal

Make Action dependency references reproducible and route supported automated updates through validated development PRs.

## Work

- [ ] Inventory all direct Actions in workflows and local composites, inspect official release metadata and current support/runner requirements, and resolve full commit SHAs from the official repositories. Record human-readable release versions beside pins and their verification evidence.
- [ ] Configure officially supported Dependabot github-actions updates with an agreed schedule, grouping and PR limit. Include local composite discovery where supported and verify actual generated update behavior rather than assuming it.
- [ ] Route updates to the approved development target. Ensure those transient bot-branch PRs receive required validation: current main-only pull_request triggers must not leave dev-targeted updates unchecked. Bot PRs receive no deployment credentials or deployment permission.
- [ ] Configure supported generated commit/PR naming to pass the repository's Conventional Commit scope rules; do not disable validation for all bots or silently allow an otherwise forbidden deps scope.
- [ ] Preserve required checks, deployment branch restrictions and manual review/merge policy. Do not enable automatic merges or widen tokens/App permissions merely to make update PRs work.
- [ ] Document verification/rollback for Action major updates and a separate Node/pnpm security-maintenance process. github-actions updates do not imply automatic patching of project Node pins or GitHub-managed host runtimes.
- [ ] Run local/workflow checks and inspect a real or controlled supported update PR, including check conclusions, pin/version matching, and credential/deployment skips. Record any unavailable service-trigger verification precisely.

## Acceptance criteria

Action pins resolve to verified official commits and remain maintainable through the chosen update mechanism. Update PRs reach the intended development branch with valid messages and applicable checks, without production writes or deployment secrets. No claim is made that Action automation patches unrelated runtime/package versions.

## Verification plan

Validate workflow and Dependabot syntax against current official documentation. Run applicable root checks, verify pinned references and exercise update-PR validation. Record generated PR/check URLs or the exact external verification blocker; inspect annotations and deployment skips before completion.

## Official references to consult before implementation

- [Secure Action references](https://docs.github.com/en/actions/reference/security/secure-use)
- [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)

## Verification evidence

2026-11-12: Planning only. Work, acceptance checks and deployment/service validation have not been performed. Status remains TODO.
