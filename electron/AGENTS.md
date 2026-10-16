# Desktop (Electron)

The desktop app is an Electron shell around the Vite app. `bun run dev:desktop` runs it on the dev server (`KALKA_DEV_URL`), `bun run package:desktop` builds the DMG and ZIP on macOS, an NSIS installer on Windows and an AppImage on Linux with electron-builder; `bun run --cwd electron build` bundles the main process, preload and MCP server.

- The renderer reaches the desktop only through the preload bridge (`electron/src/preload.ts`) and the IPC handlers registered in `electron/src/handlers/index.ts`; app code calls them through the `@tauri-apps/*` modules that `vite/aliases.ts` maps to `src/app/platform/tauri`. A new native capability is a handler plus its `src/app/platform/tauri` counterpart.
- The app page loads from the `kalka-app://` protocol with a strict CSP (`electron/src/main.ts`); keep remote content out of the editor window.
- Secrets are encrypted with `safeStorage` and stored as ciphertext only (`electron/src/handlers/credentials.ts`); failures must surface, never fall back to plaintext (`src/AGENTS.md`, Settings).
- Child processes follow the command scopes in `desktop/capabilities/default.json` (`electron/src/handlers/shell.ts`); a scope pins the whole command line, no free arguments.
- The MCP server ships inside the app: `electron/scripts/build-mcp.ts` bundles `packages/mcp` into `electron/dist/mcp`, which runs with `ELECTRON_RUN_AS_NODE` (`electron/src/handlers/mcp/bundled.ts`); one-click client setup lives in `electron/src/handlers/mcp/clients.ts`.
- The native menu is built from `desktop/generated/menu.json`, produced by `bun run generate:tauri-menu` from `src/app/shell/menu/schema.ts`; do not edit it by hand.
- PNG and JPG exports are captured from an offscreen window (`electron/src/handlers/raster.ts`); `.fig` files are compressed with Node's zstd (`electron/src/handlers/fig.ts`).
- Files, `.kalka` archives, Kalka folders and `kalka://` links arrive through `electron/src/handlers/pending.ts`, from the command line, a second launch or the Finder.
- The development app at `electron/.dev/` holds a single-instance lock and port 7600 like an installed one; drive a second copy with its own `--user-data-dir` and `--remote-debugging-port`.
