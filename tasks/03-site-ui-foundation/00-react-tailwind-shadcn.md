# Task 00 — React, Tailwind CSS, and shadcn/ui

**Status:** TODO

**Depends on:** [Phase 02 — Repository workflow](../02-repository-workflow/README.md) DONE  
**Read:** [Architecture](../../docs/architecture.md), [Tooling](../../docs/tooling.md), [Content model](../../docs/content-model.md)

## Goal

Establish a reusable UI foundation in `apps/site` using official Astro React and Tailwind integrations and shadcn/ui. Preserve the current appearance, content behavior, and static Astro architecture; hydrate React components only where browser interaction is needed.

## Work

- [ ] Verify current official compatibility with the repository's pinned Astro, Vite, TypeScript, Node, and pnpm versions before installation. Select exact dependency and CLI versions, record official support evidence here and in [the dependency compatibility record](../01-initial-implementation/00-compatibility.md) without replacing historical results. Stop and report unresolved support rather than inferring it from compilation.
- [ ] Add the official Astro React integration and required React dependencies to Site; configure JSX and TypeScript as documented.
- [ ] Add Tailwind CSS through the official Vite integration and load its styles from the Site layout. Check reset effects on existing elements and MDX content.
- [ ] Configure Site-local shadcn/ui (`components.json`, `src/components/ui`, and required utilities). Set up `@/*` consistently while preserving the existing `@assets/*` alias. Select only the dependencies required by the chosen components.
- [ ] Connect existing branding variables and shadcn theme tokens so customer colors and fonts have one clear source. Preserve existing typography and `.prose` behavior; consider the official typography plugin only if replacing the current body styles is necessary, with the decision recorded.
- [ ] Add compatible React, React Hooks, and JSX accessibility lint configuration scoped to relevant files. Revisit the previously discussed leaked-render and accessibility rules; retain existing type-aware safety rules and verify TSX parsing and project-service coverage.
- [ ] Configure the official Tailwind Prettier plugin with the existing Astro plugin, including class sorting for supported class utilities and Site stylesheet discovery. Add Tailwind editor support where appropriate.
- [ ] Verify one minimal static UI component and one interactive component. Choose their placement before implementation and avoid unrelated public features or a permanent demo route solely for validation. Keep layouts, navigation, and content in Astro unless a specific interaction requires React.
- [ ] Verify desktop/mobile rendering, MDX headings/lists/tables/code/images, keyboard access, focus handling, and absence of hydration or browser console errors. Confirm static components do not ship React hydration code unnecessarily.
- [ ] Run the root checks and static output verification. Add meaningful behavior/regression coverage for any introduced interaction; record browser evidence and remaining limitations.
- [ ] Update architecture, tooling, and local usage documentation to describe the implemented setup, then update task and phase status from observed results.

## Boundaries

- Changes belong in `apps/site`, with root lockfile and developer tooling changes as needed.
- Do not change `apps/admin`, shared content schemas, content storage, public route generation, or authentication and deployment flows.
- Do not create `packages/ui` or move UI dependencies into `packages/content` or `packages/config`.
- Exclude a full Tailwind migration, visual redesign, dark-mode feature, and speculative state, data-fetching, or form libraries. Separate later tasks can cover those needs.

## Acceptance criteria

- Official compatibility evidence and exact selected versions are recorded before claiming support.
- React, Tailwind, and shadcn components build and work in Site without requiring a server runtime or Admin to serve visitors.
- Static Astro content remains usable without JavaScript; interactive islands hydrate only where required.
- Existing appearance, navigation, accessibility, content routes, SEO, RSS, sitemap, optimized images, and draft exclusion remain intact.
- Customer branding has a consistent token source; Site-local aliases and generated UI code pass applicable lint, formatting, and type checks.
- Root checks and browser smoke checks pass with actual results recorded. No Admin authentication/write E2E is claimed from build success.

## Verification plan

Use the pinned Node and pnpm versions. These commands are planned, not completed:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify:site
pnpm preview:site
```

Inspect built Site in a browser at desktop and mobile widths. Exercise the selected interaction with pointer and keyboard, verify focus behavior and content readability, and inspect console/hydration diagnostics and loaded JavaScript. Record commands, environment, dates, and observed outcomes in the evidence section. Deployed Admin E2E is required if scope later expands into authentication or write behavior.

## Official references to consult before implementation

- [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Astro client directives](https://docs.astro.build/en/reference/directives-reference/)
- [Tailwind CSS with Vite](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn/ui with Astro](https://ui.shadcn.com/docs/installation/astro)
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming)
- [React Hooks ESLint plugin](https://react.dev/reference/eslint-plugin-react-hooks)
- [JSX accessibility plugin](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [React ESLint plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [Tailwind Prettier plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography)

## Verification evidence

2026-11-10: Planning only. Reordered as Phase 03 after Repository workflow at the maintainer's request. Dependency selections, compatibility validation, implementation, application checks, and browser verification have not been performed for this task. Status remains TODO.
