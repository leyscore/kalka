/** A layer's geometry as the browser laid it out, relative to its parent's padding box. */
export interface MeasuredGeometry {
  x?: number
  y?: number
  width: number
  height: number
}

/**
 * Reads every layer's box in an artboard's element, as the browser laid it out: one forced
 * layout at most. A turned or flipped layer reads the box it has before its transform, which is
 * its position, worked back from the box around it as drawn; layers inside it keep the geometry
 * they have, since their boxes turn with it. The artboard's own position is the canvas's, never
 * read.
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
  // A flip mirrors the box as a turn does, and a translation moves it: none of these boxes is
  // the layer's position.
  const rotated = (element: Element) =>
    element.closest(
      '[style*="rotate("], [style*="scale("], [style*="translate"], [style*="matrix"], [style*="skew("]'
    ) !== null
  if (!scopes && !rotated(root)) {
    measured.set(artboardId, sizeOf(artboardId, root, rectOf(root)))
  }
  const elements = scopes
    ? scopes.flatMap((scope) => [scope, ...scope.querySelectorAll(`[${layerAttr}]`)])
    : root.querySelectorAll(`[${layerAttr}]`)
  /**
   * The box of an element turned by its own `transform`, before it: the drawn box's corner less
   * how far the transform moves the box's corners past it, about the transform's origin. Null
   * when its transform is not a plain 2D matrix, or individual transform properties move it too.
   */
  const untransformedBox = (element: Element, rect: DOMRect): DOMRect | null => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element)
    if (!style || [style.rotate, style.scale, style.translate].some((value) => value !== 'none'))
      return null
    const matrix = /^matrix\(([^)]+)\)$/.exec(style.transform)?.[1]?.split(',').map(Number)
    const origin = style.transformOrigin.split(' ').map((value) => Number.parseFloat(value))
    if (matrix?.length !== 6 || origin.length < 2) return null
    const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = matrix
    const [ox = 0, oy = 0] = origin
    // A box sized without its padding and border, as `box-sizing` says, takes them on each side.
    const edges = (sides: readonly string[]) =>
      style.boxSizing === 'border-box'
        ? 0
        : sides.reduce(
            (sum, side) =>
              sum +
              Number.parseFloat(style.getPropertyValue(`padding-${side}`)) +
              Number.parseFloat(style.getPropertyValue(`border-${side}-width`)),
            0
          )
    const width = Number.parseFloat(style.width) + edges(['left', 'right'])
    const height = Number.parseFloat(style.height) + edges(['top', 'bottom'])
    if (![a, b, c, d, e, f, ox, oy, width, height].every(Number.isFinite)) return null
    let left = Infinity
    let top = Infinity
    for (const [x, y] of [
      [0, 0],
      [width, 0],
      [0, height],
      [width, height]
    ] as const) {
      left = Math.min(left, a * (x - ox) + c * (y - oy) + e + ox)
      top = Math.min(top, b * (x - ox) + d * (y - oy) + f + oy)
    }
    return new DOMRect(rect.left - left, rect.top - top, width, height)
  }
  for (const element of elements) {
    const id = element.getAttribute(layerAttr)
    const parent = element.parentElement?.closest(`[${layerAttr}]`)
    if (!id || !parent || !element.parentElement || rotated(element.parentElement)) continue
    const drawn = rectOf(element)
    const rect = rotated(element) ? untransformedBox(element, drawn) : drawn
    if (!rect) continue
    const box = rectOf(parent)
    measured.set(id, {
      x: rect.left - box.left - parent.clientLeft,
      y: rect.top - box.top - parent.clientTop,
      ...sizeOf(id, element, rect)
    })
  }
  return measured
}
