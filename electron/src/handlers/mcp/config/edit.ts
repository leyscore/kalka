import { isDeepStrictEqual } from 'node:util'

import { applyEdits, modify, parse as parseJSONC, type ParseError } from 'jsonc-parser'
import { parse as parseTOML, stringify as stringifyTOML } from 'smol-toml'

/**
 * Text-level edits of MCP client configuration files. Each edit changes only the server entry it
 * owns and leaves the rest of the text as the user wrote it: comments, key order, indentation and
 * trailing commas in JSON with comments, comments and table order in TOML.
 */
export type ConfigSyntax = 'json' | 'toml'

/** Why a file cannot be edited safely: it does not parse, or a key holds something unexpected. */
export class ConfigFileError extends Error {
  constructor(
    readonly reason: 'syntax' | 'shape',
    message: string
  ) {
    super(message)
  }
}

type Table = Record<string, unknown>

function isTable(value: unknown): value is Table {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The file's root object. Comments and trailing commas are accepted in JSON, as editors write them. */
export function parseConfig(syntax: ConfigSyntax, text: string): Table {
  if (!text.trim()) return {}
  if (syntax === 'toml') {
    try {
      return parseTOML(text)
    } catch (error) {
      throw new ConfigFileError('syntax', error instanceof Error ? error.message : String(error))
    }
  }
  const errors: ParseError[] = []
  const root: unknown = parseJSONC(text, errors, { allowTrailingComma: true })
  if (errors.length > 0)
    throw new ConfigFileError('syntax', `JSON error at offset ${errors[0].offset}`)
  if (!isTable(root)) throw new ConfigFileError('shape', 'The file does not hold an object')
  return root
}

/** The servers table at `path`, empty when the file has none, or an error when it is not a table. */
export function serversAt(root: Table, path: readonly string[]): Table {
  let node: unknown = root
  for (const key of path) {
    if (!isTable(node)) break
    node = node[key]
  }
  if (node === undefined) return {}
  if (!isTable(node)) throw new ConfigFileError('shape', `"${path.join('.')}" is not an object`)
  return node
}

export interface ServerEdit {
  syntax: ConfigSyntax
  /** Where the client keeps its servers, such as `['mcpServers']`. */
  path: readonly string[]
  name: string
  entry: Table
}

/**
 * The file's text with `entry` stored as server `name`. Returns the text unchanged when the
 * entry is already there, so connecting twice writes nothing.
 */
export function setServer(text: string, edit: ServerEdit): string {
  const root = parseConfig(edit.syntax, text)
  const servers = serversAt(root, edit.path)
  if (sameEntry(edit.syntax, servers[edit.name], edit.entry)) return text
  return edit.syntax === 'toml' ? setTOMLServer(text, root, edit) : setJSONServer(text, edit)
}

/** Compares through the parser in TOML, whose tables have no prototype. */
function sameEntry(syntax: ConfigSyntax, current: unknown, entry: Table): boolean {
  if (current === undefined) return false
  const wanted = syntax === 'toml' ? parseTOML(stringifyTOML({ entry })).entry : entry
  return isDeepStrictEqual(current, wanted)
}

function setJSONServer(text: string, edit: ServerEdit): string {
  if (!text.trim())
    return `${JSON.stringify(nest([...edit.path, edit.name], edit.entry), null, 2)}\n`
  const indent = /^([ \t]+)\S/m.exec(text)?.[1] ?? '  '
  const edits = modify(text, [...edit.path, edit.name], edit.entry, {
    formattingOptions: {
      insertSpaces: !indent.startsWith('\t'),
      tabSize: indent.startsWith('\t') ? 1 : indent.length,
      eol: text.includes('\r\n') ? '\r\n' : '\n'
    }
  })
  return applyEdits(text, edits)
}

function nest(path: readonly string[], value: Table): Table {
  return path.reduceRight<Table>((inner, key) => ({ [key]: inner }), value)
}

/** A TOML table header's key with whitespace and quotes removed: `[ "a" . b ]` reads `a.b`. */
function headerKey(line: string): string | null {
  const match = /^\s*\[\[?([^\]]+)\]\]?\s*(?:#.*)?$/.exec(line)
  return match ? match[1].replace(/\s+/g, '').replace(/["']/g, '') : null
}

const TRIVIA = /^\s*(?:#.*)?$/

/**
 * Replaces the server's tables in place, or appends them, so the rest of the file keeps its
 * comments and layout. A file that defines the server another way (inline tables, dotted keys)
 * falls back to a full rewrite, which keeps every value but not the comments.
 */
function setTOMLServer(text: string, root: Table, edit: ServerEdit): string {
  const expected = structuredClone(root)
  let node = expected
  for (const key of edit.path) {
    if (!isTable(node[key])) node[key] = {}
    node = node[key] as Table
  }
  node[edit.name] = edit.entry

  const rewritten = `${stringifyTOML(expected).trimEnd()}\n`
  const spliced = spliceTOML(text, [...edit.path, edit.name].join('.'), edit)
  try {
    // Both sides come from the parser, so their tables have the same prototypes.
    if (isDeepStrictEqual(parseTOML(spliced), parseTOML(rewritten))) return spliced
  } catch {
    // The splice produced duplicate keys; rewrite the whole file instead.
  }
  return rewritten
}

function spliceTOML(text: string, prefix: string, edit: ServerEdit): string {
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const block = stringifyTOML(nest([...edit.path, edit.name], edit.entry))
    .trim()
    .split('\n')
    // Keep only the server's own tables, should the writer ever emit empty parent headers.
    .filter((line) => {
      const key = headerKey(line)
      return key === null || key === prefix || key.startsWith(`${prefix}.`)
    })
  const lines = text.split(/\r?\n/)
  const output: string[] = []
  let removed: string[] | null = null
  let insertAt = -1
  for (const line of lines) {
    const key = headerKey(line)
    if (key !== null) {
      const owned = key === prefix || key.startsWith(`${prefix}.`)
      if (owned && removed === null) {
        removed = []
        if (insertAt < 0) insertAt = output.length
      } else if (!owned && removed !== null) {
        // Comments and blank lines just above the next table belong to it.
        let keep = removed.length
        while (keep > 0 && TRIVIA.test(removed[keep - 1])) keep--
        output.push(...removed.slice(keep))
        removed = null
      }
    }
    if (removed !== null) removed.push(line)
    else output.push(line)
  }
  if (removed !== null) {
    // Comments after the server's tables at the end of the file stay.
    let keep = removed.length
    while (keep > 0 && TRIVIA.test(removed[keep - 1])) keep--
    const trailing = removed.slice(keep)
    while (trailing.length > 0 && trailing[0].trim() === '') trailing.shift()
    if (trailing.length > 0) output.push('', ...trailing)
  }
  if (insertAt < 0) {
    while (output.length > 0 && output[output.length - 1].trim() === '') output.pop()
    if (output.length > 0) output.push('')
    output.push(...block, '')
  } else {
    const next = output[insertAt]
    const spacer = next !== undefined && next.trim() !== '' ? [''] : []
    output.splice(insertAt, 0, ...block, ...spacer)
    if (output[output.length - 1] !== '') output.push('')
  }
  return output.join(eol)
}
