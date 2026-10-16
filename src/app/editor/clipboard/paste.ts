import type { Editor } from '@kalka/core/editor'
import type { Vector } from '@kalka/scene-graph/primitives'

import { externalHTMLAsDesignClipboard, isExternalHTML } from './external-html'
import { matchingClipboardSnapshot } from './memory'

export async function pasteClipboardHTML(
  editor: Editor,
  html: string,
  cursorPos?: Vector,
  options: Parameters<Editor['pasteFromHTML']>[2] = {}
): Promise<void> {
  const snapshot = matchingClipboardSnapshot(html)
  if (snapshot) {
    await editor.pasteSnapshot(snapshot, cursorPos, options)
    return
  }
  // Markup from a web page or a code editor becomes editable layers.
  const design = isExternalHTML(html)
    ? await externalHTMLAsDesignClipboard(html, editor.cssWrites.has('import'))
    : null
  await editor.pasteFromHTML(design ?? html, cursorPos, options)
}
