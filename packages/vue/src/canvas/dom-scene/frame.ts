/**
 * An artboard document: one iframe per top-level layer, so its CSS is a real page of its own
 * (real `@media`, no leak into the editor or out of it) laid out and drawn by the browser.
 *
 * `allow-same-origin` without `allow-scripts`: the editor reads and measures the document, the
 * design itself never runs code. The CSP keeps pasted HTML off the network.
 */
export const ARTBOARD_SANDBOX = 'allow-same-origin'

export const ARTBOARD_CSP =
  "default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data: blob:"

const ARTBOARD_CSS = [
  'html,body{margin:0;padding:0;background:transparent;overflow:hidden}',
  '*,*::before,*::after{box-sizing:border-box}',
  // A layer's text keeps the font the projection writes; this is only the fallback.
  'body{font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}',
  'img{display:block}',
  // Projected text is a span with a width; it lays out as a box.
  '[data-kalka-text]{display:block}'
].join('')

export function artboardSrcdoc(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${ARTBOARD_CSP}"><style>${ARTBOARD_CSS}</style></head><body></body></html>`
}

export function createArtboardFrame(ownerDocument: Document, nodeId: string): HTMLIFrameElement {
  const frame = ownerDocument.createElement('iframe')
  frame.setAttribute('sandbox', ARTBOARD_SANDBOX)
  frame.setAttribute('aria-hidden', 'true')
  frame.setAttribute('tabindex', '-1')
  frame.dataset.kalkaArtboard = nodeId
  frame.style.cssText =
    'position:absolute;left:0;top:0;border:0;margin:0;padding:0;background:transparent;pointer-events:none;overflow:hidden'
  frame.srcdoc = artboardSrcdoc()
  return frame
}

export interface ArtboardFontFace {
  family: string
  weight: string
  style: 'normal' | 'italic'
  data: ArrayBuffer
}

/**
 * Adds a font to an artboard's own font set. Each iframe is a document of its own: fonts the
 * editor loaded are not visible in it until added there, through its own `FontFace`.
 */
export function addArtboardFont(doc: Document, face: ArtboardFontFace): void {
  const view = doc.defaultView
  if (!view) return
  const fontFace = new view.FontFace(face.family, face.data, {
    weight: face.weight,
    style: face.style
  })
  doc.fonts.add(fontFace)
  void fontFace.load().catch(() => doc.fonts.delete(fontFace))
}
