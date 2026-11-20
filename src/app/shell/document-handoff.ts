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
 * The window that opened this tab, when a page can post to it. An opener on another origin, as
 * kalka.design is to the web app, is a window whose prototype is not this page's `Object`.
 */
export function handoffOpener(opener: unknown): Pick<Window, 'postMessage'> | null {
  if (opener === null || typeof opener !== 'object' || !('postMessage' in opener)) return null
  return opener as Pick<Window, 'postMessage'>
}

/**
 * Opens a file a kalka.design tool hands over: this tab tells its opener it is ready, the
 * opener posts the file, and it opens as File → Open would.
 */
export function useDocumentHandoff() {
  if (IS_TAURI) return
  const url = new URL(window.location.href)
  const opener = handoffOpener(window.opener)
  if (!url.searchParams.has(HANDOFF_PARAM) || !opener) return
  url.searchParams.delete(HANDOFF_PARAM)
  window.history.replaceState(window.history.state, '', url)
  let received = false
  useEventListener(window, 'message', (event: MessageEvent) => {
    const file = received ? null : handoffFile(event, opener)
    if (!file) return
    received = true
    void openDesignFile(file)
  })
  for (const origin of HANDOFF_ORIGINS) opener.postMessage({ type: 'kalka:ready' }, origin)
}
