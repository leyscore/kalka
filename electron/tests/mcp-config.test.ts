import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { chmod, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parse as parseJSONC } from 'jsonc-parser'
import { parse as parseTOML } from 'smol-toml'

import {
  cliCommandLine,
  quoteWindowsArgument,
  runCLI,
  withPath,
  type CLIResult
} from '../src/handlers/mcp/cli'
import { clientDefinitions, FORMATS, type BridgeCommand } from '../src/handlers/mcp/config/clients'
import { ConfigFileError, setServer, type ServerEdit } from '../src/handlers/mcp/config/edit'
import { BACKUP_SUFFIX, hasServer, writeServer } from '../src/handlers/mcp/config/file'
import {
  CLAUDE_CODE_CLI,
  connectClient,
  MCPClientError,
  type MCPClientFailure
} from '../src/handlers/mcp/connect'

const bridge = { command: '/Applications/Kalka.app/kalka', args: ['/x/stdio.js'], env: { A: '1' } }

function jsonEdit(path: string[] = ['mcpServers']): ServerEdit {
  return { syntax: 'json', path, name: 'kalka', entry: FORMATS.mcpServers.entry(bridge) }
}

/** The parsed file, typed loosely so it compares with plain objects. */
function readTOML(text: string): unknown {
  return parseTOML(text)
}

const tomlEdit: ServerEdit = {
  syntax: 'toml',
  path: ['mcp_servers'],
  name: 'kalka',
  entry: FORMATS.codex.entry(bridge)
}

describe('JSON configuration', () => {
  test('creates the servers table in an empty file', () => {
    const text = setServer('', jsonEdit())
    expect(JSON.parse(text)).toEqual({ mcpServers: { kalka: FORMATS.mcpServers.entry(bridge) } })
  })

  test('keeps comments, trailing commas and other servers', () => {
    const original = [
      '// Zed settings',
      '{',
      '  "theme": "One Dark", // the user likes it',
      '  "context_servers": {',
      '    /* docs server */',
      '    "docs": { "command": "docs-mcp" },',
      '  },',
      '}',
      ''
    ].join('\n')
    const text = setServer(original, jsonEdit(['context_servers']))
    expect(text).toContain('// Zed settings')
    expect(text).toContain('// the user likes it')
    expect(text).toContain('/* docs server */')
    const parsed: unknown = parseJSONC(text, [], { allowTrailingComma: true })
    expect(parsed).toEqual({
      theme: 'One Dark',
      context_servers: { docs: { command: 'docs-mcp' }, kalka: FORMATS.mcpServers.entry(bridge) }
    })
  })

  test('replaces an earlier Kalka entry and is idempotent', () => {
    const original = '{\n\t"mcpServers": {\n\t\t"kalka": { "command": "old" }\n\t}\n}\n'
    const once = setServer(original, jsonEdit())
    expect(once).toContain('\t\t"kalka"')
    expect(setServer(once, jsonEdit())).toBe(once)
  })

  test('rejects text that does not parse, and a servers key that is not an object', () => {
    expect(() => setServer('{ "mcpServers": ', jsonEdit())).toThrow(ConfigFileError)
    expect(() => setServer('{ "mcpServers": [] }', jsonEdit())).toThrow(ConfigFileError)
  })
})

