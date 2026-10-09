import type { EditorStore } from '@/app/editor/active-store'

/**
 * A prompt written before its document's chat existed, such as the one Home starts a design
 * with. The document's chat panel takes it once it opens and sends it as the first message.
 */
let queued: { store: EditorStore; text: string } | null = null

export function queueChatPrompt(store: EditorStore, text: string): void {
  queued = { store, text }
}

/** The prompt queued for this document, once: taking it clears it. */
export function takeQueuedChatPrompt(store: EditorStore): string | null {
  if (queued?.store !== store) return null
  const { text } = queued
  queued = null
  return text
}
