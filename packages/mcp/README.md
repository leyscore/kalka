# @kalka/mcp

Model Context Protocol server for [Kalka](https://kalka.design). It lets MCP clients such as Claude Code, Cursor, and Windsurf inspect and edit designs through the running app, reusing the same tool definitions as the built-in AI chat.

```sh
npm install -g @kalka/mcp
kalka-mcp        # stdio transport for MCP clients
kalka-mcp-http   # Streamable HTTP transport for browser extensions and scripts
```

On macOS and Linux, local clients prefer a private Unix domain socket; Windows and unavailable sockets fall back to localhost TCP. File access is limited to the effective MCP root.

- Setup and client configuration: https://github.com/leyscore/kalka/blob/main/packages/docs/programmable/mcp-server.md
- Source and issues: https://github.com/leyscore/kalka

MIT License.
