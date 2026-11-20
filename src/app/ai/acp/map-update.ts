import type { SessionUpdate } from '@agentclientprotocol/sdk'
import type { UIMessageChunk } from 'ai'

import type { JSONObject } from '@kalka/scene-graph/primitives'

type Segment = { kind: 'text' | 'reasoning'; id: string }

export interface UpdateMapper {
  /** The chat chunks for one agent update, in the order the agent sent it. */
  map: (update: SessionUpdate) => UIMessageChunk[]
  /** Ends the text or thought still open, before the reply finishes. */
  close: () => UIMessageChunk[]
}

/**
 * Maps one prompt's agent updates to chat chunks. Text and thoughts arrive as many small chunks;
 * each run of them becomes one part, and a tool call or a change between text and thought starts
 * the next one, so the reply reads in the order the agent worked.
 */
export function createUpdateMapper(prefix: string): UpdateMapper {
  let open: Segment | null = null
  let count = 0

  function close(): UIMessageChunk[] {
    if (!open) return []
    const { kind, id } = open
    open = null
    return [kind === 'text' ? { type: 'text-end', id } : { type: 'reasoning-end', id }]
  }

  function append(kind: Segment['kind'], delta: string): UIMessageChunk[] {
    const chunks: UIMessageChunk[] = []
    let segment = open
    if (segment?.kind !== kind) {
      chunks.push(...close())
      count += 1
      segment = { kind, id: `${kind}-${prefix}-${count}` }
      open = segment
      const { id } = segment
      chunks.push(kind === 'text' ? { type: 'text-start', id } : { type: 'reasoning-start', id })
    }
    const { id } = segment
    chunks.push(
      kind === 'text' ? { type: 'text-delta', id, delta } : { type: 'reasoning-delta', id, delta }
    )
    return chunks
  }

  function map(update: SessionUpdate): UIMessageChunk[] {
    switch (update.sessionUpdate) {
      case 'agent_message_chunk': {
        if (update.content.type !== 'text') {
          console.warn('[ACP] Unhandled content type:', update.content.type)
          return []
        }
        return update.content.text ? append('text', update.content.text) : []
      }
      case 'agent_thought_chunk': {
        if (update.content.type !== 'text' || !update.content.text) return []
        return append('reasoning', update.content.text)
      }
      case 'tool_call': {
        if (!update.title) {
          console.warn('[ACP] Tool call without title:', update.toolCallId)
        }
        const toolName = update.title || 'unknown'
        const chunks: UIMessageChunk[] = [
          ...close(),
          {
            type: 'tool-input-start',
            toolCallId: update.toolCallId,
            toolName,
            providerExecuted: true,
            title: update.title
          }
        ]
        if (update.rawInput) {
          chunks.push({
            type: 'tool-input-available',
            toolCallId: update.toolCallId,
            toolName,
            input: update.rawInput,
            providerExecuted: true,
            title: update.title
          })
        }
        return chunks
      }
      case 'tool_call_update': {
        if (update.status === 'completed') {
          return [
            ...close(),
            {
              type: 'tool-output-available',
              toolCallId: update.toolCallId,
              output: update.rawOutput ?? textFromContent(update.content ?? undefined),
              providerExecuted: true
            }
          ]
        }
        if (update.status === 'failed') {
          return [
            ...close(),
            {
              type: 'tool-output-error',
              toolCallId: update.toolCallId,
              errorText: textFromContent(update.content ?? undefined) ?? 'Tool call failed',
              providerExecuted: true
            }
          ]
        }
        return []
      }
      default:
        return []
    }
  }

  return { map, close }
}

export function textFromContent(content: JSONObject[] | undefined): string | undefined {
  if (!content) return undefined
  const parts: string[] = []
  for (const c of content) {
    if (c.type !== 'content') continue
    const inner = c.content as JSONObject | undefined
    if (inner?.type === 'text' && typeof inner.text === 'string') {
      parts.push(inner.text)
    }
  }
  return parts.length > 0 ? parts.join('\n') : undefined
}
