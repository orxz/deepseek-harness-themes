# `@deepseek-harness-themes/core`

Theme definitions and registration helpers for [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) themes. This package carries no UI and no runtime dependency on the dsh application tree: it targets the official theme extension point (`ctx.theme` from `@deepseek-ai/dsh-client-ui-theme`) structurally.

## What it ships

- Six theme definitions (`ThemeDefinition = { id, colorScheme, tokens }`), each covering the full `REQUIRED_TOKENS` and `RECOMMENDED_TOKENS` sets declared in `src/tokens.ts`.
- `registerThemes(registry)` — registers every shipped theme and returns one disposer that unregisters all of them.
- A `/client` plugin entry (`apply`/`inject: ['theme']`) that registers all themes through a labelled `ctx.effect`, for users who want themes without the picker UI.

## Contract

- Theme ids are unique; `light`, `dark`, and `system` are reserved by the host and never registered.
- `colorScheme` (`'light' | 'dark'`) selects the host base palette; the presenter switches `body[data-ds-dark-theme]` from this field.
- `tokens` override the `--dsw-alias-*` / `--dsw-specific-*` semantic layer as inline CSS variables. The host's `--dsw-static-*` scale is not part of this contract.
- All definitions are frozen; a theme's token dictionary never mutates after import.

## Usage

Standalone install (registers all themes, no picker):

```sh
dsh plugin --profile <profile> add @deepseek-harness-themes/core
```

For custom assemblies, use the registration helper directly:

```ts
import { registerThemes } from "@deepseek-harness-themes/core";

export function apply(ctx: ClientContext): void {
  ctx.effect(() => registerThemes(ctx.theme), "my-plugin: register themes");
}
```

Selection is a host concern: call `ctx.theme.setTheme('catppuccin')` once the theme is registered. Durable third-party selection lives in the companion [`@deepseek-harness-themes/ui`](../ui/README.md) plugin.

## Model Experience

None, as this package only registers frozen theme definitions and a registration helper; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known limitations

- The host offers no completeness validation for override sets; this package compensates with `REQUIRED_TOKENS` and `pnpm test` enforcement.
- Theme selection through `ctx.theme` is process-local by host design; see `docs/theme-spec.md` for the persistence boundary.
