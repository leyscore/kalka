import {
  deserializeMessage,
  type JSONRPCMessage,
  type Transport
} from '@modelcontextprotocol/client'
import * as v from 'valibot'

import { call, native } from '@/app/platform/tauri/bridge'

/** A stdio server to start: its program, arguments and the environment it needs. */
export interface StdioServerSpec {
  command: string
  args: string[]
  env: Record<string, string>
}

const ServerClosed = v.object({ code: v.nullable(v.number()), stderr: v.string() })

/**
 * A stdio MCP server, started by the desktop app's main process. Messages travel one JSON-RPC
 * message per line over the server's stdin and stdout; the first start of a command line asks
 * the person to allow it in a native dialog.
 */
export class DesktopStdioTransport implements Transport {
  onmessage?: (message: JSONRPCMessage) => void
  onclose?: () => void
  onerror?: (error: Error) => void
  private pid: number | null = null
  private unsubscribe: (() => void)[] = []

  constructor(private readonly spec: StdioServerSpec) {}

  async start(): Promise<void> {
    const pid = await call<number>('mcpStdio.start', this.spec)
    this.pid = pid
    const bridge = native()
    this.unsubscribe.push(
      bridge.on(`mcp-stdio:${pid}:message`, (line) => {
        if (typeof line !== 'string') return
        try {
          this.onmessage?.(deserializeMessage(line))
        } catch (error) {
          this.onerror?.(error instanceof Error ? error : new Error(String(error)))
        }
      }),
      bridge.on(`mcp-stdio:${pid}:close`, (payload) => {
        const closed = v.safeParse(ServerClosed, payload)
        if (closed.success && closed.output.code) {
          const detail = closed.output.stderr.trim().split('\n').at(-1) ?? ''
          this.onerror?.(
            new Error(`The MCP server exited with code ${closed.output.code}. ${detail}`.trim())
          )
        }
        this.stop()
        this.onclose?.()
      })
    )
  }

  async send(message: JSONRPCMessage): Promise<void> {
    if (this.pid === null) throw new Error('The MCP server is not running')
    await call('mcpStdio.send', this.pid, JSON.stringify(message))
  }

  async close(): Promise<void> {
    const pid = this.pid
    this.stop()
    if (pid !== null) await call('mcpStdio.close', pid).catch(() => undefined)
    this.onclose?.()
  }

  private stop(): void {
    for (const unsubscribe of this.unsubscribe) unsubscribe()
    this.unsubscribe = []
    this.pid = null
  }
}