describe('TOML configuration', () => {
  test('appends the server and keeps comments and other tables', () => {
    const original = [
      '# Codex settings',
      'model = "gpt-5" # default model',
      '',
      '[mcp_servers.docs]',
      'command = "docs-mcp"',
      ''
    ].join('\n')
    const text = setServer(original, tomlEdit)
    expect(text.startsWith(original.trimEnd())).toBe(true)
    expect(readTOML(text)).toEqual({
      model: 'gpt-5',
      mcp_servers: { docs: { command: 'docs-mcp' }, kalka: FORMATS.codex.entry(bridge) }
    })
  })

  test('replaces the server tables in place, with the comments around them', () => {
    const original = [
      '[mcp_servers.kalka]',
      'command = "old"',
      '',
      '[mcp_servers.kalka.env]',
      'OLD = "1"',
      '',
      '# the docs server',
      '[mcp_servers.docs]',
      'command = "docs-mcp"',
      ''
    ].join('\n')
    const text = setServer(original, tomlEdit)
    expect(text).toContain('# the docs server\n[mcp_servers.docs]')
    expect(text.indexOf('[mcp_servers.kalka]')).toBeLessThan(text.indexOf('[mcp_servers.docs]'))
    expect(readTOML(text)).toEqual({
      mcp_servers: { kalka: FORMATS.codex.entry(bridge), docs: { command: 'docs-mcp' } }
    })
    expect(setServer(text, tomlEdit)).toBe(text)
  })

  test('rewrites a file that defines the server inline, keeping its values', () => {
    const original = 'mcp_servers = { kalka = { command = "old" }, docs = { command = "d" } }\n'
    const text = setServer(original, tomlEdit)
    expect(readTOML(text)).toEqual({
      mcp_servers: { kalka: FORMATS.codex.entry(bridge), docs: { command: 'd' } }
    })
  })

  test('rejects text that does not parse', () => {
    expect(() => setServer('[mcp_servers', tomlEdit)).toThrow(ConfigFileError)
  })
})

describe('configuration files', () => {
  let dir: string
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'kalka-mcp-config-'))
  })
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  test('creates a missing file and its folders without a backup', async () => {
    const file = join(dir, 'nested', 'mcp.json')
    expect(await writeServer(file, jsonEdit())).toBe('written')
    expect(await hasServer(file, 'json', ['mcpServers'], 'kalka')).toBe(true)
    expect(await readdir(join(dir, 'nested'))).toEqual(['mcp.json'])
  })

  test('backs up the previous file and keeps its permissions', async () => {
    const file = join(dir, '.claude.json')
    const original = '{ "projects": {} }\n'
    await writeFile(file, original, { mode: 0o600 })
    await writeServer(file, jsonEdit())
    expect(await readFile(`${file}${BACKUP_SUFFIX}`, 'utf8')).toBe(original)
    expect((await stat(file)).mode & 0o777).toBe(0o600)
    expect(await hasServer(file, 'json', ['mcpServers'], 'kalka')).toBe(true)
  })

  test('writes nothing when Kalka is already there', async () => {
    const file = join(dir, 'config.toml')
    await writeServer(file, tomlEdit)
    const before = await readFile(file, 'utf8')
    expect(await writeServer(file, tomlEdit)).toBe('unchanged')
    expect(await readFile(file, 'utf8')).toBe(before)
    expect(await readdir(dir)).toEqual(['config.toml'])
  })

  test('reports a missing or broken file as not connected', async () => {
    expect(await hasServer(join(dir, 'none.json'), 'json', ['mcpServers'], 'kalka')).toBe(false)
    await mkdir(join(dir, 'broken'))
    await writeFile(join(dir, 'broken', 'mcp.json'), '{ nope')
    expect(await hasServer(join(dir, 'broken', 'mcp.json'), 'json', ['mcpServers'], 'kalka')).toBe(
      false
    )
  })
})

