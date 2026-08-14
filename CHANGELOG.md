# Changelog

Release notes live with the packages they describe. Changesets generates them
from the changesets merged into `main`:

- `packages/core/CHANGELOG.md` — `@dsh-themes/core`
- `packages/ui/CHANGELOG.md` — `@dsh-themes/ui`

Both packages share one version because the UI distribution inlines core.

This file keeps the initial release, which predates the Changesets workflow.

## 0.0.1

Initial release, verified against a real deepseek-harness checkout (host tree activation, browser bundle registration, settings picker rendering, live theme switching with token application).

- `@dsh-themes/core`: 10 theme definitions over the official `ctx.theme` extension point plus `registerThemes(registry)` and a zero-UI client entry.
- `@dsh-themes/ui`: client plugin with a theme picker settings row and durable third-party theme selection.
- Client bundles follow the host's `window.__ModuleLoader__.load({ id, factory })` contract (CJS factory, inlined CSS Modules, inlined core library).
- Official bundle packaging: both packages ship `dsh.bundle` manifests, so `dsh plugin add @dsh-themes/ui` installs and mounts the feature in one command (verified against a real dsh checkout).
- Official package invariants: cordis peer+dev mirror, Model Experience README sections, build step in CI.
- Docs: theme spec, installation, creating-a-theme.
