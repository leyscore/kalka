/** A layer's geometry as the browser laid it out, relative to its parent's padding box. */
export interface MeasuredGeometry {
  x?: number
  y?: number
  width: number
  height: number
}

/**
 * Reads every layer's box in an artboard's element, as the browser laid it out: one forced
 * layout at most. Rotated or flipped layers, and layers inside them, keep the geometry they have,
 * since a bounding box is not their position; the artboard's own position is the canvas's, never read.
 *
 * `sizeOf` lets a caller that knows the layers correct a size the browser cannot express, such as
 * a line's zero height under an SVG that draws at least a pixel. `scopes`, layer elements inside
 * `root`, limits the reading to those layers and what is inside them, for a caller that knows the
 * rest did not move.
 *
 * Self-contained, so the CLI can run its source in the render host's page as it is.
 */
export function measureLayerBoxes(
  root: Element,
  artboardId: string,
  layerAttr = 'data-kalka-id',
  sizeOf: (id: string, element: Element, rect: DOMRect) => { width: number; height: number } = (
    _id,
    _element,
    rect
  ) => ({ width: rect.width, height: rect.height }),
  scopes?: readonly Element[]
): Map<string, MeasuredGeometry> {
  const measured = new Map<string, MeasuredGeometry>()
  const rects = new Map<Element, DOMRect>()
  const rectOf = (element: Element) => {
    let rect = rects.get(element)
    if (!rect) {
      rect = element.getBoundingClientRect()
      rects.set(element, rect)
    }
    return rect
  }
  // A flip mirrors the box as a turn does: neither box is the layer's position.
  const rotated = (element: Element) =>
    element.closest('[style*="rotate("], [style*="scale("]') !== null
  if (!scopes && !rotated(root)) {
    measured.set(artboardId, sizeOf(artboardId, root, rectOf(root)))
  }
  const elements = scopes
    ? scopes.flatMap((scope) => [scope, ...scope.querySelectorAll(`[${layerAttr}]`)])
    : root.querySelectorAll(`[${layerAttr}]`)
  for (const element of elements) {
    const id = element.getAttribute(layerAttr)
    const parent = element.parentElement?.closest(`[${layerAttr}]`)
    if (!id || !parent || rotated(element)) continue
    const rect = rectOf(element)
    const box = rectOf(parent)
    measured.set(id, {
      x: rect.left - box.left - parent.clientLeft,
      y: rect.top - box.top - parent.clientTop,
      ...sizeOf(id, element, rect)
    })
  }
  return measured
}
