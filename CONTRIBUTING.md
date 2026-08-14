# Contributing

Community themes and fixes are welcome. This repository follows the deepseek-harness plugin conventions — read [AGENTS.md](AGENTS.md) first.

## Setup

```sh
# Node >= 22.19, pnpm 11.7.0 (Corepack)
pnpm install
pnpm typecheck   # first successful typecheck means the setup is complete
```

## Workflow

1. Branch off `main` (`feature/<name>`).
2. Test first: add or update `packages/*/tests/**/*.spec.ts`, run `pnpm test` (red), implement, run again (green).
3. Run the local gate before pushing: `pnpm typecheck && pnpm test:coverage && pnpm lint`.
4. Every theme must cover the full `REQUIRED_TOKENS` and `RECOMMENDED_TOKENS` sets (`pnpm test` enforces this). See [docs/creating-a-theme.md](docs/creating-a-theme.md).
5. Keep docs in sync in the same change: [docs/theme-spec.md](docs/theme-spec.md) is the twin of `packages/core/src/tokens.ts`; package READMEs are per-package contracts.
6. Submit a PR with a summary of the change and the verification you ran.

## Adding a theme

Follow [docs/creating-a-theme.md](docs/creating-a-theme.md): one frozen `ThemeDefinition` file, a catalog entry, picker copy in both dictionaries, and `pnpm test` green.

## Commit style

One logical change per commit; state what changed and why. Docs follow the tier discipline from [docs/AGENTS.md](docs/AGENTS.md) — one home per fact, current state only.
