# Contributing

Community themes and fixes are welcome. This repository follows the deepseek-harness plugin conventions — read [AGENTS.md](AGENTS.md) first.

## Setup

```sh
nvm use          # .nvmrc pins the Node version CI and releases run on
pnpm install     # pnpm 11.7.0 comes from packageManager via Corepack
pnpm typecheck   # first successful typecheck means the setup is complete
```

`pnpm install` also syncs the Git hooks: staged files are auto-fixed and
formatted on commit, and `pnpm typecheck` runs on push.

## Workflow

1. Branch off `main` (`feature/<name>`).
2. Test first: add or update `packages/*/tests/**/*.spec.ts`, run `pnpm test` (red), implement, run again (green).
3. Run `pnpm changeset` for changes to either published package. Select the affected package and the SemVer impact, then write a consumer-facing summary. Documentation-only and test-only changes do not need a changeset.
4. Run the complete local gate before pushing: `pnpm gate`.
5. Every theme must cover the full `REQUIRED_TOKENS` and `RECOMMENDED_TOKENS` sets (`pnpm test` enforces this). See [docs/creating-a-theme.md](docs/creating-a-theme.md).
6. Keep docs in sync in the same change: [docs/theme-spec.md](docs/theme-spec.md) is the twin of `packages/core/src/tokens.ts`; package READMEs are per-package contracts.
7. Submit a PR with a summary of the change and the `pnpm gate` result.

## Adding a theme

Follow [docs/creating-a-theme.md](docs/creating-a-theme.md): one frozen `ThemeDefinition` file, a catalog entry, picker copy in both dictionaries, and `pnpm test` green.

## Releases

This repository stores no npm credential. Releases authenticate with npm through GitHub OIDC trusted publishing: the identity of `release.yml` running in this repository is the credential, so there is no token to leak or rotate. Each published package carries a trusted publisher naming this repository and that workflow; a publish that 404s means the package is missing one.

npm cannot configure a trusted publisher for a package that does not exist yet, so the very first version of a new package is published by hand from a maintainer's own npm login. That is a one-time step per package, and it uses a login rather than a stored token.

Changesets keeps `core` and `ui` at the same version because the UI distribution inlines core. Merging package changes into `main` creates or updates the automated version PR. Merging that version PR runs `pnpm gate`, publishes both packages to npm, and creates the corresponding GitHub releases and tags.

## Commit style

One logical change per commit; state what changed and why. Docs follow the tier discipline from [docs/AGENTS.md](docs/AGENTS.md) — one home per fact, current state only.
