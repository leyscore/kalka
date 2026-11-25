import { isDesignClipboardHTML } from '@/app/editor/clipboard/html'
import { getInMemoryClipboardHTML } from '@/app/editor/clipboard/memory'
import { readTauriClipboardText } from '@/app/tauri/clipboard'
import { isTauri } from '@/app/tauri/env'

/**
 * A clipboard that reads HTML as it was written. Chromium sanitizes HTML read through the
 * asynchronous clipboard unless asked not to, which drops the empty spans that carry design data;
 * other browsers ignore the option.
 */
export interface ClipboardReader {
  read(options?: { unsanitized?: string[] }): Promise<ClipboardItems>
}

export const UNSANITIZED_HTML = { unsanitized: ['text/html'] }

/** The browser's asynchronous clipboard, where this context has one. */
function browserClipboard(): ClipboardReader | undefined {
  if (typeof navigator === 'undefined') return undefined
  const { clipboard } = navigator as Partial<Navigator>
  return typeof clipboard?.read === 'function' ? clipboard : undefined
}

/** The design layers on the system clipboard, or the last copy made here when it cannot be read. */
export async function readClipboardHTML(
  clipboard: ClipboardReader | undefined = browserClipboard()
): Promise<string | null> {
  if (isTauri()) {
    try {
      const text = await readTauriClipboardText()
      if (isDesignClipboardHTML(text ?? '')) return text
      const memory = getInMemoryClipboardHTML(text ?? '')
      return memory && isDesignClipboardHTML(memory) ? memory : null
    } catch (error) {
      console.warn('Tauri clipboard read failed', error)
      const memory = getInMemoryClipboardHTML()
      return memory && isDesignClipboardHTML(memory) ? memory : null
    }
  }

  if (clipboard) {
    try {
      const items = await clipboard.read(UNSANITIZED_HTML)
      let plainText = ''
      for (const item of items) {
        if (item.types.includes('text/plain') && !plainText)
          plainText = await (await item.getType('text/plain')).text()
        if (!item.types.includes('text/html')) continue
        const text = await (await item.getType('text/html')).text()
        if (text && isDesignClipboardHTML(text)) return text
      }
      // Our last copy, when the browser kept only its text; any other content is newer than it.
      const memory = getInMemoryClipboardHTML(plainText)
      return memory && isDesignClipboardHTML(memory) ? memory : null
    } catch (error) {
      console.warn('System clipboard read failed', error)
    }
  }

  const memory = getInMemoryClipboardHTML()
  return memory && isDesignClipboardHTML(memory) ? memory : null
}
