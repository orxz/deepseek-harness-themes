# Theme Catalog Expansion — Design

Date: 2026-08-14 · Branch: `feature/expand-theme-catalog` · Status: approved direction, spec for review

## Background and Goal

The catalog ships 6 themes (deepseek, oled, dracula, catppuccin, tokyo-night,
github-dark), all in the blue/purple/gray neighborhood. Users asked for a wider
selection drawn from the most popular themes in the wild.

Goal: add 5 established, visually distinct themes — one representative per
dominant background family — bringing the catalog to 11. All additions are
dark variants, matching each family's most popular upstream form.

## Selection Basis (confirmed with user)

Popularity source: **GitHub stars** of upstream theme repositories, sampled
2026-08-14 via the GitHub API. Excluded: non-color-theme repos (icon packs,
aggregate lists), star-anomaly outliers (dark-islands), deleted repos
(vsc-material-theme).

Dedup rule (user-confirmed): group candidates by **dominant background hue**
and keep one representative per family — the most starred / most iconic.

| Family               | Candidates (stars)                          | Kept              | Upstream                  | Stars |
| -------------------- | ------------------------------------------- | ----------------- | ------------------------- | ----- |
| Yellow-green base    | Solarized 16.0k, Everforest 4.2k            | **Solarized**     | altercation/solarized     | 16.0k |
| Warm brown/orange    | Gruvbox 15.7k, Ayu 4.4k, Flexoki 3.6k       | **Gruvbox**       | morhetz/gruvbox           | 15.7k |
| Ice-blue/gray        | Nord 6.9k, One Dark Pro 1.8k, Kanagawa 6.3k | **Nord**          | nordtheme/nord            | 6.9k  |
| Neon purple/pink     | Synthwave '84 5.3k, Rose Pine 1.6k          | **Synthwave '84** | robb0wen/synthwave-vscode | 5.3k  |
| Cobalt blue + yellow | Cobalt2 0.8k                                | **Cobalt2**       | wesbos/cobalt2-vscode     | 0.8k  |

After the expansion the 11 themes cover 11 distinguishable base hues:

```
DeepSeek(blue) OLED(black) Dracula(purple) Catppuccin(pastel)
TokyoNight(indigo) GitHubDark(gray) + Solarized(yellow-green)
Gruvbox(warm orange) Nord(ice blue) Synthwave(neon purple) Cobalt2(cobalt+yellow)
```

## Theme Designs

Each theme is one frozen `ThemeDefinition` covering the full `REQUIRED_TOKENS`
and `RECOMMENDED_TOKENS` sets (see `packages/core/src/tokens.ts`). Token values
prefer the upstream palette verbatim; where an upstream color fails the
contrast bars, pick a lighter palette entry, and if none exists, state the
deviation in the file's JSDoc (Dracula precedent).

### solarized — Solarized Dark

