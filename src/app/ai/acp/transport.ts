import { ClientSideConnection, ndJsonStream, PROTOCOL_VERSION } from '@agentclientprotocol/sdk'
import type {
  Client,
  ContentBlock,
  InitializeResponse,
  SessionNotification,
  RequestPermissionRequest,
  RequestPermissionResponse
} from '@agentclientprotocol/sdk'
import type { ChatTransport, FileUIPart, UIMessage, UIMessageChunk } from 'ai'
import { compact } from 'es-toolkit'
import { isValid } from 'js-base64'

import type { ACPAgentDef } from '@kalka/core/constants'

import SYSTEM_PROMPT from '@/app/ai/chat/system-prompt'
import { describeDiagnosticError, recordACPTransportFailure } from '@/app/diagnostics'
import { buildACPMCPServers } from '@/app/integrations/mcp'
import { errorSummary } from '@/app/runtime/error'

import { mapUpdate } from './map-update'
import { spawnACPProcess } from './process'

type TauriChild = Awaited<ReturnType<typeof spawnACPProcess>>['child']

interface ACPSession {
  connection: ClientSideConnection
  sessionId: string
  child: TauriChild
  onUpdate: ((params: SessionNotification) => void) | null
  dead: boolean
  /** Whether the agent said it reads images in a prompt. */
  readsImages: boolean
}

function isMissingCommandError(message: string): boolean {
  const normalized = message.toLowerCase()
  return normalized.includes('enoent') || normalized.includes('program not found')
}

function missingCommandMessage(agentDef?: ACPAgentDef): string {
  if (!agentDef) return 'ACP agent CLI is not installed.'
  if (!agentDef.installCommand) {
    return `"${agentDef.command}" is not installed. Install it and restart Kalka.`
  }
  return `"${agentDef.command}" is not installed. Install it with: ${agentDef.installCommand}`
}

/**
 * A readable message for a failure to reach or run the agent. Agents reject with JSON-RPC
 * error objects, so the message is read from the object, never `String()` of it.
 */
export function formatConnectionError(e: unknown, agentDef?: ACPAgentDef): string {
  const msg = errorSummary(e)
  if (
    msg.includes('ECONNREFUSED') ||
    msg.includes('fetch failed') ||
    msg.includes('Failed to fetch')
  ) {
    return 'MCP server is not running. Make sure the editor is open.'
  }
  if (msg.includes('timeout') || msg.includes('Timeout') || msg.includes('ETIMEDOUT')) {
    return 'MCP server did not respond in time.'
  }
  if (isMissingCommandError(msg)) {
    return missingCommandMessage(agentDef)
  }
  return msg
}

/** Keeps the agent's own error as the cause, so its code still classifies the failure. */
function startupError(error: unknown, agentDef: ACPAgentDef): Error {
  recordACPTransportFailure({ operation: 'start', ...describeDiagnosticError(error) })
  return new Error(formatConnectionError(error, agentDef), { cause: error })
}

/** An agent process that answered `initialize`. */
export interface ACPConnection {
  connection: ClientSideConnection
  child: TauriChild
  initialized: InitializeResponse
}

interface ACPConnectionOptions {
  agentDef: ACPAgentDef
  client: Client
  destroying: () => boolean
  onUnexpectedClose: () => void
}

/** Starts the agent and initializes it; a failure stops the process and records why. */
export async function openACPConnection({
  agentDef,
  client,
  destroying,
  onUnexpectedClose
}: ACPConnectionOptions): Promise<ACPConnection> {
  let process: Awaited<ReturnType<typeof spawnACPProcess>>
  try {
    process = await spawnACPProcess({
      command: agentDef.command,
      args: agentDef.args,
      logId: agentDef.id,
      destroying,
      onUnexpectedClose
    })
  } catch (e) {
    throw startupError(e, agentDef)
  }
  const { child, input, output } = process
  const connection = new ClientSideConnection(() => client, ndJsonStream(input, output))
  try {
    const initialized = await connection.initialize({
      protocolVersion: PROTOCOL_VERSION,
      clientCapabilities: {}
    })
    return { connection, child, initialized }
  } catch (e) {
    await child.kill().catch(() => undefined)
    throw startupError(e, agentDef)
  }
}

