import { ref } from 'vue'

import type { FindLayerKind } from '@kalka/core/editor'

import { useLeftPanel } from '@/app/shell/left-panel/use'

export type FindScope = 'page' | 'document'

/**
 * What the find panel searches for, kept while it is closed so ⌘F comes back to the last search,
 * as Figma's does.
 */
export const findState = {
  open: ref(false),
  query: ref(''),
  replacement: ref(''),
  showReplace: ref(false),
  scope: ref<FindScope>('page'),
  text: ref(true),
  names: ref(true),
  matchCase: ref(false),
  wholeWord: ref(false),
  kinds: ref<FindLayerKind[]>([]),
  /** Bumped by each ⌘F, so an open panel takes focus again and selects its search. */
  focusRequest: ref(0)
}

/** Opens the find panel in the left sidebar, or focuses its search when it is open. */
export function openFind(): void {
  useLeftPanel().show('file')
  findState.open.value = true
  findState.focusRequest.value++
}

export function closeFind(): void {
  findState.open.value = false
}