describe('client locations', () => {
  test('macOS', () => {
    const clients = clientDefinitions({ home: '/Users/u', platform: 'darwin' })
    expect(clients.kiro.file).toBe('/Users/u/.kiro/settings/mcp.json')
    expect(clients.antigravity.file).toBe('/Users/u/.gemini/config/mcp_config.json')
    expect(clients.zed.file).toBe('/Users/u/.config/zed/settings.json')
    expect(clients['claude-desktop'].file).toBe(
      '/Users/u/Library/Application Support/Claude/claude_desktop_config.json'
    )
  })

  test('Linux follows XDG_CONFIG_HOME', () => {
    const clients = clientDefinitions({ home: '/home/u', platform: 'linux', xdgConfigHome: '/cfg' })
    expect(clients.zed.file).toBe('/cfg/zed/settings.json')
    expect(clients.vscode.file).toBe('/cfg/Code/User/mcp.json')
    expect(clients.kiro.file).toBe('/home/u/.kiro/settings/mcp.json')
  })

  test('Windows', () => {
    const clients = clientDefinitions({
      home: 'C:\\Users\\u',
      platform: 'win32',
      appData: 'C:\\Users\\u\\AppData\\Roaming'
    })
    expect(clients.zed.file).toBe('C:\\Users\\u\\AppData\\Roaming\\Zed\\settings.json')
    expect(clients.kiro.file).toBe('C:\\Users\\u\\.kiro\\settings\\mcp.json')
    expect(clients.antigravity.file).toBe('C:\\Users\\u\\.gemini\\config\\mcp_config.json')
  })
})

/** The bundled bridge as an installed Windows app starts it. */
const windowsBridge: BridgeCommand = {
  command: 'C:\\Users\\Jane Doe\\AppData\\Local\\Programs\\Kalka\\Kalka.exe',
  args: [
    'C:\\Users\\Jane Doe\\AppData\\Local\\Programs\\Kalka\\resources\\app.asar.unpacked\\dist\\mcp\\stdio.js'
  ],
  env: { ELECTRON_RUN_AS_NODE: '1' }
}

/** `CommandLineToArgvW`: how a Windows program, Node among them, splits its command line. */
function parseArgv(line: string): string[] {
  const args: string[] = []
  let current = ''
  let quoted = false
  let started = false
  for (let index = 0; index < line.length; index++) {
    let backslashes = 0
    while (line[index] === '\\') {
      backslashes++
      index++
    }
    const char = line[index]
    if (char === '"') {
      current += '\\'.repeat(Math.floor(backslashes / 2))
      if (backslashes % 2 === 1) current += '"'
      else quoted = !quoted
      started = true
      continue
    }
    current += '\\'.repeat(backslashes)
    if (char === undefined) break
    if ((char === ' ' || char === '\t') && !quoted) {
      if (started) args.push(current)
      current = ''
      started = false
      continue
    }
    current += char
    started = true
  }
  if (started) args.push(current)
  return args
}

/**
 * One `cmd.exe` parse of a line: carets outside quotes escape the next character, and an
 * unescaped operator outside quotes would end the command there.
 */
function cmdParse(line: string): string {
  let out = ''
  let quoted = false
  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    if (char === '^' && !quoted) {
      out += line[++index] ?? ''
      continue
    }
    if (char === '"') quoted = !quoted
    else if (!quoted && '&|<>'.includes(char)) throw new Error(`cmd.exe would split at ${char}`)
    out += char
  }
  return out
}

