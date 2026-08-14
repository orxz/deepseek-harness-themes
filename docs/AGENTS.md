# AGENTS.md

Documentation standards for this subtree. The tier discipline mirrors the deepseek-harness docs standard: one home per fact, current state only.

- `docs/theme-spec.md` is the token contract twin of `packages/core/src/tokens.ts`; update both in the same change. `pnpm test` is the enforcement.
- `docs/installation.md` documents the two install shapes (full plugin, core-only). Change it when the patch shape or package entry points change.
- `docs/creating-a-theme.md` is a step-by-step guide; it must stay ordered and verify-driven — do not fold design rationale into it.
- Package READMEs (`packages/*/README.md` and `.zh.md`) are per-package contracts: config, semantics, limitations, extension points. Keep them in sync with the implementation in the same change.
- Prose states current behavior; no "previously / now / no longer" history, no PR or commit narration.
- Root [AGENTS.md](../AGENTS.md) carries the standing orders; do not restate them here.
