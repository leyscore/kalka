import { toUint8Array } from 'js-base64'

import type { MeasuredGeometry, measureLayerBoxes } from './measure'

/** A font face for the page's artboards, its file as Base64. */
export interface PageFontFace {
  family: string
  weight: string
  style: 'normal' | 'italic'
  data: string
}

/** One top-level layer: its iframe's size, as the canvas sizes it, and its element's HTML. */
export interface PageArtboard {
  id: string
  width: number
  height: number
  html: string
}

export interface PageLayoutRequest {
  /** The document every artboard iframe starts from (`artboardSrcdoc`). */
  srcdoc: string
  sandbox: string
  layerAttr: string
  /** Faces not sent before; the page keeps every face it was given. */
  fonts: PageFontFace[]
  artboards: PageArtboard[]
}

/** Every layer's box, by layer id, for each artboard of the request. */
export type PageLayoutResult = Array<[string, MeasuredGeometry]>

/** Hidden layout iframes kept between requests, ready with their fonts; more are made as needed. */
const KEPT_LAYOUT_FRAMES = 4

/**
 * Lays artboards out in hidden iframes of `owner`, the page the editor runs in, synchronously, as
 * layout runs: for graphs the canvas does not show, such as other pages and export copies. Each
 * iframe starts as the blank document it has the moment it is added and is written in place, so
 * no request waits for a load. Fonts are added as they come and lay text out once loaded.
 */
export function createDocumentLayout(
  owner: Document,
  measure: typeof measureLayerBoxes
): (request: PageLayoutRequest) => PageLayoutResult {
  const frames: Array<{ frame: HTMLIFrameElement; doc: Document }> = []
  const faces: PageFontFace[] = []
  let container: HTMLElement | null = null

  function addFace(doc: Document, face: PageFontFace): void {
    const view = doc.defaultView
    if (!view) return
    const fontFace = new view.FontFace(face.family, new Uint8Array(toUint8Array(face.data)), {
      weight: face.weight,
      style: face.style
    })
    doc.fonts.add(fontFace)
    void fontFace.load().catch(() => doc.fonts.delete(fontFace))
  }

  function frameAt(
    index: number,
    request: PageLayoutRequest
  ): { frame: HTMLIFrameElement; doc: Document } | null {
    if (index < frames.length) return frames[index]
    if (!container) {
      container = owner.createElement('div')
      container.setAttribute('aria-hidden', 'true')
      container.style.cssText =
        'position:fixed;left:-100000px;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none'
      owner.body.append(container)
    }
    const frame = owner.createElement('iframe')
    frame.setAttribute('sandbox', request.sandbox)
    frame.setAttribute('tabindex', '-1')
    frame.style.cssText = 'position:absolute;left:0;top:0;border:0;margin:0;padding:0'
    container.append(frame)
    const doc = frame.contentDocument
    if (!doc) return null
    doc.open()
    doc.write(request.srcdoc)
    doc.close()
    for (const face of faces) addFace(doc, face)
    const entry = { frame, doc }
    frames.push(entry)
    return entry
  }

  return (request) => {
    faces.push(...request.fonts)
    for (const { doc } of frames) for (const face of request.fonts) addFace(doc, face)
    const boxes: PageLayoutResult = []
    for (const [index, artboard] of request.artboards.entries()) {
      const entry = frameAt(index, request)
      if (!entry) continue
      const { frame, doc } = entry
      frame.style.width = `${Math.max(1, artboard.width)}px`
      frame.style.height = `${Math.max(1, artboard.height)}px`
      doc.body.innerHTML = artboard.html
      const root = doc.body.firstElementChild
      if (root) boxes.push(...measure(root, artboard.id, request.layerAttr))
      // Read, the layers are let go: the pool keeps documents and their fonts, not designs.
      doc.body.replaceChildren()
    }
    // A request of many artboards does not leave as many documents behind.
    for (const { frame } of frames.splice(KEPT_LAYOUT_FRAMES)) frame.remove()
    return boxes
  }
}

/**
 * Lays artboards out in a page of their own, the render host's, as the canvas does: one iframe
 * per artboard, sized from the layer, holding its element, then reads back every box. Iframes
 * are kept between requests and reused in turn, with the fonts already in them, so a request
 * costs a layout, not a page load.
 *
 * Self-contained: the CLI sends this function's source to the page, `measure` included, and
 * keeps the returned function there between requests.
 */
export function createPageLayout(
  measure: typeof measureLayerBoxes
): (request: PageLayoutRequest) => Promise<PageLayoutResult> {
  const frames: HTMLIFrameElement[] = []
  const faces: Array<{ family: string; weight: string; style: string; data: ArrayBuffer }> = []

  async function addFace(doc: Document, face: (typeof faces)[number]): Promise<void> {
    const view = doc.defaultView
    if (!view) return
    const fontFace = new view.FontFace(face.family, face.data, {
      weight: face.weight,
      style: face.style
    })
    doc.fonts.add(fontFace)
    await fontFace.load().catch(() => doc.fonts.delete(fontFace))
  }

  /** The iframe at `index` in the pool, made with every face so far when the pool is shorter. */
  async function frameAt(index: number, request: PageLayoutRequest): Promise<HTMLIFrameElement> {
    if (index < frames.length) return frames[index]
    const frame = document.createElement('iframe')
    frame.setAttribute('sandbox', request.sandbox)
    frame.style.cssText = 'position:absolute;left:0;top:0;border:0;margin:0;padding:0'
    frame.srcdoc = request.srcdoc
    await new Promise((resolve) => {
      frame.addEventListener('load', resolve, { once: true })
      document.body.append(frame)
    })
    const doc = frame.contentDocument
    if (doc) await Promise.all(faces.map((face) => addFace(doc, face)))
    frames.push(frame)
    return frame
  }

  return async (request) => {
    const added = await Promise.all(
      request.fonts.map(async (face) => ({
        ...face,
        data: await (await fetch(`data:application/octet-stream;base64,${face.data}`)).arrayBuffer()
      }))
    )
    faces.push(...added)
    await Promise.all(
      frames.flatMap((frame) => {
        const doc = frame.contentDocument
        return doc ? added.map((face) => addFace(doc, face)) : []
      })
    )

    const docs: Array<{ id: string; doc: Document }> = []
    for (const [index, artboard] of request.artboards.entries()) {
      const frame = await frameAt(index, request)
      const doc = frame.contentDocument
      if (!doc) continue
      frame.style.width = `${Math.max(1, artboard.width)}px`
      frame.style.height = `${Math.max(1, artboard.height)}px`
      doc.body.innerHTML = artboard.html
      docs.push({ id: artboard.id, doc })
    }
    // Iframes this request does not use let go of what they held.
    for (const frame of frames.slice(request.artboards.length)) {
      if (frame.contentDocument) frame.contentDocument.body.innerHTML = ''
    }
    // Text lays out with its fonts and images with their own sizes, as on the canvas.
    await Promise.all(
      docs.flatMap(({ doc }) => [
        doc.fonts.ready,
        ...Array.from(doc.images, (image) => image.decode().catch(() => null))
      ])
    )

    const boxes: PageLayoutResult = []
    for (const { id, doc } of docs) {
      const root = doc.body.firstElementChild
      if (root) boxes.push(...measure(root, id, request.layerAttr))
    }
    return boxes
  }
}
