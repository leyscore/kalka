import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parse as parseJSONC } from 'jsonc-parser'
import { parse as parseTOML } from 'smol-toml'

import { clientDefinitions, FORMATS } from '../src/handlers/mcp/config/clients'
import { ConfigFileError, setServer, type ServerEdit } from '../src/handlers/mcp/config/edit'
import { BACKUP_SUFFIX, hasServer, writeServer } from '../src/handlers/mcp/config/file'

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
