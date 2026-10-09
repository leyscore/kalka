import { describe, expect, test } from 'bun:test'

import { formatCommandLine, parseCommandLine } from '@/app/integrations/mcp/command-line'
import { parseEnvironment } from '@/app/integrations/mcp/environment'

describe('stdio server command lines', () => {
  test('split into the program and its arguments', () => {
    expect(parseCommandLine('npx -y @notionhq/notion-mcp-server')).toEqual({
      command: 'npx',
      args: ['-y', '@notionhq/notion-mcp-server']
    })
  })

  test('quotes keep spaces and nothing is expanded', () => {
    expect(parseCommandLine(`node "/Users/me/My Servers/a.js" '$HOME' a\\ b`)).toEqual({
      command: 'node',
      args: ['/Users/me/My Servers/a.js', '$HOME', 'a b']
    })
  })

  test('an empty line or an open quote is not a command', () => {
    expect(parseCommandLine('   ')).toBeNull()
    expect(parseCommandLine('node "unterminated')).toBeNull()
  })

  test('format reads back as the same command', () => {
    const line = { command: 'node', args: ['/a b/c.js', "it's", '', '--flag'] }
    expect(parseCommandLine(formatCommandLine(line))).toEqual(line)
  })
})

describe('stdio server environments', () => {
  test('read KEY=value lines as pasted from a README', () => {
    expect(
      parseEnvironment('# Notion\nNOTION_TOKEN="secret value"\n\nexport DEBUG=1\nURL=https://a?b=c')
    ).toEqual({
      ok: true,
      env: { NOTION_TOKEN: 'secret value', DEBUG: '1', URL: 'https://a?b=c' }
    })
  })

  test('name the first line that is not a variable', () => {
    expect(parseEnvironment('A=1\nnot a variable\nB=2')).toEqual({ ok: false, line: 2 })
    expect(parseEnvironment('1BAD=x')).toEqual({ ok: false, line: 1 })
  })
})
