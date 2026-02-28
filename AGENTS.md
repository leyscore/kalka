# OpenPencil

Vue 3 + CanvasKit (Skia WASM) + Yoga WASM design editor. Tauri v2 desktop, also runs in browser.

## Commands

- `bun run check` — lint + typecheck (run before committing)
- `bun run format` — oxfmt with import sorting
- `bun test ./tests/engine` — unit tests
- `bun run test` — Playwright visual regression

## Code conventions

- `@/` import alias for cross-directory imports, `./` for same directory
- No `any` — use proper types, generics, declaration merging
- No `!` non-null assertions — use guards, `?.`, `??`
- Shared types (GUID, Color, Vector, Matrix, Rect) live in `src/types.ts`
- Window API extensions (showOpenFilePicker, queryLocalFonts) live in `src/global.d.ts`
- `src/kiwi/kiwi-schema/` is vendored — don't modify

## Rendering

- Canvas is CanvasKit (Skia WASM) on a WebGL surface, not DOM
- Rendering is coalesced via rAF — call `scheduleRender()`, not `renderNow()`
- `renderNow()` is only for surface recreation and font loading (need immediate draw)
- Resize observer uses rAF throttle, not debounce — debounce causes canvas skew (old WebGL surface stretched into resized element)
- Viewport culling skips off-screen nodes; unclipped parents are NOT culled (children may extend beyond bounds)

## Components & instances

- Purple (#9747ff) for COMPONENT, COMPONENT_SET, INSTANCE — matches Figma
- Instance children map to component children via `componentId` for 1:1 sync
- Override key format: `"childId:propName"` in instance's `overrides` record
- Editing a component must call `syncIfInsideComponent()` to propagate to instances
- `SceneGraph.copyProp<K>()` typed helper — uses `structuredClone` for arrays

## Layout

- `computeAllLayouts()` must be called after demo creation and after opening .fig files
- Yoga WASM handles flexbox; CSS Grid blocked on upstream (facebook/yoga#1893)

## UI

- Use reka-ui for UI components (Splitter, ContextMenu, etc.)
- Tailwind 4 for styling — no component-level CSS
- Mac keyboards: use `e.code` not `e.key` for shortcuts with modifiers (Option transforms characters)
- Splitter resize handles need inner div with `pointer-events-none` for sizing (zero-width handle collapses without it)
- Number input spinner hiding is global CSS in `app.css`, not per-component

## File format

- .fig files use Kiwi binary codec — schema in `src/kiwi/codec.ts`
- `NodeChange` is the central type for Kiwi encode/decode
- showOpenFilePicker/showSaveFilePicker are File System Access API (Chrome/Edge), not Tauri-only — code has fallbacks for other browsers

## Known issues

- Safari ew-resize/col-resize/ns-resize cursor bug (WebKit #303845) — fixed in Safari 26.3 Beta
