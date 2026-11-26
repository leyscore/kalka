import { isTauri } from '@/app/tauri/env'

/**
 * The desktop app's editor windows: the first is `main`, as under Tauri, and File › New Window
 * opens `editor-2`, `editor-3`… The main process names them by the same rule
 * (`electron/src/handlers/editors.ts`).
 */
export const FIRST_EDITOR_WINDOW_LABEL = 'main'
const EDITOR_WINDOW_PREFIX = 'editor-'

/**
 * Tells an editor window that agreed to quit or restart that another window kept its documents
 * open, so it asks again on its next close; the main process sends it, and so does Software Update.
 */
export const QUIT_CANCELLED_EVENT = 'quit-cancelled'

export function isEditorWindowLabel(label: string): boolean {
  return label === FIRST_EDITOR_WINDOW_LABEL || label.startsWith(EDITOR_WINDOW_PREFIX)
}

/** Opens another editor window, with its own tabs; only the desktop app has windows to open. */
export async function openNewEditorWindow(): Promise<void> {
  if (!isTauri()) return
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('open_editor_window')
}
