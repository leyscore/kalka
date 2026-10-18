import { BrowserLayoutEngine, installLayoutEngine } from '@kalka/core/layout'
import { createDocumentLayout, measureLayerBoxes } from '@kalka/dom-css/export'

/**
 * Lays out what the canvas does not show, such as other pages, export copies, previews and
 * artboards whose iframe has not loaded yet, in hidden iframes of the editor's own page. The
 * canvas's engine, installed over it while the canvas runs, hands these layers down to it.
 */
export function installOffscreenLayout(): () => void {
  return installLayoutEngine(
    new BrowserLayoutEngine(createDocumentLayout(document, measureLayerBoxes))
  )
}
