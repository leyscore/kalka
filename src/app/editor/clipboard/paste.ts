import type { Editor } from '@kalka/core/editor'
import { isSVGMarkup } from '@kalka/core/io'
import type { Vector } from '@kalka/scene-graph/primitives'

import { addSnapshotBreakpoints, splitSnapshotBreakpoints } from './breakpoints'
import { externalHTMLAsDesignClipboard, isExternalHTML } from './external-html'
import { registerPastedFonts } from './fonts'
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
  if (!isExternalHTML(html)) {
    await editor.pasteFromHTML(html, cursorPos, options)
    return
  }
  // A page copied at several widths pastes as an artboard with a breakpoint for each.
  const { html: widest, breakpoints } = splitSnapshotBreakpoints(html)
  // The page's own fonts, when the copy carries them, draw its text on the canvas.
  registerPastedFonts(widest)
  const design = await externalHTMLAsDesignClipboard(widest)
  await editor.pasteFromHTML(design ?? widest, cursorPos, options)
  const pasted = [...editor.state.selectedIds]
  const [primaryId] = pasted
  if (design && breakpoints.length > 0 && pasted.length === 1 && primaryId) {
    await addSnapshotBreakpoints(editor, primaryId, breakpoints)
  }
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
