import type { DesignElement, DesignNode } from '#dom-css/types'

import { SOURCE_ID_ATTR } from './attributes'

/** Tags that are only a box: an image or a control draws at no size of its own. */
const BOX_TAGS: ReadonlySet<string> = new Set(['div', 'span'])

/**
 * Declarations that draw nothing on a box without area: where it sits, its fill, its corners,
 * and a stroke inside its edge. A shadow, a border, or a size of its own is not among them.
 */
const INERT =
  /^(position|left|top|right|bottom|inset|z-index|background(-.+)?|border-(.+-)?radius|opacity|overflow|rotate|outline|outline-offset)$/

/**
 * Whether a layer draws nothing in any browser: a box of no width and no height, without
 * children, whose only stroke is inside its edge. Browsers disagree on such an outline, and some
 * draw a blot where others draw nothing, as the canvas does.
 */
function drawsNothing(element: DesignElement): boolean {
  const source = element.sourceSceneNode
  if (!source || source.type === 'TEXT' || source.width !== 0 || source.height !== 0) return false
  if (element.children.length > 0 || !BOX_TAGS.has(element.tagName.toLowerCase())) return false
  if (source.htmlClasses.length > 0 || (element.mediaStyles?.length ?? 0) > 0) return false
  // A caller mapping the markup back to layers finds every layer in it.
  if (SOURCE_ID_ATTR in element.attrs) return false
  const style = element.inlineStyle ?? {}
  if ('outline' in style && source.strokes.at(0)?.align !== 'INSIDE') return false
  return Object.keys(style).every((name) => INERT.test(name))
}

/** The children an export writes: without the layers that draw nothing. */
export function drawnChildren(children: readonly DesignNode[]): DesignNode[] {
  return children.filter((child) => child.type === 'text' || !drawsNothing(child))
}
