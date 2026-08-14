# `@dshthemes/ui`

[English](README.md) | [简体中文](README.zh.md)

Theme picker plugin for [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness): registers all [`@dshthemes/core`](../core/README.md) themes, adds a Theme row to the settings General section, and persists the third-party selection.

## What it does

- Registers all eleven shipped themes through a labelled `ctx.effect` (unload tears them down).
- Binds the `dsh-themes` settings namespace and restores the persisted third-party selection on activation when it is still registered.
- Persists third-party selections on every `theme/change`; built-in selections clear the marker (`system`) and stay owned by the host Appearance row.
- Injects a picker row into the `settings.general.item` slot (id `themes`, order `11`, right after the host Appearance row) rendering the built-in cubes plus one entry per registered theme.
- Ships en/zh dictionaries for the picker copy.

## Persistence boundary

The host's built-in theme schema (`ui-theme.preference`) only accepts `light`/`dark`/`system`, so this plugin owns its own namespace:

```yaml
# $DSH_HOME/settings.yaml
dsh-themes:
  theme: catppuccin
```

The value `system` means "no override — follow the host preference". Non-string or unregistered values are ignored on restore.

## Usage

One command installs the dependency, adds the layer to the profile, and mounts the feature; `web` is the shipped Web profile (see [docs/installation.md](../../docs/installation.md) for the other profiles, source checkouts, and troubleshooting):

```sh
dsh plugin --profile web add @dshthemes/ui
```

The package ships a bundle manifest, so `dsh plugin` appends it to `dsh.profile.bundles` automatically — from a registry name, a local path, or a packed tarball alike. Profiles that prefer a hand-written layer can insert the row instead:

```yaml
- insert:
    - id: dsh-themes
      name: "@dshthemes/ui"
```

The browser roster scans `dsh.client` plugins automatically, so no host row is needed beyond the patch entry.

## Model Experience

None, as the picker manages a browser preference and a settings row; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known limitations

- Third-party selection durability lives in this plugin's own namespace; it never writes to the host's built-in theme schema.
- Remote browsers keep the selection process-local by host design (settings RPCs are loopback-only there); see the host's `SettingsScope` contract.
- The picker lists every registered third-party theme (including themes registered by other plugins), but the shipped dictionaries only cover this package's eleven ids; themes from other plugins render under a title-cased form of their id and without a swatch.
