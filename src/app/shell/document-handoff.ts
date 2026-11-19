import { useEventListener } from '@vueuse/core'
import * as v from 'valibot'

import { openDesignFile } from '@/app/shell/menu/files'
import { IS_TAURI } from '@/constants'

/** The query parameter a page sets when it opens this tab to hand it a file. */
export const HANDOFF_PARAM = 'handoff'

/**
 * Sites that may hand this tab a file: the free tools on kalka.design open the web app in a new
 * tab and post the file the person chose, which stays in their browser.
 */
const HANDOFF_ORIGINS: readonly string[] = import.meta.env.DEV
  ? ['https://kalka.design', 'http://localhost:8788', 'http://localhost:4321']
  : ['https://kalka.design']

const HandoffMessage = v.object({
  type: v.literal('kalka:open-file'),
  file: v.instance(File)
})

/** The file a message hands over, when it comes from the tab that opened this one on an allowed site. */
export function handoffFile(event: MessageEvent, opener: unknown): File | null {
  if (event.source !== opener || !HANDOFF_ORIGINS.includes(event.origin)) return null
  const message = v.safeParse(HandoffMessage, event.data)
  return message.success ? message.output.file : null
}

/**
 * Opens a file a kalka.design tool hands over: this tab tells its opener it is ready, the
 * opener posts the file, and it opens as File → Open would.
 */
export function useDocumentHandoff() {
  if (IS_TAURI) return
  const url = new URL(window.location.href)
  const opener: unknown = window.opener
  // A tab opened by another site sees its opener as a cross-origin window, which is no
  // `instanceof Object` in this realm: check its shape instead.
  if (
    !url.searchParams.has(HANDOFF_PARAM) ||
    typeof opener !== 'object' ||
    opener === null ||
    !('postMessage' in opener)
  )
    return
  url.searchParams.delete(HANDOFF_PARAM)
  window.history.replaceState(window.history.state, '', url)
  let received = false
  useEventListener(window, 'message', (event: MessageEvent) => {
    const file = received ? null : handoffFile(event, opener)
    if (!file) return
    received = true
    void openDesignFile(file)
  })
  const target = opener as Window
  for (const origin of HANDOFF_ORIGINS) target.postMessage({ type: 'kalka:ready' }, origin)
}
