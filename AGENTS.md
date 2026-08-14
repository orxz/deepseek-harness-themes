# AGENTS.md

Standing orders for this repository.

- Every theme must cover the full `REQUIRED_TOKENS` set defined in `packages/core/src/tokens.ts`; the same list is the authority in [docs/theme-spec.md](docs/theme-spec.md). `pnpm test` enforces coverage, id uniqueness, and CSS color validity.
- Test first: add or update `packages/*/tests/**/*.spec.ts` before implementation; run `pnpm test`, then `pnpm typecheck`, then `pnpm lint` before pushing.
- Registrations always return disposers (`ctx.effect()` or the returned cleanup); JSDoc states complete contracts, never reasoning transcripts.
- Docs follow the official tier discipline from [docs/AGENTS.md](docs/AGENTS.md): one home per fact, current state only, no change history in prose.
- Dependency declarations live in `peerDependencies`; `@deepseek-ai/*` packages are the runtime host and are never bundled.
