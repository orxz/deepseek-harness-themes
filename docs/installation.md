# Installation

Two shapes: the full picker plugin (themes + settings row + persistence), or the core package alone for compositions that bring their own selection UI.

## Prerequisites

- deepseek-harness with the Web surface (`dsh-web-app` composition), since themes are browser client plugins.
- The packages resolvable from the profile's installation closure: dsh links every package in the dsh application's dependency closure into `$DSH_HOME/profiles/node_modules`, so the packages must be installed into the dsh app (custom builds) or into the profile directory itself (`$DSH_HOME/profiles/<profile>/` — run `pnpm add` there).

## Full plugin: `@dshthemes/ui`

The package ships a bundle manifest, so one command installs the dependency, adds the layer to the profile's bundle list, and mounts the feature:

```sh
dsh plugin --profile <profile> add @dshthemes/ui
```

No `cordis.patch.yml` edit is needed — `dsh plugin` maintains the profile manifest. Remove it just as easily:

```sh
dsh plugin --profile <profile> remove @dshthemes/ui
```

For profiles that prefer a hand-written layer, the equivalent patch row is:

```yaml
# $DSH_HOME/profiles/<profile>/cordis.patch.yml
- insert:
    - id: dsh-themes
      name: "@dshthemes/ui"
```

The picker bundle inlines the core theme library, so no core row is needed — one row mounts the whole feature.

Start the web surface:

```sh
dsh --profile <profile>
```

Open Settings → General: the Theme row appears right after the host Appearance row. The built-in cubes (Light / Dark / System) behave exactly like the host row; the additional entries switch to the registered themes. Third-party selection persists in the `dsh-themes` settings namespace.

## Core only: `@dshthemes/core`

For compositions that want the themes without the picker (a custom selection surface, a slash command, or a fixed deployment theme), install the core bundle and select programmatically:

```sh
dsh plugin --profile <profile> add @dshthemes/core
```

```ts
// In any client plugin loaded after the core entry:
ctx.effect(() => {
  ctx.theme.setTheme("catppuccin");
}, "deployment: fixed theme");
```

The core package also exports `registerThemes(registry)` and the theme definitions for fully custom assemblies.

## Local development

To develop themes against a checkout of deepseek-harness, install the packages by path in the harness workspace and add the same patch row; run the web development pair:

```sh
pnpm dsh web
pnpm run dev:web
```

Client plugin reload is handled by the harness HMR chain while `dev:web` watches.
