import * as v from 'valibot'

import { randomHex } from '@kalka/scene-graph/random'

import { createDeferred } from '@/app/runtime/deferred'
import { isEditorWindowLabel, QUIT_CANCELLED_EVENT } from '@/app/shell/editor-windows'

// The Software Update window owns no documents, so it asks each editor window
// to run the same unsaved-changes approval as Quit before the app restarts.
export const RESTART_REQUEST_EVENT = 'updater:restart-request'
export const RESTART_REPLY_EVENT = 'updater:restart-reply'

export const RestartRequest = v.object({ id: v.string() })
export const RestartReply = v.object({ id: v.string(), approved: v.boolean() })

/** Asks one editor window about its documents; resolves true once they may close. */
async function askEditor(label: string): Promise<boolean> {
  const [{ emitTo, listen, TauriEvent }, { WebviewWindow }] = await Promise.all([
    import('@tauri-apps/api/event'),
    import('@tauri-apps/api/webviewWindow')
  ])
  const editor = await WebviewWindow.getByLabel(label)
  if (!editor) return true

  const id = randomHex(8)
  const reply = createDeferred<boolean>()
  const stopReply = await listen<unknown>(RESTART_REPLY_EVENT, ({ payload }) => {
    const parsed = v.safeParse(RestartReply, payload)
    if (parsed.success && parsed.output.id === id) reply.resolve(parsed.output.approved)
  })
  // No timeout: the reply waits for the person to answer the unsaved-documents prompt.
  // An editor closed meanwhile has run its own prompt and holds no documents, so it approves.
  const stopDestroyed = await editor.once(TauriEvent.WINDOW_DESTROYED, () => reply.resolve(true))
  if (!(await WebviewWindow.getByLabel(label))) reply.resolve(true)
  try {
    await emitTo(label, RESTART_REQUEST_EVENT, { id })
    return await reply.promise
  } finally {
    stopReply()
    stopDestroyed()
  }
}

/**
 * Called from the Software Update window; asks each editor window in turn, as Quit does, and
 * resolves true once all their documents may close. The first that keeps its documents stops
 * the restart, and those that agreed ask again on their next close.
 */
export async function requestRestartApproval(): Promise<boolean> {
  const [{ emitTo }, { getAllWebviewWindows }] = await Promise.all([
    import('@tauri-apps/api/event'),
    import('@tauri-apps/api/webviewWindow')
  ])
  const editors = (await getAllWebviewWindows())
    .map((window) => window.label)
    .filter(isEditorWindowLabel)
  const agreed: string[] = []
  for (const label of editors) {
    if (await askEditor(label)) {
      agreed.push(label)
      continue
    }
    await Promise.all(agreed.map((other) => emitTo(other, QUIT_CANCELLED_EVENT)))
    return false
  }
  return true
}
