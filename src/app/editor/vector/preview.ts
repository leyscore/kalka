import { isEqual } from 'es-toolkit/predicate'
import type { Ref } from 'vue'

import type { EditorStore } from '@/app/editor/active-store'

/**
 * A command a dialog shows on the canvas while it is open, as Figma's vector dialogs do: each
 * preview runs the command as one undo step that the next preview, Cancel or closing takes back,
 * and Apply keeps. `run` says whether the command changed anything.
 */
export function createCommandPreview<Settings>(
  open: Ref<boolean>,
  run: (store: EditorStore, settings: Settings) => Promise<boolean> | boolean
) {
  let shown: Settings | null = null
  // Previews run one after another: each waits for the command before it.
  let queue: Promise<void> = Promise.resolve()

  function takeBack(store: EditorStore) {
    if (shown !== null) store.undoAction()
    shown = null
  }

  /** Shows the command with these settings, replacing the previous preview. */
  function preview(store: EditorStore, settings: Settings): Promise<void> {
    queue = queue.then(async () => {
      if (!open.value) return
      takeBack(store)
      if (await run(store, settings)) shown = settings
    })
    return queue
  }

  /** Takes the preview back, as Cancel and closing the dialog do. */
  function cancel(store: EditorStore): Promise<void> {
    queue = queue.then(() => takeBack(store))
    return queue
  }

  /** Keeps the command with these settings: the preview if it shows them. */
  function apply(store: EditorStore, settings: Settings): Promise<boolean> {
    let applied = false
    queue = queue.then(async () => {
      if (shown !== null && isEqual(shown, settings)) {
        shown = null
        applied = true
        return
      }
      takeBack(store)
      applied = await run(store, settings)
    })
    return queue.then(() => applied)
  }

  return { preview, cancel, apply }
}
