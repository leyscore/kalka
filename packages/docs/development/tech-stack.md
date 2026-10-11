# Tech Stack

## Core Technologies

| Layer | Technology | Why |
|-------|-----------|-----|
| **Canvas** | Browser DOM and CSS, one sandboxed iframe per artboard | What the canvas shows is the page that ships |
| **Overlay** | SVG | Selection, guides and handles above the page, crisp at any zoom |
| **Raster export** | Skia CanvasKit WASM | Thumbnails, boolean geometry and exports outside the desktop app |
| **UI Framework** | Vue 3 + VueUse | Reactive composition API, excellent TypeScript support |
| **Components** | Reka UI | Headless, accessible UI primitives (tree, slider, etc.) |
| **Styling** | Tailwind CSS 4 | Utility-first, fast iteration, dark theme |
| **Layout** | The browser; Yoga WASM off screen | The browser lays the canvas out; Yoga serves headless runs and graphs the canvas does not draw |
| **Text editing** | ProseMirror | Rich text edited in place inside the artboard's page |
| **File formats** | Kalka folder (HTML, CSS, JSON); Kiwi binary + Zstd | Folders open in any code editor and diff in Git; `.fig` for Figma files |
| **Collaboration** | Trystero + Yjs | P2P WebRTC via MQTT signaling, CRDT sync, y-indexeddb persistence |
| **Color** | culori | Color space conversions (HSV, RGB, hex) |
| **AI/MCP** | MCP SDK + Hono | Bundled MCP server with HTML tools, stdio + HTTP transports |
| **JSX Transform** | Sucrase | Lightweight (201 KB) JSX → JS, synchronous, browser-compatible |
| **Events** | nanoevents | 108 bytes, typed event emitter for SceneGraph mutations |
| **Desktop** | Electron | The same Chromium on every system, so the canvas renders identically everywhere |
| **Build** | Vite 7 | Fast HMR, native ES modules |
| **Testing** | Playwright + bun:test | Visual regression (E2E) + fast unit tests |
| **Linting** | oxlint | Rust-based, orders of magnitude faster than ESLint |
| **Formatting** | oxfmt | Rust-based formatter |
| **Type Checking** | typescript-go (tsgo) | Native Go implementation of TypeScript type checker |

## Why...

### Why draw the canvas with the DOM?

A canvas engine draws a picture of a page that someone then rebuilds in code, and the two drift apart. Kalka lets the browser lay out and paint every layer, so flexbox, grid, fonts, shadows and blurs on the canvas are exactly what ships. The cost is one DOM element per layer: each artboard is its own document, and the projector patches only the layers a change touches.

### Why Electron?

A system webview is a different engine on each platform (WebKit on macOS and Linux, Chromium on Windows), so the same design would render differently on each. Electron ships one Chromium everywhere. It also gives the desktop app Chromium's Local Font Access and offscreen page capture, which raster exports use.

### Why not React (like the original plan)?

The project migrated from React to Vue 3 early in development. Vue's reactivity system and VueUse composables proved more ergonomic for the editor's state management needs.

### Why not a custom layout engine?

The browser already implements CSS layout completely, so the canvas uses it. Off screen, Yoga is maintained by Meta and implements the CSS flexbox spec; building a custom engine would take months to reach the same correctness.

## Additional Technologies

| Technology | Purpose | Status |
|-----------|---------|--------|
| CSS Grid in Yoga | Grid-based auto layout | Shipped via [Yoga fork](https://github.com/open-pencil/yoga/tree/grid) (`@open-pencil/yoga-layout`) |
