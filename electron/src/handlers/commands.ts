import { execFile } from 'node:child_process'
import { access, constants as fsConstants, realpath } from 'node:fs/promises'
import { homedir } from 'node:os'
import { delimiter, isAbsolute, join, sep } from 'node:path'

import { net } from 'electron'

import { registerAll, type CallContext } from '../ipc'
import { credentialCommands } from './credentials'
import { BUNDLED_MCP_HTTP, bundledMCPScript } from './mcp/bundled'
import { bridgeCommand, connectMCPClient, isMCPClientID, listMCPClients } from './mcp/clients'
import { buildFigFile } from './fig'
import { setChecked, setRecentFiles } from './menu'
import { takePendingOpen, takePendingRooms } from './pending'
import { renderHTMLImage, type RenderHTMLImageRequest } from './raster'
import { loginShellPath } from './shell'

const AGENT_EXECUTABLES = [
  'claude',
  'claude-agent-acp',
  'codex',
  'codex-acp',
  'gemini',
  'kalka-mcp-http',
  'kalka-harness',
  'npm'
]
const COMPANION_PACKAGES: [string, string][] = [
  ['kalka-mcp-http', '@kalka/mcp'],
  ['kalka-harness', '@kalka/harness']
]

/** Where npm, bun, Homebrew and version managers put global programs. */
function candidateDirs(): string[] {
  const home = homedir()
  const dirs = [
    join(home, '.bun/bin'),
    join(home, '.local/bin'),
    join(home, '.npm-global/bin'),
    join(home, '.volta/bin'),
    join(home, 'n/bin'),
    join(home, '.local/share/mise/shims')
  ]
  if (process.platform === 'darwin')
    dirs.push('/opt/homebrew/bin', '/usr/local/bin', '/opt/local/bin')
  if (process.platform === 'linux') dirs.push('/usr/local/bin', '/home/linuxbrew/.linuxbrew/bin')
  if (process.platform === 'win32' && process.env.APPDATA)
    dirs.push(join(process.env.APPDATA, 'npm'))
  return dirs
}

async function searchPath(): Promise<string> {
  const entries = ((await loginShellPath()) ?? process.env.PATH ?? '')
    .split(delimiter)
    .filter(Boolean)
  for (const dir of candidateDirs()) if (!entries.includes(dir)) entries.push(dir)
  return entries.join(delimiter)
}

async function which(command: string, path: string): Promise<string | null> {
  const extensions =
    process.platform === 'win32' ? (process.env.PATHEXT ?? '.EXE;.CMD;.BAT').split(';') : ['']
  for (const dir of path.split(delimiter)) {
    for (const extension of extensions) {
      const candidate = join(dir, command + extension)
      try {
        await access(candidate, fsConstants.X_OK)
        return candidate
      } catch {
        // keep looking
      }
    }
  }
  return null
}

/** A companion package's version: the first line of `--version`, if it is semver. */
function companionVersion(executable: string, path: string): Promise<string | null> {
  return new Promise((resolve) => {
    execFile(
      executable,
      ['--version', '--help'],
      { timeout: 5000, env: { ...process.env, PATH: path } },
      (error, stdout) => {
        if (error) return resolve(null)
        const line = stdout.split('\n')[0]?.trim() ?? ''
        resolve(/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(line) ? line : null)
      }
    )
  })
}

/** Path segments of `suffix` end `candidate`, ignoring case where the file system does. */
async function pathMatchesSuffix(candidate: string, suffix: string): Promise<boolean> {
  if (!suffix || isAbsolute(suffix)) return false
  const wanted = suffix.split(/[\\/]+/).filter(Boolean)
  if (wanted.some((part) => part === '.' || part === '..')) return false
  const fold =
    process.platform === 'linux' ? (part: string) => part : (part: string) => part.toLowerCase()
  const matches = (path: string) => {
    const parts = path.split(/[\\/]+/).filter(Boolean)
    if (parts.length < wanted.length) return false
    const tail = parts.slice(parts.length - wanted.length)
    return tail.every((part, index) => fold(part) === fold(wanted[index]))
  }
  if (matches(candidate)) return true
  try {
    return matches(await realpath(candidate))
  } catch {
    return false
  }
}

