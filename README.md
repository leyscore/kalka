# OpenPencil

Open-source, AI-native design editor. Figma alternative built from scratch with full .fig file compatibility.

> **Status:** Active development. Not ready for production use.

## Features

- **CanvasKit (Skia WASM) renderer** — same rendering engine as Figma
- **Figma .fig file import** — Kiwi binary codec with Zstd decompression
- **Figma clipboard interop** — copy/paste between OpenPencil and Figma
- **Vector networks** — full Figma-compatible vertex/segment/region model, not SVG paths
- **Auto-layout** — Yoga WASM engine, supports all Figma layout modes
- **Pen tool** — click-to-place vertices, bezier tangent dragging, close/open paths
- **Inline text editing** — CanvasKit Paragraph API with Inter font
- **Undo/redo** — inverse command pattern across all operations
- **Snap guides** — edge/center snapping with rotation awareness
- **Color picker** — HSV area + hue/alpha sliders + hex input

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | Vue 3, VueUse, Reka UI |
| Styling | Tailwind CSS 4 |
| Rendering | CanvasKit (Skia WASM) |
| Layout | Yoga WASM |
| File format | Kiwi binary (vendored fork) + Zstd (fzstd) + ZIP (fflate) |
| Color | culori |
| Desktop | Tauri v2 |
| Testing | Playwright (E2E visual regression), bun:test (unit) |
| Tooling | Vite 7, oxlint, oxfmt, typescript-go |

## Getting Started

```sh
bun install
bun run dev        # http://localhost:1420
```

## Scripts

```sh
bun run dev         # Vite dev server
bun run build       # Production build
bun run check       # Lint + typecheck
bun run test        # E2E visual regression tests
bun run test:update # Regenerate screenshot baselines
bun run test:unit   # Unit tests (scene graph, ~15ms)
bun run tauri dev   # Desktop app (requires Rust toolchain)
```

## Project Structure

```
src/
  components/     Vue SFCs (canvas, panels, toolbar, color picker)
  composables/    Canvas input, keyboard shortcuts, rendering
  stores/         Editor state (Vue reactivity)
  engine/         Scene graph, renderer, layout, clipboard, undo, vector, snap
  kiwi/           Figma binary format (Kiwi codec, .fig import, protocol)
    kiwi-schema/  Vendored kiwi-schema (TypeScript source from evanw/kiwi)
  types.ts        Shared types (GUID, Color)
  constants.ts    UI colors, default fills, thresholds
desktop/          Tauri v2 (Rust + config)
tests/
  e2e/            Playwright visual regression tests
  engine/         bun:test unit tests
  helpers/        Test utilities (canvas interactions, Figma CDP)
```

## Figma Compatibility

OpenPencil reads Figma's native .fig files (ZIP → Kiwi binary → Zstd) and supports bidirectional clipboard copy/paste. The Kiwi codec includes a vendored fork of [kiwi-schema](https://github.com/evanw/kiwi) with support for Figma's sparse field IDs. Vector data uses the reverse-engineered `vectorNetworkBlob` binary format for full round-trip fidelity.

## License

MIT
