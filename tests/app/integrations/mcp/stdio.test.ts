import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import { Client } from '@modelcontextprotocol/client'
import type { Subprocess } from 'bun'

import { DesktopStdioTransport } from '@/app/integrations/mcp/stdio'
import type { KalkaNative } from '@/app/platform/tauri/bridge'

import { testPath } from '#tests/helpers/paths'

type Listener = (payload: unknown) => void

/**
 * The desktop bridge as the main process implements it for stdio servers: it starts the
 * program, emits each stdout line, and writes each message to stdin.
 */
function installBridge() {
  const listeners = new Map<string, Set<Listener>>()
  const children = new Map<number, Subprocess<'pipe', 'pipe', 'pipe'>>()
  const emit = (event: string, payload: unknown) => {
    for (const listener of listeners.get(event) ?? []) listener(payload)
  }
  const kalkaNative: KalkaNative = {
    platform: process.platform,
    arch: process.arch,
    systemVersion: '',
    on(event, listener) {
      let set = listeners.get(event)
      if (!set) listeners.set(event, (set = new Set()))
      set.add(listener)
      return () => set.delete(listener)
    },
    async call<T>(name: string, ...args: unknown[]): Promise<T> {
      if (name === 'mcpStdio.start') {
        const spec = args[0] as { command: string; args: string[]; env: Record<string, string> }
        const child = Bun.spawn([spec.command, ...spec.args], {
          env: { ...process.env, ...spec.env },
          stdin: 'pipe',
          stdout: 'pipe',
          stderr: 'pipe'
        })
        children.set(child.pid, child)
        void (async () => {
          let pending = ''
          for await (const chunk of child.stdout) {
            pending += new TextDecoder().decode(chunk)
            const lines = pending.split('\n')
            pending = lines.pop() ?? ''
            for (const line of lines) if (line.trim()) emit(`mcp-stdio:${child.pid}:message`, line)
          }
          emit(`mcp-stdio:${child.pid}:close`, { code: await child.exited, stderr: '' })
        })()
        return { ok: true, value: child.pid } as T
      }
      const pid = args[0] as number
      const child = children.get(pid)
      if (name === 'mcpStdio.send') {
        void child?.stdin.write(`${args[1] as string}\n`)
        await child?.stdin.flush()
      } else if (name === 'mcpStdio.close') child?.kill()
      return { ok: true, value: null } as T
    }
  }
  // The bridge is the preload's window global; tests have no window of their own.
  Object.assign(globalThis, { window: { kalkaNative } })
  return children
}

let children: ReturnType<typeof installBridge>
beforeEach(() => {
  children = installBridge()
})
afterEach(() => {
  for (const child of children.values()) child.kill()
  Reflect.deleteProperty(globalThis, 'window')
})

describe('local MCP servers in the desktop app', () => {
  test('a stdio server answers through the main process with its environment', async () => {
    const client = new Client({ name: 'kalka', version: 'test' })
    await client.connect(
      new DesktopStdioTransport({
        command: process.execPath,
        args: [testPath('helpers/mcp/stdio-server.ts')],
        env: { NOTES_GREETING: 'Bonjour' }
      })
    )
    const { tools } = await client.listTools()
    expect(tools.map((tool) => tool.name)).toEqual(['read_note'])
    const result = await client.callTool({ name: 'read_note', arguments: { title: 'brief' } })
    expect(result.content).toEqual([{ type: 'text', text: 'Bonjour, brief' }])
    await client.close()
  })
})