- Identity: `--dsw-alias-bg-base` `#002b36` (base03), brand `#b58900`
  (solarized yellow — the family's signature accent).
- Surfaces: base03/base02 `#073642` ladder (layers), `#586e75`–`#657b83` for
  tertiary text.
- Known risk: base01 `#586e75` on base03 measures ≈4.3:1, just under the 4.5:1
  text bar — tertiary/caption tokens take base00 `#657b83` (≈5.3:1) instead;
  JSDoc records the substitution.

### gruvbox — Gruvbox Dark

- Identity: `--dsw-alias-bg-base` `#282828` (bg0), brand `#fe8019` (neutral
  orange).
- Surfaces: bg0/bg1 `#3c3836`/bg2 `#504945` ladder; text fg1 `#ebdbb2`
  primary, fg4 `#a89984` tertiary (≈6:1, safe).
- States: `#fb4934` red, `#b8bb26` green, `#fabd2f` yellow, `#83a598` blue,
  `#8ec07c` aqua.
- Lowest-risk palette of the five; deviations not expected.

### nord — Nord

- Identity: `--dsw-alias-bg-base` `#2e3440` (nord0), brand `#88c0d0`
  (frost nord8, ≈9:1).
- Surfaces: nord0→nord2 `#3b4252`/`#434c5e` ladder.
- Known risk: nord3 `#4c566a` on nord0 is ≈2:1 — unusable for any text or
  border token; tertiary text takes nord9 `#81a1c1`, borders take
  translucent nord6 `#eceff4` overlays (Dracula pattern); JSDoc records the
  substitution.
- States: `#bf616a` red, `#a3be8c` green, `#ebcb8b` yellow, `#b48ead` purple.

### synthwave-84 — Synthwave '84

- Identity: `--dsw-alias-bg-base` `#241b2f`, brand `#ff7edb` (neon pink).
- Surfaces: `#241b2f` → `#34294f`-family ladder (banner `#201d27` for code
  blocks, sidebar darker `#1a1721`).
- Text: `#f8f8f2` primary, `#c7c4dd`-family secondary/tertiary.
- Accents: `#36f9f6` cyan (business), `#72f1b8` green, `#ffb454` orange,
  `#fe4450` red.
- Very dark base — all bright accents pass comfortably; the risk is
  surface-to-surface separation, addressed by keeping the ladder steps ≥1
  lightness notch apart.

### cobalt2 — Cobalt2

- Identity: `--dsw-alias-bg-base` `#193549`, brand `#ffc600` (signature
  yellow, ≈9:1).
- Surfaces: `#122d42` (sidebar/login) → `#193549` → `#1f4662` (selected)
  ladder; code blocks `#122d42`.
- Known risk: signature link blue `#0088ff` on `#193549` is ≈3.4:1 — fine for
  fills/borders, fails the text bar; text-bearing business tokens take a
  lightened `#3d9eff`-family entry; JSDoc records the substitution.
- States: `#ff628c` red, `#00c8d2` cyan, `#ff9c00` orange, `#9effff` green.

## File Changes

| File                                                                        | Change                                                               |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `packages/core/src/themes/{solarized,gruvbox,nord,synthwave-84,cobalt2}.ts` | new theme files (frozen, full token sets, JSDoc contracts)           |
| `packages/core/src/themes/index.ts`                                         | named exports + catalog entries appended in the order above          |
| `packages/ui/src/locales.ts`                                                | `PickerKey` union + `en` + `zh` gain `theme.*` entries for the 5 ids |
| `packages/ui/tests/locales.spec.ts`                                         | new: catalog ↔ picker-copy sync test (see Test Plan)                 |
| `previews/<id>.svg` × 5                                                     | generated by `pnpm previews`, committed                              |
| `screenshots/<id>.png` × 5                                                  | captured from the live harness web pair, committed                   |
| `README.md`, `README.zh.md`                                                 | theme tables gain 5 rows                                             |
| `docs/previews.md`, `docs/previews.zh.md`                                   | one section per theme: projection, capture, two identity colors      |

Ids are kebab-case per `docs/creating-a-theme.md`; `cobalt2` keeps its numeral
(the upstream name is a single word), `synthwave-84` splits the year.

## Test Plan (test first)

1. **New `packages/ui/tests/locales.spec.ts`** — imports `themes` from
   `@dshthemes/core` and asserts every catalog id has a non-empty
   `theme.<id>` value in both `en` and `zh`. Written before any locale
   entries; goes red the moment core registers a theme without picker copy.
   This closes a real gap: nothing today ties catalog ids to picker copy.
2. **Existing core suites stay untouched and parameterize over the catalog**:
   `themes.spec.ts` (id uniqueness, token coverage, color validity, freeze),
   `contrast.spec.ts` (WCAG bars), `previews.spec.ts` (fresh previews) all
   iterate `themes`, so the 5 new files are enforced automatically.
3. **Order**: after the five theme files and locale entries land, run
   `pnpm previews` (its output turns `previews.spec.ts` green), then the final
   gates: `pnpm test` → `pnpm typecheck` → `pnpm test:coverage`
   (per-file 100%) → `pnpm lint` → `pnpm build`.

## Acceptance Criteria

- Catalog holds 11 themes; every one covers `REQUIRED_TOKENS` and
  `RECOMMENDED_TOKENS` fully; ids unique and not reserved.
- All contrast bars pass; every palette deviation is stated in the theme
  file's JSDoc.
- Picker shows all 11 names in both languages; persisted selection survives
  reload (existing preference path, unchanged).
- Previews, screenshots, both READMEs, and both previews docs carry the 5 new
  themes; all gates green.

## Non-Goals

- Light variants of any family (Solarized Light, Ayu Light, …).
- A dynamic/config-driven theme loader — themes remain frozen catalog files.
- Theme reordering, favorites, or preview thumbnails in the picker UI.
