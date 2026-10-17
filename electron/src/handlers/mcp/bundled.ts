import { access } from 'node:fs/promises'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app } from 'electron'

/**
 * The MCP server ships inside the app (`scripts/build-mcp.ts`), and Electron runs it as Node, so
 * nobody installs a separate package and the server always matches the app's version. Packaged
 * builds keep it outside `app.asar`, where a Node process can read it like any folder.
 */
function bundledDir(): string {
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'mcp')
  return app.isPackaged ? dir.replace(`app.asar${sep}`, `app.asar.unpacked${sep}`) : dir
}

export const BUNDLED_MCP_HTTP = 'index.js'
export const BUNDLED_MCP_STDIO = 'stdio.js'
/** The stdio bridge packed as an MCP Bundle, which Claude Desktop installs as an extension. */
export const BUNDLED_MCP_EXTENSION = 'kalka.mcpb'

/** A bundled server file, or null when this build has none (it is built with the main process). */
export async function bundledMCPScript(entry: string): Promise<string | null> {
  const path = join(bundledDir(), entry)
  try {
    await access(path)
    return path
  } catch {
    return null
  }
}

/** How a client starts a bundled script: the app's own binary, running as Node. */
export function bundledMCPCommand(script: string) {
  return { command: process.execPath, args: [script], env: { ELECTRON_RUN_AS_NODE: '1' } }
}