export function buildCrashChunks(
  destroying: boolean,
  textId: string,
  textStarted: boolean
): { chunks: UIMessageChunk[]; shouldNullSession: boolean } {
  if (destroying) return { chunks: [], shouldNullSession: false }
  const chunks: UIMessageChunk[] = []
  if (textStarted) chunks.push({ type: 'text-end', id: textId })
  chunks.push({ type: 'error', errorText: 'Agent process exited unexpectedly.' })
  chunks.push({ type: 'finish-step' })
  chunks.push({ type: 'finish', finishReason: 'error' })
  return { chunks, shouldNullSession: true }
}

/** What a prompt needs from a session: the connection to the agent and where its updates go. */
export interface ACPPromptSession {
  connection: Pick<ClientSideConnection, 'prompt' | 'cancel'>
  sessionId: string
  onUpdate: ACPSession['onUpdate']
}

/**
 * Streams one prompt's reply. The stream ends when the agent ends its turn, when the prompt
 * fails, or when the chat stops it; until then the chat stays busy and takes no new message.
 */
export function promptStream(
  session: ACPPromptSession,
  prompt: string | ContentBlock[],
  abortSignal: AbortSignal | undefined,
  describeFailure: (error: unknown) => string
): ReadableStream<UIMessageChunk> {
  const { connection, sessionId } = session
  return new ReadableStream<UIMessageChunk>({
    start: (controller) => {
      const textId = `text-${Date.now()}`
      let textStarted = false
      let closed = false

      function finish(reason: 'stop' | 'other' | 'error', errorText?: string) {
        if (closed) return
        closed = true
        if (errorText) controller.enqueue({ type: 'error', errorText })
        if (textStarted) controller.enqueue({ type: 'text-end', id: textId })
        controller.enqueue({ type: 'finish-step' })
        controller.enqueue({ type: 'finish', finishReason: reason })
        session.onUpdate = null
        controller.close()
      }

      session.onUpdate = (params) => {
        if (closed) return
        const result = mapUpdate(params.update, textId, textStarted)
        for (const chunk of result.chunks) {
          controller.enqueue(chunk)
        }
        textStarted = result.textStarted
      }

      abortSignal?.addEventListener('abort', () => {
        void connection.cancel({ sessionId })
        finish('stop')
      })

      controller.enqueue({ type: 'start' })
      controller.enqueue({ type: 'start-step' })

      connection
        .prompt({
          sessionId,
          prompt: typeof prompt === 'string' ? [{ type: 'text', text: prompt }] : prompt
        })
        .then((result) => finish(result.stopReason === 'end_turn' ? 'stop' : 'other'))
        .catch((e: unknown) => {
          recordACPTransportFailure({ operation: 'message', ...describeDiagnosticError(e) })
          finish('error', describeFailure(e))
        })
    }
  })
}

export interface ACPChatTransportOptions {
  agentDef: ACPAgentDef
  cwd?: string
  /**
   * Receives the agent's own error when a prompt fails. The chat only sees the error chunk's
   * text, so this is how the JSON-RPC code reaches classification and diagnostics.
   */
  onError?: (error: unknown) => void
}

/** How much of an earlier conversation a new agent session is given, from its end. */
const TRANSCRIPT_MAX_CHARS = 16_000

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim()
}

/**
 * The conversation before the last user message, as text, for an agent session that starts in
 * a conversation it did not take part in: one reopened from history, or after a restart. Null
 * when there is none. A long one keeps its end, where the work in progress is.
 */
export function earlierConversation(messages: readonly UIMessage[]): string | null {
  const lastUser = messages.findLastIndex((message) => message.role === 'user')
  const lines = messages.slice(0, Math.max(lastUser, 0)).flatMap((message) => {
    const text = messageText(message)
    if (!text || message.role === 'system') return []
    return [`${message.role === 'user' ? 'User' : 'Assistant'}: ${text}`]
  })
  if (lines.length === 0) return null
  let transcript = lines.join('\n\n')
  if (transcript.length > TRANSCRIPT_MAX_CHARS)
    transcript = `[…]\n${transcript.slice(-TRANSCRIPT_MAX_CHARS)}`
  return [
    'Earlier in this conversation, in a session that has ended (the document may have changed since; inspect it before editing):',
    '<conversation>',
    transcript,
    '</conversation>'
  ].join('\n')
}

