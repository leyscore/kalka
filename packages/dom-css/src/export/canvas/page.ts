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
