import { pickStyle } from './from-css'
import { firstCSSNumber, laysOutChildren, type PropertyFamily } from './types'

/**
 * Place a layer at its coordinates when its parent does not lay it out: it is absolutely
 * positioned, or its parent frame has no auto layout. A frame without auto layout becomes the
 * containing block of the children it places. Projected CSS marks every child of such a frame
 * absolute, which is its free position there, not absolute positioning in auto layout.
 */
export const position: PropertyFamily = {
  name: 'position',
  properties: ['position', 'left', 'top'],
  write(style, node, { parent }) {
    const placed =
      node.layoutPositioning === 'ABSOLUTE' ||
      (parent !== undefined && parent.type !== 'CANVAS' && parent.layoutMode === 'NONE')
    if (placed) {
      style.position = 'absolute'
      style.left = `${node.x}px`
      style.top = `${node.y}px`
    } else if (node.layoutMode === 'NONE' && node.type !== 'TEXT' && node.childIds.length > 0) {
      style.position = 'relative'
    }
  },
  read(style, node, { projected }) {
    const placement = pickStyle(style, 'position')
    const freelyPlaced = projected !== undefined && !laysOutChildren(projected.parent)
    if ((placement === 'absolute' || placement === 'fixed') && !freelyPlaced)
      node.layoutPositioning = 'ABSOLUTE'

    const left = firstCSSNumber(style, 'left')
    const top = firstCSSNumber(style, 'top')
    if (left !== null) node.x = left
    if (top !== null) node.y = top
  }
}
