import { Client, type ClientCapabilities } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

export interface StdioClientOptions {
  /** What the client declares it can do for the server. */
  capabilities?: ClientCapabilities
  /** Called before the client connects, such as to answer the server's requests. */
  prepare?: (client: Client) => void
}

/**
 * Starts the stdio bridge as a child process and connects an SDK client to it, resolving once the
 * bridge reports it reached the MCP server.
 */
export async function createStdioClient(
  socketPath: string,
  authToken: string | null,
  options: StdioClientOptions = {}
) {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('KALKA_MCP_') && value !== undefined) {
      env[key] = value
    }
  }
  if (process.env.KALKA_MCP_DISCOVERY_PATH) {
    env.KALKA_MCP_DISCOVERY_PATH = process.env.KALKA_MCP_DISCOVERY_PATH
  }
  env.PATH = process.env.PATH ?? ''
  // Only set KALKA_MCP_SOCKET when a socket path exists.
  // An empty string on Windows would break the stdio bridge's transport
  // discovery (it would try to connect to an empty socket path).
  if (socketPath) {
    env.KALKA_MCP_SOCKET = socketPath
  }
  if (authToken) {
    env.KALKA_MCP_AUTH_TOKEN = authToken
  }
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['packages/mcp/src/stdio.ts'],
    env,
    stderr: 'pipe'
  })

  const client = new Client(
    { name: 'test-stdio-client', version: '0.0.0' },
    { capabilities: options.capabilities ?? {} }
  )
  options.prepare?.(client)

  let stderrBuffer = ''

  // The bridge must reach the MCP server before tool calls can be sent.
  // Wait for the stderr readiness marker — this confirms server reachability
  // and ready=true, but document/browser availability is still checked per
  // tool call.
  // Also reject on timeout or stream end so the test fails fast if the
  // bridge never connects.
  const BRIDGE_TIMEOUT = 10_000
  const bridgeConnected = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Bridge did not connect within timeout'))
    }, BRIDGE_TIMEOUT)

    const stderr = transport.stderr
    if (stderr && 'on' in stderr) {
      const stream = stderr as NodeJS.ReadableStream
      stream.on('data', (chunk: Buffer) => {
        // Buffer stderr so the readiness marker is not missed if it
        // straddles a chunk boundary.
        stderrBuffer += chunk.toString()
        if (stderrBuffer.includes('Connected to Kalka')) {
          clearTimeout(timer)
          resolve()
        }
      })
      stream.on('end', () => {
        clearTimeout(timer)
        reject(new Error('Bridge stderr stream ended before connection'))
      })
      stream.on('error', (err: Error) => {
        clearTimeout(timer)
        reject(new Error(`Bridge stderr error: ${err.message}`))
      })
    } else {
      clearTimeout(timer)
      reject(new Error('No stderr stream available'))
    }
  })

  // Start the MCP session and wait for the bridge to be ready in parallel.
  // client.connect() handles the JSON-RPC initialize/handshake;
  // bridgeConnected confirms the bridge can actually reach the server.
  try {
    await Promise.all([client.connect(transport), bridgeConnected])
  } catch (err) {
    await client.close().catch(() => undefined)
    await transport.close().catch(() => undefined)
    throw err
  }

  return { client, transport, stderrText: () => stderrBuffer }
}
