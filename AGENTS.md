# OpenPencil

Vue 3 + CanvasKit (Skia WASM) + Yoga WASM design editor. Tauri v2 desktop app, also runs in browser.

## Commands

- `bun run check` — lint + typecheck (run before committing)
- `bun run format` — oxfmt with import sorting
- `bun test ./tests/engine` — unit tests
- `bun run test` — Playwright visual regression

## Rules

- Use `@/` import alias for cross-directory imports, `./` for same directory
- No `any` — use proper types, generics, declaration merging
- No `!` non-null assertions — use guards, `?.`, `??`
- Shared types live in `src/types.ts` (GUID, Color, Vector, Matrix, Rect)
- Mac shortcuts: use `e.code` not `e.key` (Option transforms characters)
- UI components: use reka-ui
- `src/kiwi/kiwi-schema/` is vendored — don't modify
