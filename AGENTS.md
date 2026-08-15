# AGENTS.md

Standing orders for this repository.

- Every theme must cover the full `REQUIRED_TOKENS` set defined in `packages/core/src/tokens.ts`; the same list is the authority in [docs/theme-spec.md](docs/theme-spec.md). `pnpm test` enforces coverage, id uniqueness, and CSS color validity.
- Test first: add or update `packages/*/tests/**/*.spec.ts` before implementation; run `pnpm test`, then `pnpm typecheck`, then `pnpm lint` before pushing.
- Registrations always return disposers (`ctx.effect()` or the returned cleanup); JSDoc states complete contracts, never reasoning transcripts.
- Docs follow the official tier discipline from [docs/AGENTS.md](docs/AGENTS.md): one home per fact, current state only, no change history in prose.
- Dependency declarations live in `peerDependencies`; `@deepseek-ai/*` packages are the runtime host and are never bundled.
- A shipped token value change updates, in the same change: the theme file's JSDoc, every design-spec section naming those values, and any count-derived assertion (package-smoke derives its theme count from `themes.length` — never reintroduce a literal).
- Releases are CI-owned: `.github/workflows/release.yml` publishes through npm OIDC trusted publishing. Never run `pnpm changeset publish` locally (the registry's OTP requirement fails non-interactive shells); release by merging the changeset to main, running `pnpm changeset version`, committing, and pushing — a main push with no open changesets triggers the publish. Releases run the full `pnpm gate`, not just the pre-push trio above.
- Theme-facing changes get a reviewer pass before merge that verifies, hex by hex, that theme JSDoc and design-spec sections match the shipped tokens — one review round has historically missed drift the second round caught.
