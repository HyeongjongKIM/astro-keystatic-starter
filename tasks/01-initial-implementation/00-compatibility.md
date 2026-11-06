# Task 00 — Runtime Compatibility Gate

**Status:** TODO  
**Depends on:** none  
**Read:** [Deployment](../../docs/deployment.md), [Architecture](../../docs/architecture.md)

## Goal

Establish whether the current officially supported Astro + Keystatic integration can operate on Cloudflare Workers with GitHub Mode, including actual authenticated writes. No feature implementation before this gate is resolved.

## Work

- [ ] Record supported Node, pnpm, Astro, `@astrojs/cloudflare`, `@keystatic/astro`, and `@keystatic/core` versions.
- [ ] Create a disposable minimal Astro + Keystatic project using official integration steps.
- [ ] Test the Cloudflare runtime locally with official tools.
- [ ] Deploy an isolated Worker preview; configure exact GitHub App callback and least-privilege test repository access.
- [ ] Verify editor rendering, OAuth login, content read, create, update, delete, image upload, and Git commit.
- [ ] Identify incompatibilities using official docs/issues; do not patch private internals.
- [ ] Record whether local and production results differ.

## Acceptance criteria

- A reproducible version matrix and commands are recorded.
- A deployed Worker preview completes authenticated read/write operations.
- All failures, workarounds requested but rejected, and remaining limitations are documented.
- If impossible on the official stack, set **BLOCKED** and request architecture direction; do not advance.

## Verification evidence

_Pending: date, versions, environment, commands, observed results, non-secret URLs/log summaries._
