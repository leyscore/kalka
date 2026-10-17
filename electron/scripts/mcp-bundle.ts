/**
 * Kalka's stdio bridge as an MCP Bundle (`.mcpb`, https://github.com/modelcontextprotocol/mcpb):
 * a zip of a manifest and a self-contained server script that Claude Desktop installs as an
 * extension and runs with its own Node. The bridge only forwards to the running app, so the
 * bundle carries no settings beyond the folder file tools may use.
 */
import { strToU8, zipSync } from 'fflate'

/** Inside the bundle; `.mjs` so Node loads it as a module without a package.json. */
export const MCPB_ENTRY = 'server/stdio.mjs'
export const MCPB_ICON = 'icon.png'

export interface MCPBManifestOptions {
  version: string
  description: string
}

export function mcpbManifest({ version, description }: MCPBManifestOptions) {
  return {
    manifest_version: '0.3',
    name: 'kalka',
    display_name: 'Kalka',
    version,
    description,
    author: { name: 'Kalka contributors' },
    license: 'MIT',
    icon: MCPB_ICON,
    server: {
      type: 'node',
      entry_point: MCPB_ENTRY,
      mcp_config: {
        command: 'node',
        args: [`\${__dirname}/${MCPB_ENTRY}`],
        env: { KALKA_MCP_ROOT: '${user_config.root}' }
      }
    },
    user_config: {
      root: {
        type: 'directory',
        title: 'Files folder',
        description: 'The folder whose files Kalka may open and save for Claude.',
        required: false,
        default: '${HOME}'
      }
    },
    compatibility: {
      platforms: ['darwin', 'win32', 'linux'],
      runtimes: { node: '>=20.0.0' }
    }
  }
}

export interface MCPBContents extends MCPBManifestOptions {
  /** The bridge bundled into one file. */
  server: Uint8Array
  icon: Uint8Array
}

/** The `.mcpb` archive's bytes. */
export function packMCPBundle({ server, icon, ...manifest }: MCPBContents): Uint8Array {
  return zipSync(
    {
      'manifest.json': strToU8(`${JSON.stringify(mcpbManifest(manifest), null, 2)}\n`),
      [MCPB_ENTRY]: server,
      // A PNG is already compressed.
      [MCPB_ICON]: [icon, { level: 0 }]
    },
    { level: 9 }
  )
}
