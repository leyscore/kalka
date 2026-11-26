import type { SceneNode } from '../types'
import { pickStyle } from './from-css'
import {
  type CSSDeclarations,
  firstCSSNumber,
  laysOutChildren,
  type PropertyFamily,
  px
} from './types'

interface Axis {
  constraint: 'horizontalConstraint' | 'verticalConstraint'
  position: 'x' | 'y'
  size: 'width' | 'height'
  start: 'left' | 'top'
  end: 'right' | 'bottom'
}

const HORIZONTAL: Axis = {
  constraint: 'horizontalConstraint',
  position: 'x',
  size: 'width',
  start: 'left',
  end: 'right'
}
const VERTICAL: Axis = {
  constraint: 'verticalConstraint',
  position: 'y',
  size: 'height',
  start: 'top',
  end: 'bottom'
}
const AXES = [HORIZONTAL, VERTICAL] as const

/**
 * Whether a layer sits out of its auto layout parent's flow, pinned by its constraints as Figma's
 * absolute position does: its insets come from them, so the browser keeps it pinned while the
 * frame grows or shrinks.
 */
function pinnedInLayout(node: SceneNode, parent: SceneNode | undefined): boolean {
  return node.layoutPositioning === 'ABSOLUTE' && laysOutChildren(parent)
}

/**
 * Whether the frame sizes itself to its content along an axis. Its stored size there is only the
 * last layout's, and the layer's own move or resize may change it, so an inset measured from it
 * would place the layer wrong: the layer keeps its start position on that axis.
 */
function hugsAxis(parent: SceneNode, size: 'width' | 'height'): boolean {
  if (parent.layoutMode !== 'HORIZONTAL' && parent.layoutMode !== 'VERTICAL') return false
  const primary = (parent.layoutMode === 'HORIZONTAL') === (size === 'width')
  return (primary ? parent.primaryAxisSizing : parent.counterAxisSizing) === 'HUG'
}

const round = (value: number) => Math.round(value * 1000) / 1000
const percent = (share: number) => `${round(share * 100)}%`

/**
 * The CSS size an absolutely positioned layer takes from its constraint rather than its own:
 * none for Left and right, which leaves it to the two insets, a share of the frame for Scale.
 * Undefined where the layer keeps its own size.
 */
export function constrainedSize(
  node: SceneNode,
  parent: SceneNode | undefined,
  size: 'width' | 'height'
): string | null | undefined {
  if (!parent || !pinnedInLayout(node, parent) || hugsAxis(parent, size)) return undefined
  const constraint = node[size === 'width' ? HORIZONTAL.constraint : VERTICAL.constraint]
  if (constraint === 'STRETCH') return null
  if (constraint === 'SCALE' && parent[size] > 0) return percent(node[size] / parent[size])
  return undefined
}

function centred(offset: number): string {
  return `calc(50% ${offset < 0 ? '-' : '+'} ${px(round(Math.abs(offset)))})`
}

function writePinned(style: CSSDeclarations, node: SceneNode, parent: SceneNode): void {
  for (const axis of AXES) {
    const start = node[axis.position]
    const frame = parent[axis.size]
    const end = frame - start - node[axis.size]
    const constraint = hugsAxis(parent, axis.size) ? 'MIN' : node[axis.constraint]
    if (constraint === 'MAX') style[axis.end] = px(round(end))
    // The start edge's offset from the frame's centre, so `left` keeps the layer where it is.
    else if (constraint === 'CENTER') style[axis.start] = centred(start - frame / 2)
    else if (constraint === 'SCALE' && frame > 0) style[axis.start] = percent(start / frame)
    else {
      style[axis.start] = px(start)
      if (constraint === 'STRETCH') style[axis.end] = px(round(end))
    }
  }
}

const CENTRED = /^calc\(\s*50%\s*([+-])\s*(\d*\.?\d+)px\s*\)$/
const PERCENT = /^(-?\d*\.?\d+)%$/

/** Reads an axis's insets back into its constraint and position, measured in `parent` if known. */
function readPinnedAxis(
  style: CSSDeclarations,
  node: SceneNode,
  axis: Axis,
  frame: number | undefined
): void {
  const startValue = pickStyle(style, axis.start)?.trim() ?? ''
  const start = firstCSSNumber(style, axis.start)
  const end = firstCSSNumber(style, axis.end)
  const centre = CENTRED.exec(startValue)
  const share = PERCENT.exec(startValue)
  if (start !== null && end !== null) {
    node[axis.constraint] = 'STRETCH'
    node[axis.position] = start
    if (frame !== undefined && !(axis.size in style))
      node[axis.size] = Math.max(0, frame - start - end)
  } else if (start !== null) {
    node[axis.constraint] = 'MIN'
    node[axis.position] = start
  } else if (end !== null) {
    node[axis.constraint] = 'MAX'
    if (frame !== undefined) node[axis.position] = frame - end - node[axis.size]
  } else if (centre) {
    node[axis.constraint] = 'CENTER'
    const offset = Number(centre[2]) * (centre[1] === '-' ? -1 : 1)
    if (frame !== undefined) node[axis.position] = frame / 2 + offset
  } else if (share) {
    node[axis.constraint] = 'SCALE'
    const sizeShare = PERCENT.exec(pickStyle(style, axis.size)?.trim() ?? '')
    if (frame !== undefined) {
      node[axis.position] = (Number(share[1]) / 100) * frame
      if (sizeShare) node[axis.size] = (Number(sizeShare[1]) / 100) * frame
    }
  }
}

/**
 * Place a layer at its coordinates when its parent does not lay it out: it is absolutely
 * positioned, or its parent frame has no auto layout. A frame without auto layout becomes the
 * containing block of the children it places. Projected CSS marks every child of such a frame
 * absolute, which is its free position there, not absolute positioning in auto layout. A layer
 * absolutely positioned in auto layout is pinned by its constraints instead (`writePinned`).
 */
export const position: PropertyFamily = {
  name: 'position',
  dependsOnParent: true,
  fields: [
    'layoutPositioning',
    'layoutMode',
    'type',
    'childIds',
    'x',
    'y',
    'width',
    'height',
    'horizontalConstraint',
    'verticalConstraint'
  ],
  properties: ['position', 'left', 'top', 'right', 'bottom'],
  write(style, node, { parent }) {
    if (parent && pinnedInLayout(node, parent)) {
      style.position = 'absolute'
      writePinned(style, node, parent)
      return
    }
    // A top-level layer is its own artboard: its coordinates place the artboard on the page,
    // not the layer inside it.
    const topLevel = parent?.type === 'CANVAS'
    const placed =
      (node.layoutPositioning === 'ABSOLUTE' && !topLevel) ||
      (parent !== undefined && !topLevel && parent.layoutMode === 'NONE')
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
    if ((placement === 'absolute' || placement === 'fixed') && !freelyPlaced) {
      node.layoutPositioning = 'ABSOLUTE'
      const parent = projected?.parent
      for (const axis of AXES) readPinnedAxis(style, node, axis, parent?.[axis.size])
      return
    }

    const left = firstCSSNumber(style, 'left')
    const top = firstCSSNumber(style, 'top')
    if (left !== null) node.x = left
    if (top !== null) node.y = top
  }
}