interface ProxyRequest {
  url: string
  method: string
  headers: { name: string; value: string }[]
  body?: number[]
  max_response_bytes?: number
  follow_redirects: boolean
  timeout_ms?: number
}

/** HTTP from the main process, which no page CORS policy applies to. */
async function proxyHttpRequest(request: ProxyRequest) {
  const url = new URL(request.url)
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    throw new Error('Only http and https are allowed')
  if (request.timeout_ms === 0) throw new Error('The timeout must be positive')
  const headers = new Headers()
  for (const { name, value } of request.headers) headers.set(name, value)
  const response = await net.fetch(url.toString(), {
    method: request.method,
    headers,
    body: request.body ? Buffer.from(request.body) : undefined,
    redirect: request.follow_redirects ? 'follow' : 'manual',
    signal: AbortSignal.timeout(request.timeout_ms ?? 30_000)
  })
  const reader = response.body?.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (reader) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (request.max_response_bytes !== undefined && size > request.max_response_bytes) {
      await reader.cancel()
      throw new Error('The response is too large')
    }
    chunks.push(value)
  }
  return {
    status: response.status,
    headers: [...response.headers].map(([name, value]) => ({ name, value })),
    body: [...Buffer.concat(chunks)],
    url: response.url || request.url
  }
}

/** Tauri's custom commands, by name; arguments arrive as the object `invoke` was given. */
const commands: Record<string, (args: never) => unknown> = {
  ...credentialCommands,
  webview_version: () => process.versions.chrome ?? null,
  take_pending_open: () => takePendingOpen(),
  take_pending_rooms: () => takePendingRooms(),
  set_recent_files: ({ paths }: { paths: string[] }) => setRecentFiles(paths),
  set_native_menu_checked: ({ id, checked }: { id: string; checked: boolean }) =>
    setChecked(id, checked),
  path_matches_suffix: ({ candidate, suffix }: { candidate: string; suffix: string }) =>
    pathMatchesSuffix(candidate, suffix),
  async mcp_lookup() {
    // The bundled server always matches the app; a global install is the fallback.
    const bundled = await bundledMCPScript(BUNDLED_MCP_HTTP)
    if (bundled) return { available: true, path: bundled, searched: [] }
    const path = await searchPath()
    const found = await which('kalka-mcp-http', path)
    const searched = [
      ...new Set([found ? found.slice(0, found.lastIndexOf(sep)) : null, ...path.split(delimiter)])
    ]
      .filter((dir): dir is string => !!dir)
      .slice(0, 12)
    return { available: found !== null, path: found, searched }
  },
  async agent_lookup() {
    const path = await searchPath()
    const executables: Record<string, string | null> = {}
    for (const command of AGENT_EXECUTABLES) executables[command] = await which(command, path)
    const versions: Record<string, string | null> = {}
    for (const [command, packageName] of COMPANION_PACKAGES) {
      const executable = executables[command]
      versions[packageName] = executable ? await companionVersion(executable, path) : null
    }
    // The app starts its own MCP server; agents reach it over HTTP, with nothing to install.
    const bundledMCP = (await bundledMCPScript(BUNDLED_MCP_HTTP)) !== null
    return { executables, versions, searchPath: path, bundledMCP }
  },
  mcp_clients: () => listMCPClients(),
  async mcp_bridge_command() {
    const path = await searchPath()
    return bridgeCommand((command) => which(command, path))
  },
  async connect_mcp_client({ id }: { id: unknown }) {
    if (!isMCPClientID(id)) throw new Error('Unknown MCP client')
    const path = await searchPath()
    return connectMCPClient(id, (command) => which(command, path), path)
  },
  proxy_http_request: ({ request }: { request: ProxyRequest }) => proxyHttpRequest(request),
  render_html_image: ({ request }: { request: RenderHTMLImageRequest }) => renderHTMLImage(request),
  build_fig_file: (input: Parameters<typeof buildFigFile>[0]) => buildFigFile(input)
}

export function registerCommandHandlers(): void {
  registerAll(
    Object.fromEntries(
      Object.entries(commands).map(([name, command]) => [
        name,
        (_context: CallContext, args: never) => command(args)
      ])
    ),
    'command'
  )
}
