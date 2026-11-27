import { notificationMessages } from '@/app/i18n/notifications'
import { openFileFromPath } from '@/app/shell/menu/files'
import { toast } from '@/app/shell/ui'
import { isTauri } from '@/app/tauri/env'

import { takeClosedTab } from './closed'
import { openFileInNewTab, restoreRecoverySnapshot } from './index'

/**
 * Reopen closed tab, as a browser's and Figma's ⇧⌘T: the last document closed here comes back in
 * a tab, a draft from recovery and a file from where it was read. Says so when nothing is left.
 */
export async function reopenClosedTab(): Promise<void> {
  const closed = takeClosedTab()
  if (!closed) {
    toast.info(notificationMessages.get().noClosedTab)
    return
  }
  try {
    if (closed.kind === 'draft') {
      await restoreRecoverySnapshot(closed.snapshotId)
      return
    }
    if (closed.path && isTauri()) {
      await openFileFromPath(closed.path)
      return
    }
    if (closed.handle) await openFileInNewTab(await closed.handle.getFile(), closed.handle)
  } catch (error) {
    console.warn('[Tabs] Could not reopen the closed tab:', error)
    toast.error(notificationMessages.get().reopenClosedTabFailed)
  }
}
