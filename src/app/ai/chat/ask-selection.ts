import { shallowRef } from 'vue'

import { useLeftPanel } from '@/app/shell/left-panel/use'

/**
 * "Ask the agent about this": from the canvas (/ or the layer's context menu), the agent's
 * conversation opens with the selection attached as the request's subject and the field ready to
 * type in. A request waits until the chat input takes it, which may only mount afterwards.
 */
const pending = shallowRef(false)

export function askAboutSelection(): void {
  useLeftPanel().show('ai')
  pending.value = true
}

/** Whether a request waits, as it changes, for the chat input to watch. */
export function selectionAskPending() {
  return pending
}

/** Takes the waiting request, once. */
export function takeSelectionAsk(): boolean {
  if (!pending.value) return false
  pending.value = false
  return true
}