const IMAGE_DATA_URL = /^data:(image\/[\w.+-]+);base64,(.+)$/

/** A message's images as prompt blocks, from the data URLs the chat stores them as. */
export function imageBlocks(message: UIMessage | undefined): ContentBlock[] {
  if (!message) return []
  return message.parts
    .filter((part): part is FileUIPart => part.type === 'file')
    .flatMap((part) => {
      const match = IMAGE_DATA_URL.exec(part.url)
      if (!match?.[1] || !match[2] || !isValid(match[2])) return []
      return [{ type: 'image' as const, mimeType: match[1], data: match[2] }]
    })
}

export class ACPChatTransport implements ChatTransport<UIMessage> {
  private session: ACPSession | null = null
  private agentDef: ACPAgentDef
  private cwd: string
  private onError: ((error: unknown) => void) | undefined
  private sentContext = false
  private destroying = false

  constructor(options: ACPChatTransportOptions) {
    this.agentDef = options.agentDef
    this.cwd = options.cwd ?? '.'
    this.onError = options.onError
  }

  async sendMessages({
    messages,
    abortSignal
  }: Parameters<ChatTransport<UIMessage>['sendMessages']>[0]): Promise<
    ReadableStream<UIMessageChunk>
  > {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    const text =
      lastUserMessage?.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('\n') ?? ''

    if (this.session?.dead) {
      this.session = null
    }

    if (!this.session) {
      this.session = await this.spawnAgent()
      this.sentContext = false
    }

    // A new session hears the conversation so far, so a reopened one continues where it was.
    const promptText = this.sentContext
      ? text
      : compact([SYSTEM_PROMPT, earlierConversation(messages), text]).join('\n\n')
    this.sentContext = true
    // An agent that reads images gets them as they are; one that does not still gets the text.
    const images = this.session.readsImages ? imageBlocks(lastUserMessage) : []
    const prompt: ContentBlock[] = [{ type: 'text', text: promptText }, ...images]

    return promptStream(this.session, prompt, abortSignal, (e) => {
      this.onError?.(e)
      return formatConnectionError(e, this.agentDef)
    })
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null
  }

  async destroy(): Promise<void> {
    this.destroying = true
    if (this.session) {
      await this.session.child.kill()
      this.session = null
    }
  }

  private async spawnAgent(): Promise<ACPSession> {
    const { getAutomationAuthToken } = await import('@/app/automation/mcp/spawn')
    const { ensureMCPRuntime } = await import('@/app/automation/mcp/runtime')
    let automationAuthToken: string | null
    try {
      // The agent reaches the canvas through the MCP server, which may not have started yet.
      await ensureMCPRuntime()
      automationAuthToken = await getAutomationAuthToken()
    } catch (e) {
      throw startupError(e, this.agentDef)
    }

    let onUpdate: ACPSession['onUpdate'] = null
    const client: Client = {
      async requestPermission(
        params: RequestPermissionRequest
      ): Promise<RequestPermissionResponse> {
        const { requestPermissionFromUser } = await import('@/app/ai/acp/permission')
        return requestPermissionFromUser(params)
      },

      async sessionUpdate(params: SessionNotification): Promise<void> {
        onUpdate?.(params)
      }
    }

    const { connection, child, initialized } = await openACPConnection({
      agentDef: this.agentDef,
      client,
      destroying: () => this.destroying,
      onUnexpectedClose: () => {
        if (!this.session) return
        this.session.dead = true
        this.session = null
      }
    })

    let sessionResult
    try {
      sessionResult = await connection.newSession({
        cwd: this.cwd,
        mcpServers: await buildACPMCPServers({ authorizationToken: automationAuthToken })
      })
    } catch (e) {
      await child.kill().catch(() => undefined)
      throw startupError(e, this.agentDef)
    }

    const session: ACPSession = {
      connection,
      sessionId: sessionResult.sessionId,
      child,
      dead: false,
      readsImages: initialized.agentCapabilities?.promptCapabilities?.image === true,
      get onUpdate() {
        return onUpdate
      },
      set onUpdate(fn) {
        onUpdate = fn
      }
    }

    return session
  }
}
