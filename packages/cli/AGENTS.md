# CLI

Headless `.fig` inspection, export, linting, and scripting with `citty`. `bun kalka --help` lists current commands.

- Format all output with the `agentfmt` helpers re-exported from `packages/cli/src/format.ts`; do not hand-roll terminal formatting.
- Data and inspection commands support `--json`.
- App-only commands (`documents`, `undo`, `redo`, `settings`) print through `runAppCommand` in `packages/cli/src/app/command.ts`; `tool` lists and calls the same MCP-exposed Core tools as the app bridge, so add operations as tools rather than new RPC commands where they act on a document.
- Commands own their CLI UX independently of tools; `eval` exposes operations through `FigmaAPI` (`packages/core/AGENTS.md`, Figma API). Keep the public docs under `packages/docs/programmable/cli/` and the skill examples current when commands change.
- The MCP `--root` default is the current directory on macOS and Linux and the home directory on Windows; see `packages/mcp/AGENTS.md`.
- Image and PDF exports draw with Chromium through the desktop app's render host (`src/render/electron.ts`): the standalone HTML export of the layers, painted by `electron/dist/render-host.js`. Without it, or with `KALKA_RENDERER=canvaskit`, they fall back to CanvasKit (`packages/cli/tests/render/electron.test.ts`).
- Commands that lay out (`export`, `eval`, `convert`, `lint`, `tool`) call `useBrowserLayout()` before `loadDocument`, so the browser lays out as on the canvas through the same host (`src/render/layout.ts`); without it, or with `KALKA_LAYOUT=stored`, layers keep the geometry the document saved and the CLI says so once (`packages/cli/tests/render/layout.test.ts`). One host serves a run, through the synchronous channel in `src/render/host/session.ts`.