describe('Windows command lines', () => {
  test('quotes arguments the way Windows programs split them back', () => {
    for (const argument of [
      '',
      'plain',
      'with space',
      'C:\\path with\\trailing\\',
      'say "hi"',
      'back\\"slash',
      JSON.stringify(FORMATS.mcpServersTyped.entry(windowsBridge))
    ]) {
      expect(parseArgv(quoteWindowsArgument(argument))).toEqual([argument])
    }
  })

  test('runs programs directly outside Windows and executables on Windows', () => {
    expect(cliCommandLine('/usr/local/bin/claude', ['mcp', 'list'], 'darwin')).toEqual({
      command: '/usr/local/bin/claude',
      args: ['mcp', 'list']
    })
    const exe = 'C:\\Users\\Jane Doe\\.local\\bin\\claude.exe'
    expect(cliCommandLine(exe, ['mcp', 'list'], 'win32')).toEqual({
      command: exe,
      args: ['mcp', 'list']
    })
  })

  test('runs an npm shim through cmd.exe with arguments that survive both parses', () => {
    const shim = 'C:\\Users\\Jane Doe\\AppData\\Roaming\\npm\\claude.CMD'
    const args = CLAUDE_CODE_CLI.add(windowsBridge)
    const line = cliCommandLine(shim, args, 'win32', 'C:\\Windows\\system32\\cmd.exe')
    expect(line?.command).toBe('C:\\Windows\\system32\\cmd.exe')
    expect(line?.windowsVerbatimArguments).toBe(true)
    expect(line?.args.slice(0, 3)).toEqual(['/d', '/s', '/c'])
    const quoted = line?.args[3] ?? ''
    // `/s` strips the outer quotes; cmd.exe then parses the line once to start the shim.
    expect(quoted.startsWith('"') && quoted.endsWith('"')).toBe(true)
    const first = cmdParse(quoted.slice(1, -1))
    const program = 'C:\\Users\\Jane Doe\\AppData\\Roaming\\npm\\claude.CMD'
    expect(first.startsWith(`${program} `)).toBe(true)
    // The shim hands `%*` on, which cmd.exe parses again before Node reads it.
    const forwarded = cmdParse(first.slice(program.length + 1))
    expect(parseArgv(forwarded)).toEqual(args)
  })

  test('keeps metacharacters literal through cmd.exe', () => {
    const args = ['a&b', 'c|d', '(e)', '<f>', 'g^h', 'semi;colon,comma', 'say "x"', 'x"&"y']
    const line = cliCommandLine('C:\\npm\\tool.bat', args, 'win32', 'cmd.exe')
    const first = cmdParse((line?.args[3] ?? '').slice(1, -1))
    expect(first.startsWith('C:\\npm\\tool.bat ')).toBe(true)
    expect(parseArgv(cmdParse(first.slice('C:\\npm\\tool.bat '.length)))).toEqual(args)
  })

  test('refuses arguments cmd.exe would expand', () => {
    expect(cliCommandLine('C:\\npm\\claude.cmd', ['%APPDATA%'], 'win32')).toBeNull()
    expect(cliCommandLine('C:\\npm\\claude.cmd', ['wow!'], 'win32')).toBeNull()
    expect(cliCommandLine('C:\\npm\\claude.cmd', ['two\nlines'], 'win32')).toBeNull()
  })

  test('replaces every spelling of PATH', () => {
    const env = withPath({ Path: 'C:\\old', HOME: 'h' }, 'C:\\new')
    expect(env).toEqual({ PATH: 'C:\\new', HOME: 'h' })
  })
})

describe('Claude Code CLI', () => {
  test('adds the entry as one JSON argument at user scope', () => {
    const args = CLAUDE_CODE_CLI.add(windowsBridge)
    expect(args.slice(0, 5)).toEqual(['mcp', 'add-json', '--scope', 'user', 'kalka'])
    expect(JSON.parse(args[5] ?? '')).toEqual({
      type: 'stdio',
      command: windowsBridge.command,
      args: windowsBridge.args,
      env: { ELECTRON_RUN_AS_NODE: '1' }
    })
    expect(CLAUDE_CODE_CLI.remove).toEqual(['mcp', 'remove', '--scope', 'user', 'kalka'])
  })
})

