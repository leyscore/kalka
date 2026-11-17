import { shallowRef } from 'vue'

import type { ReferencedNode } from '@/app/ai/chat/context'
import type { EditorStore } from '@/app/editor/active-store'

/**
 * A prompt for a document's chat sent from elsewhere: the one Home starts a design with, a
 * comment that asks the agent, or a request about the selection. The document's chat panel takes
 * it when it opens, or at once when it is open, and sends it as a message.
 */
export interface QueuedChatPrompt {
  store: EditorStore
  /** What the model is sent. */
  text: string
  /** What the conversation shows, when it is shorter than what the model is sent. */
  displayText?: string
  /** Layers the request is about, shown under it and sent with it. */
  nodes?: ReferencedNode[]
}

const queued = shallowRef<QueuedChatPrompt | null>(null)

export function queueChatPrompt(
  store: EditorStore,
  text: string,
  options: Omit<QueuedChatPrompt, 'store' | 'text'> = {}
): void {
  queued.value = { store, text, ...options }
}

/** The prompt queued for this document, once: taking it clears it. */
export function takeQueuedChatPrompt(store: EditorStore): QueuedChatPrompt | null {
  const prompt = queued.value
  if (prompt?.store !== store) return null
  queued.value = null
  return prompt
}

/** The queued prompt as it changes, for an open chat panel to take. */
export function queuedChatPrompt() {
  return queued
}
