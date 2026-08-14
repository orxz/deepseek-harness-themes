# Installation

[English](installation.md) | [简体中文](installation.zh.md)

Two shapes: the full picker plugin (themes + settings row + persistence), or the core package alone for compositions that bring their own selection UI.

## Quick start

```sh
dsh plugin --profile web add @dshthemes/ui
dsh web
```

What the eleven themes look like: [previews](previews.md).

Open Settings → General: the Theme row appears right after the host Appearance row. The built-in cubes (Light / Dark / System) behave exactly like the host row; the additional entries switch to the registered themes. Third-party selection persists in the `dsh-themes` settings namespace, so switching themes afterwards is a browser preference and needs no further command.

![The Theme picker row under Settings → General](../screenshots/settings.png)

## Prerequisites

- deepseek-harness with the Web surface (`dsh-web-app` composition), since themes are browser client plugins.
- pnpm on `PATH`: `dsh plugin` forwards its arguments to pnpm inside the profile directory. `corepack enable` is enough.
- Nothing else. The harness supplies cordis, schemastery, React, and the client runtime through the loader's module table and the maintained `$DSH_HOME/profiles/node_modules` fallback, and the picker bundle inlines the theme catalog, so the profile installs one package and no companions.
- A profile to install into. Profiles live under `$DSH_HOME/profiles/<name>` (`$DSH_HOME` defaults to `~/.dsh`), and `web` is the shipped Web profile, initialized on first use. `--profile` is required and has no default, so every command here names `web`; substitute your own profile name if you keep one, remembering that a self-made profile carries `@deepseek-ai/dsh-base` alone until you add the Web app layer to it.

## Full plugin: `@dshthemes/ui`

The package ships a bundle manifest, so one command installs the dependency, adds the layer to the profile's bundle list, and mounts the feature:

```sh
dsh plugin --profile web add @dshthemes/ui
```

No `cordis.patch.yml` edit is needed — `dsh plugin` reconciles `dsh.profile.bundles` against what is installed. Upgrade and removal take the same route:

```sh
dsh plugin --profile web update @dshthemes/ui
dsh plugin --profile web remove @dshthemes/ui
```

For profiles that prefer a hand-written layer, the equivalent patch row is:

```yaml
# $DSH_HOME/profiles/web/cordis.patch.yml
- insert:
    - id: dsh-themes
      name: "@dshthemes/ui"
```

That row is the alternative to `dsh plugin`, not a companion to it: a plain `pnpm add` inside the profile directory installs the package without reconciling the bundle list, and the hand-written row is then what mounts the feature.

The picker bundle inlines the core theme library, so no core row is needed — one row mounts the whole feature.

## Core only: `@dshthemes/core`

For compositions that want the themes without the picker (a custom selection surface, a slash command, or a fixed deployment theme), install the core bundle and select programmatically:

```sh
dsh plugin --profile web add @dshthemes/core
```

```ts
// In any client plugin loaded after the core entry:
ctx.effect(() => {
  ctx.theme.setTheme("catppuccin");
}, "deployment: fixed theme");
```

The two packages are alternatives. Both register the same eleven theme ids and the host registry throws on a duplicate id, so one profile mounts either the picker row or the core row, never both.

The core package also exports `registerThemes(registry)` and the theme definitions for fully custom assemblies.

## Install from source

`dsh plugin` forwards path, `link:`, and tarball specs to pnpm and reconciles the bundle list by the installed package's real name, so a checkout mounts exactly like a registry install — again without a hand-written patch row. `lib/` is generated, so build the checkout first:

```sh
git clone https://github.com/orxz/deepseek-harness-themes
cd deepseek-harness-themes
pnpm install && pnpm build
```

A linked checkout stays live: rebuild with `pnpm build` and the profile picks the new artifact up.

```sh
dsh plugin --profile web add "link:$(pwd)/packages/ui"
```

A packed tarball is the artifact shape consumers receive from npm, pinned at pack time:

```sh
pnpm --filter @dshthemes/ui pack --pack-destination /tmp/dshthemes
dsh plugin --profile web add /tmp/dshthemes/dshthemes-ui-*.tgz
```

Relative specs (`./packages/ui`, `link:./packages/ui`) are anchored to the directory `dsh` runs in, so both forms also work from inside the checkout. Removal names the package rather than the path:

```sh
dsh plugin --profile web remove @dshthemes/ui
```

Git specs (`github:orxz/deepseek-harness-themes`) are not a supported route: the published packages live in a workspace under `packages/`, and their artifacts come from `pnpm build` rather than an install-time `prepare` script.

## Local development

To develop themes against a checkout of deepseek-harness, build the harness once (`pnpm run build` in its repository root), install this checkout into the profile through the `link:` route above, and run the web development pair:

```sh
pnpm dsh web
pnpm run dev:web
```

Client plugin reload is handled by the harness HMR chain while `dev:web` watches.

## Troubleshooting

- `pnpm not found on PATH` — `dsh plugin` is a pnpm forwarder; run `corepack enable`.
- `ERR_PNPM_ADDING_TO_ROOT` — a profile is its own pnpm workspace root (its `pnpm-workspace.yaml` lists `.`), and pnpm 10 refuses to add a dependency there. pnpm 11 accepts it. `dsh plugin` runs the pnpm on `PATH` with the profile as the working directory, so the version a repository pins for itself is not the one that runs; upgrade that pnpm, or pass the check once:

  ```sh
  npm_config_ignore_workspace_root_check=true dsh plugin --profile web add @dshthemes/ui
  ```

- No Theme row under Settings → General — the profile that received the install is not the profile that booted. `dsh web --dump-config` lists the mounted rows, `dsh-themes` among them.
- A duplicate theme id error on load — the profile mounts `@dshthemes/ui` and `@dshthemes/core` together; remove one.
