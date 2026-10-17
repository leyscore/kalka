# MCP server

stdio and Hono HTTP MCP server that reuses Core tools (`packages/core/AGENTS.md`, Tools).

- MCP-only filesystem and server tools live in `packages/mcp/src/tool/registration.ts`; listener and session lifecycle under `packages/mcp/src/server/`, stdio under `packages/mcp/src/stdio/`, transport discovery under `packages/mcp/src/transport/`.
- Registration uses Standard Schema with Valibot JSON Schema conversion from the Core tool input contract; per-tool exposure comes from `isToolExposed()`.
- File access must resolve symlinks inside the effective MCP root. CLI defaults are the current directory on macOS and Linux and the home directory on Windows.
- Every HTTP request and WebSocket handshake passes `packages/mcp/src/server/guard.ts` first: an `Origin` must be on the allowlist and `Host` must be a loopback name, so web pages cannot drive the server (`tests/engine/mcp/server/guard.test.ts`).
- The stdio bridge must keep answering while the app is closed: tools list from the bundled definitions and calls return `APP_NOT_RUNNING_MESSAGE` from `packages/mcp/src/app-status.ts` (`tests/engine/mcp/stdio/app-closed.test.ts`).
- Core tool results become MCP content only in `packages/mcp/src/tool/response.ts`: the tool's own blocks stay unchanged and the app's `target` follows them as a text block and `_meta['kalka/document']`; file results (`ToolDef.output: 'file'`) get links from `packages/mcp/src/server/assets.ts`, which the server adds to `/rpc` and session calls alike (`tests/engine/mcp/server/responses.test.ts`).
- Keep browser lifecycle out of this package and out of Core.
- Transport tests live under `tests/engine/mcp/{server,stdio,transport}` with shared fixtures under `tests/helpers/mcp`; isolate tests from user runtime discovery. Playwright starts the development MCP companion through the Vite automation plugin; see `tests/AGENTS.md`.
