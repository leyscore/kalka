import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

import * as v from 'valibot'

import { NativeError } from '../ipc'

/** The name Kalka's tools appear under in Claude: `mcp__kalka__*`. */
const MCP_SERVER_NAME = 'kalka'
/** The stdio bridge Claude starts; it finds the running app through its discovery file. */
const MCP_BRIDGE = 'openpencil-mcp'

const ConfigText = v.pipe(v.string(), v.parseJson(), v.record(v.string(), v.unknown()))
const Servers = v.record(v.string(), v.unknown())

function configPath(): string {
  const home = homedir()
  if (process.platform === 'darwin')
    return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
  if (process.platform === 'win32')
    return join(
      process.env.APPDATA ?? join(home, 'AppData', 'Roaming'),
      'Claude',
      'claude_desktop_config.json'
    )
  return join(home, '.config', 'Claude', 'claude_desktop_config.json')
}

/** The file's settings, or null when there is no file yet. */
async function readConfig(path: string): Promise<Record<string, unknown> | null> {
  let text: string
  try {
    text = await readFile(path, 'utf8')
  } catch {
    return null
  }
  if (!text.trim()) return {}
  const parsed = v.safeParse(ConfigText, text)
  if (!parsed.success)
    throw new NativeError(
      `Claude Desktop's configuration at ${path} is not valid JSON. Fix it, then connect again.`
    )
  return parsed.output
}

/**
 * Adds Kalka's MCP bridge to Claude Desktop's configuration and keeps every other setting. Claude
 * starts the bridge without a login shell, so the entry names it by its full path and puts its
 * folder, where Node usually sits too, on the PATH it runs with. The previous file is kept beside
 * it as a backup, and the new one replaces it in a single rename.
 */
export async function connectClaudeDesktop(locate: (command: string) => Promise<string | null>) {
  const bridge = await locate(MCP_BRIDGE)
  if (!bridge)
    throw new NativeError(
      `${MCP_BRIDGE} is not installed. Install @open-pencil/mcp globally, then connect again.`
    )
  const path = configPath()
  const existing = await readConfig(path)
  const config = existing ?? {}
  const servers = v.safeParse(Servers, config.mcpServers ?? {})
  if (!servers.success)
    throw new NativeError(`"mcpServers" in ${path} is not an object. Fix it, then connect again.`)
  const pathEntries = [dirname(bridge), '/usr/local/bin', '/opt/homebrew/bin', '/usr/bin', '/bin']
  const entry = {
    command: bridge,
    env: { PATH: process.platform === 'win32' ? dirname(bridge) : pathEntries.join(':') }
  }
  const next = { ...config, mcpServers: { ...servers.output, [MCP_SERVER_NAME]: entry } }
  await mkdir(dirname(path), { recursive: true })
  if (existing) await copyFile(path, `${path}.kalka-backup`)
  const temporary = `${path}.kalka-${process.pid}`
  await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
  return { path, command: bridge }
}