describe('connecting a client', () => {
  let home: string
  beforeEach(async () => {
    home = await mkdtemp(join(tmpdir(), 'kalka-mcp-connect-'))
  })
  afterEach(async () => {
    await rm(home, { recursive: true, force: true })
  })

  const claudeCode = () => clientDefinitions({ home, platform: process.platform })['claude-code']

  function recorder(results: CLIResult[]) {
    const calls: string[][] = []
    const run = (_executable: string, args: string[]) => {
      calls.push(args)
      return Promise.resolve(results[calls.length - 1] ?? { ok: true, output: '' })
    }
    return { calls, run }
  }

  async function readServers(file: string): Promise<unknown> {
    const parsed: unknown = parseJSONC(await readFile(file, 'utf8'))
    return parsed
  }

  test('replaces the entry through the CLI and leaves the file to it', async () => {
    const { calls, run } = recorder([
      { ok: false, output: 'No MCP server found with name: kalka' },
      { ok: true, output: 'Added stdio MCP server kalka' }
    ])
    const route = await connectClient({
      client: claudeCode(),
      bridge: windowsBridge,
      cli: { definition: CLAUDE_CODE_CLI, executable: 'claude' },
      path: '',
      run
    })
    expect(route).toEqual({ via: 'cli' })
    expect(calls).toEqual([CLAUDE_CODE_CLI.remove, CLAUDE_CODE_CLI.add(windowsBridge)])
    expect(await Bun.file(claudeCode().file).exists()).toBe(false)
  })

  test('edits the file when the CLI fails, keeping its output and the other settings', async () => {
    const client = claudeCode()
    await writeFile(
      client.file,
      JSON.stringify({ numStartups: 3, mcpServers: { docs: { command: 'docs-mcp' } } }, null, 2)
    )
    const { run } = recorder([
      { ok: true, output: '' },
      { ok: false, output: 'Error: spawn EINVAL' }
    ])
    const route = await connectClient({
      client,
      bridge: windowsBridge,
      cli: { definition: CLAUDE_CODE_CLI, executable: 'claude.cmd' },
      path: '',
      run
    })
    expect(route).toEqual({ via: 'file', cliOutput: 'Error: spawn EINVAL' })
    expect(await readServers(client.file)).toEqual({
      numStartups: 3,
      mcpServers: {
        docs: { command: 'docs-mcp' },
        kalka: FORMATS.mcpServersTyped.entry(windowsBridge)
      }
    })
  })

  test('reports a file it cannot fix with the CLI output as details', async () => {
    const client = claudeCode()
    await writeFile(client.file, '{ "mcpServers": ')
    const { run } = recorder([
      { ok: true, output: '' },
      { ok: false, output: 'Claude Code on Windows requires git-bash' }
    ])
    const failure = await connectClient({
      client,
      bridge: windowsBridge,
      cli: { definition: CLAUDE_CODE_CLI, executable: 'claude.cmd' },
      path: '',
      run
    }).then(
      () => null,
      (error: unknown) => (error instanceof MCPClientError ? error.failure : null)
    )
    expect(failure).toMatchObject({
      code: 'config-invalid',
      client: 'Claude Code',
      file: client.file,
      syntax: 'JSON'
    } satisfies Partial<MCPClientFailure>)
    expect(failure && 'details' in failure ? failure.details : '').toContain('requires git-bash')
  })

  test('writes the file directly for a client without a CLI', async () => {
    const { calls, run } = recorder([])
    const client = claudeCode()
    expect(await connectClient({ client, bridge: windowsBridge, path: '', run })).toEqual({
      via: 'file'
    })
    expect(calls).toEqual([])
    expect(await readServers(client.file)).toEqual({
      mcpServers: { kalka: FORMATS.mcpServersTyped.entry(windowsBridge) }
    })
  })
})

describe.skipIf(process.platform === 'win32')('running a CLI', () => {
  let dir: string
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'kalka-mcp-cli-'))
  })
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  test('keeps what a failing command printed', async () => {
    const script = join(dir, 'claude')
    await writeFile(script, '#!/bin/sh\necho "kalka already exists" >&2\nexit 1\n')
    await chmod(script, 0o755)
    const result = await runCLI(script, ['mcp', 'add-json'], '/usr/bin:/bin')
    expect(result.ok).toBe(false)
    expect(result.output).toContain('kalka already exists')
  })

  test('passes arguments through unchanged', async () => {
    const script = join(dir, 'claude')
    await writeFile(script, '#!/bin/sh\nfor a in "$@"; do printf "%s\\n" "$a"; done\n')
    await chmod(script, 0o755)
    const json = JSON.stringify(FORMATS.mcpServersTyped.entry(windowsBridge))
    const result = await runCLI(script, ['add-json', json], '/usr/bin:/bin')
    expect(result).toEqual({ ok: true, output: `add-json\n${json}` })
  })
})
