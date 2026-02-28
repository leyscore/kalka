# Roadmap

## Phases

### Phase 1: Core Engine ✅

SceneGraph, Skia rendering, basic shapes, selection, zoom/pan, undo/redo.

**Delivered:**
- Scene graph with flat Map storage and parent-child tree
- CanvasKit WASM rendering for all shape types
- Click/shift/marquee selection with resize handles and rotation
- Zoom/pan with keyboard shortcuts and trackpad gestures
- Undo/redo wired into all operations
- Snap guides with edge and center snapping

### Phase 2: Editor UI + Layout ✅

Properties panel, layers panel, toolbar, Yoga layout integration, text editing.

**Delivered:**
- Vue 3 + Reka UI panels (properties, layers, toolbar)
- Properties panel split into sections (Appearance, Fill, Stroke, Typography, Layout, Position)
- ScrubInput component for all numeric inputs
- Color picker (HSV, hex, opacity)
- Layers panel with tree view, drag reorder, visibility toggle
- Auto-layout with Yoga WASM (direction, gap, padding, justify, align)
- Inline text editing with CanvasKit Paragraph API
- System font loading via Local Font Access API
- Canvas rulers with selection highlight

### Phase 3: File I/O + Visual Features ✅

.fig import/export, Kiwi codec, clipboard, sections, pages, advanced rendering.

**Delivered:**
- .fig file import via Kiwi binary codec
- .fig file export with Kiwi encoding, Zstd compression, thumbnail generation
- Save (⌘S) and Save As (⇧⌘S) with native OS dialogs
- Zstd compression via Tauri Rust command (deflate fallback in browser)
- Vendored kiwi-schema with ESM + sparse field ID patches
- Figma-compatible clipboard (bidirectional fig-kiwi binary)
- Pen tool with vector network model
- vectorNetworkBlob binary encode/decode
- Group/ungroup (⌘G/⇧⌘G)
- Tauri v2 desktop app with native menu bar (macOS/Windows/Linux)
- Sections (S key) with title pills, auto-adopt, luminance-adaptive text
- Multi-page documents with pages panel, per-page viewport
- Hover highlight with shape-aware outlines
- Tier 1 rendering: gradients, image fills, effects, strokes (cap/join/dash), arcs
- Fill type picker with solid/gradient/image tabs and gradient stop editing
- Canvas background color per page
- Fig-import unit tests, layout unit tests, layers-panel E2E tests

### Phase 4: Components + Variables 🔲

Components, instances, overrides, variants, variables, collections, modes/themes.

**Planned:**
- Component creation and instantiation
- Override propagation
- Variant switching
- Variable collections with modes (light/dark)
- Variable binding to node properties

### Phase 5: AI Integration 🔲

MCP server, design guidelines, screenshot verification loop.

**Planned:**
- Port MCP server from figma-use (117 tools)
- Design guidelines system
- AI-driven design workflow via MCP
- Screenshot verification loop

### Phase 6: Polish + Distribution 🔲

Prototyping, comments, desktop distribution, documentation, public launch.

**Planned:**
- Prototyping (frame connections, transitions)
- Comments (pin, threads, resolve)
- Cross-platform Tauri builds (macOS, Windows, Linux)
- PWA support
- Documentation site (VitePress) ← this is being built now
- Performance optimization (Lighthouse > 90)
- Full Figma compatibility test suite

## Timeline

| Phase | Estimated Duration | Status |
|-------|-------------------|--------|
| Phase 1: Core Engine | 3 months | ✅ Complete |
| Phase 2: Editor UI + Layout | 3 months | ✅ Complete |
| Phase 3: File I/O + Visual Features | 2 months | ✅ Complete |
| Phase 4: Components + Variables | 2 months | 🔲 Planned |
| Phase 5: AI Integration | 2 months | 🔲 Planned |
| Phase 6: Polish + Distribution | 2 months | 🔲 Planned |
