import { prepareForClose } from '@/app/tabs'
import { IS_TAURI } from '@/constants'

/** Shared approval so the window close handler and the Quit item cannot prompt twice. */
export function createExitApproval(confirmDocuments: () => Promise<boolean>) {
  let approved = false
  let confirmation: Promise<boolean> | null = null

  return {
    isApproved: () => approved,
    /** Another window kept its documents open, so the app stays: ask again on the next close. */
    reset: () => {
      approved = false
    },
    confirm: async (): Promise<boolean> => {
      if (approved) return true
      confirmation ??= confirmDocuments()
        .then((agreed) => {
          if (agreed) approved = true
          return agreed
        })
        .finally(() => {
          confirmation = null
        })
      return confirmation
    }
  }
}

const approval = createExitApproval(prepareForClose)

/** True once every open document agreed to close, so later requests skip the prompt. */
export function isExitApproved(): boolean {
  return approval.isApproved()
}

export function confirmAppExit(): Promise<boolean> {
  return approval.confirm()
}

/** A quit this window agreed to stopped at another window (`electron/src/handlers/editors.ts`). */
export function resetAppExitApproval(): void {
  approval.reset()
}

/** Shared by the native Quit item and the platform exit request. */
export async function requestAppExit(): Promise<void> {
  const bridge = IS_TAURI ? await import('@/app/platform/tauri/bridge') : null
  // A Quit from the main process waits for this before falling back to a native box.
  if (bridge) void bridge.call('window.acknowledgeClose')
  if (!(await confirmAppExit())) {
    // The other windows are not asked once this one keeps its documents.
    if (bridge) void bridge.call('window.cancelQuit')
    return
  }
  const { exit } = await import('@tauri-apps/plugin-process')
  await exit(0)
}
