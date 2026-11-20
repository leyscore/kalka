import { IS_BROWSER } from '@/constants'

/**
 * File System Access is Chromium-only today; other browsers download instead. This module is
 * the one place that touches the API, so callers cannot drift on the availability check.
 */
export function supportsFileSystemAccess(): boolean {
  return IS_BROWSER && typeof window.showSaveFilePicker === 'function'
}

/**
 * Opens the browser save picker. Resolves to null when the browser has no picker, and rejects
 * with `AbortError` when the user cancels so callers can keep cancel and failure distinct.
 */
export async function pickBrowserSaveFile(
  options: FilePickerOptions
): Promise<FileSystemFileHandle | null> {
  // Checked inline rather than through the predicate so TypeScript narrows the method.
  if (!IS_BROWSER || typeof window.showSaveFilePicker !== 'function') return null
  return window.showSaveFilePicker(options)
}

/**
 * Asks to write a file opened in the browser, which the open picker grants for reading only.
 * It must run during a click: autosave writes later, without one, and the browser would refuse
 * its first write. True when the file may be written, or the browser asks nothing.
 */
export async function requestWriteAccess(handle: FileSystemFileHandle): Promise<boolean> {
  if (!handle.requestPermission) return true
  return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted'
}
