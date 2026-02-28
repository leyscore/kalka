# Contributing

## Project Structure

```
src/
  components/        Vue SFCs (canvas, panels, toolbar, color picker)
    properties/      Property panel sections (Appearance, Fill, Stroke, etc.)
  composables/       Canvas input, keyboard shortcuts, rendering hooks
  stores/            Editor state (Vue reactivity)
  engine/            Scene graph, renderer, layout, clipboard, undo, vector, snap
  kiwi/              Figma file format (Kiwi codec, .fig import)
    kiwi-schema/     Vendored from evanw/kiwi
  types.ts           Shared types
  constants.ts       UI colors, defaults, thresholds
desktop/             Tauri v2 (Rust + config)
tests/
  e2e/               Playwright visual regression
  engine/            Unit tests (bun:test)
docs/                VitePress documentation site
openspec/
  specs/             Capability specifications (source of truth)
  changes/           Active and archived changes
```

## Development Setup

```sh
bun install
bun run dev          # Editor at localhost:1420
bun run docs:dev     # Docs at localhost:5173
```

## Code Style

### Tooling

| Tool | Command | Purpose |
|------|---------|---------|
| oxlint | `bun run lint` | Linting (Rust-based, fast) |
| oxfmt | `bun run format` | Code formatting |
| tsgo | `bun run typecheck` | Type checking (Go-based TypeScript checker) |

Run all checks:

```sh
bun run check
```

### Conventions

- **File names** — kebab-case (`scene-graph.ts`, `use-canvas-input.ts`)
- **Components** — PascalCase Vue SFCs (`EditorCanvas.vue`, `ScrubInput.vue`)
- **Constants** — SCREAMING_SNAKE_CASE
- **Functions/variables** — camelCase
- **Types/interfaces** — PascalCase

### AI Agent Conventions

See [`AGENTS.md`](https://github.com/dannote/open-pencil/blob/master/AGENTS.md) in the repo root for detailed coding conventions tailored to AI agents. Covers rendering, scene graph, components & instances, layout, UI, file format, Tauri, and known issues.

## Making Changes

1. Check existing [openspec specs](/development/openspec) for the capability you're modifying
2. Create an openspec change if adding new behavior: `openspec new change "my-change"`
3. Implement the change
4. Run `bun run check` and `bun run test`
5. Submit a pull request

## Key Files

| File | Purpose |
|------|---------|
| `src/engine/scene-graph.ts` | Core data structure for all design nodes |
| `src/engine/renderer.ts` | CanvasKit rendering pipeline |
| `src/engine/layout.ts` | Yoga layout adapter |
| `src/engine/undo.ts` | Undo/redo manager |
| `src/engine/clipboard.ts` | Figma-compatible clipboard |
| `src/engine/vector.ts` | Vector network model |
| `src/stores/editor.ts` | Global editor state |
| `src/composables/use-canvas.ts` | Canvas rendering composable |
| `src/composables/use-canvas-input.ts` | Mouse/touch input handling |
| `src/composables/use-keyboard.ts` | Keyboard shortcut handling |
| `src/kiwi/codec.ts` | Kiwi binary encoder/decoder |
| `src/kiwi/fig-import.ts` | .fig file import logic |
