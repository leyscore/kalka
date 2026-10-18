import type { Editor } from '@kalka/core/editor'
import { isSVGMarkup } from '@kalka/core/io'
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
  const design = isExternalHTML(html) ? await externalHTMLAsDesignClipboard(html) : null
  await editor.pasteFromHTML(design ?? html, cursorPos, options)
}

/** Where a paste without a copied position goes: the cursor, else the middle of the view. */
export function pastePoint(editor: Editor, cursorPos?: Vector): Vector {
  const { panX, panY, zoom } = editor.state
  return (
    cursorPos ?? {
      x: (-panX + window.innerWidth / 2) / zoom,
      y: (-panY + window.innerHeight / 2) / zoom
    }
  )
}

/** Paste SVG markup, such as Figma's Copy as SVG, as layers; false when the text is not SVG. */
export async function pasteSVGText(
  editor: Editor,
  text: string,
  cursorPos?: Vector
): Promise<boolean> {
  if (!isSVGMarkup(text)) return false
  const { x, y } = pastePoint(editor, cursorPos)
  return editor.pasteSVG(text, x, y)
}
