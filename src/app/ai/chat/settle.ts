import { isReasoningUIPart, isTextUIPart, isToolUIPart, type UIMessage } from 'ai'
import * as v from 'valibot'
import { toRaw } from 'vue'

/** A reply the user stopped is marked in its metadata, which conversations store. */
const StoppedMetadata = v.object({ stopped: v.literal(true) })

export function wasStopped(message: UIMessage): boolean {
  return v.is(StoppedMetadata, message.metadata)
}

export interface SettleOptions {
  /** Whether the user stopped the reply, rather than it failing or being cut off. */
  stopped: boolean
  /** Whether a call changed the document; unknown for a conversation reopened later. */
  changed?: (toolCallId: string) => boolean
}

function unfinishedCallError(toolCallId: string, changed: SettleOptions['changed']): string {
  if (!changed) return 'The reply ended before this call reported back.'
  return changed(toolCallId)
    ? 'The reply ended while this call ran. It changed the document, but its result never arrived.'
    : 'The reply ended before this call finished. It did not change the document.'
}

/**
 * A reply as it stands once it ended without finishing, stopped or failed: nothing in it still
 * reads as running. Reasoning and text are done, and a call that never reported back fails
 * with what happened to the document, which the model reads on the next request.
 */
export function settleMessage(live: UIMessage, { stopped, changed }: SettleOptions): UIMessage {
  // The chat's messages are reactive; the settled one is built from plain values, so the
  // conversation can still be saved with `structuredClone`.
  const message = toRaw(live)
  const parts = message.parts.map((part): UIMessage['parts'][number] => {
    if ((isReasoningUIPart(part) || isTextUIPart(part)) && part.state === 'streaming') {
      return { ...part, state: 'done' }
    }
    if (
      isToolUIPart(part) &&
      (part.state === 'input-streaming' || part.state === 'input-available')
    ) {
      return {
        ...part,
        state: 'output-error',
        input: part.input,
        errorText: unfinishedCallError(part.toolCallId, changed)
      }
    }
    return part
  })
  const unchanged = parts.every((part, index) => part === message.parts[index])
  if (unchanged && (!stopped || wasStopped(message))) return live
  const metadata = v.is(v.record(v.string(), v.unknown()), message.metadata) ? message.metadata : {}
  return { ...message, parts, metadata: stopped ? { ...metadata, stopped: true } : metadata }
}
