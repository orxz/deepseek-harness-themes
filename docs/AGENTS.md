# AGENTS.md

Documentation standards for this subtree. The tier discipline mirrors the deepseek-harness docs standard: one home per fact, current state only.

- Every user-facing document ships as an English original and a Chinese twin (`<name>.md` / `<name>.zh.md`): the README set, CONTRIBUTING, and the three guides in this subtree. Both halves carry a language switch linking each other; Chinese documents link the Chinese guides, never the English ones. The English original stays the authority being edited in the same change as the code; the Chinese twin is updated in the same change too. `pnpm test` enforces twin presence, switch links, and that every relative link resolves.
- `docs/theme-spec.md` is the token contract twin of `packages/core/src/tokens.ts`; update both in the same change. `pnpm test` is the enforcement.
- `docs/installation.md` documents the two install shapes (full plugin, core-only). Change it when the patch shape or package entry points change.
- `docs/creating-a-theme.md` is a step-by-step guide; it must stay ordered and verify-driven — do not fold design rationale into it.
- Package READMEs (`packages/*/README.md` and `.zh.md`) are per-package contracts: config, semantics, limitations, extension points. Keep them in sync with the implementation in the same change.
- Prose states current behavior; no "previously / now / no longer" history, no PR or commit narration.
- Root [AGENTS.md](../AGENTS.md) carries the standing orders; do not restate them here.
