import { layoutSizingInParent } from '../layout-sizing'
import type { SceneNode } from '../types'
import { pickStyle } from './from-css'
import {
  type CSSDeclarations,
  type PropertyFamily,
  firstCSSNumber,
  laysOutChildren,
  px
} from './types'

type Axis = 'width' | 'height'

/** Whether a layer sizes itself to its content along an axis, so CSS should too. */
export function hugs(node: SceneNode, axis: Axis): boolean {
  if (node.type === 'TEXT')
    return (
      node.textAutoResize === 'WIDTH_AND_HEIGHT' ||
      (axis === 'height' && node.textAutoResize === 'HEIGHT')
    )
  if (node.layoutMode !== 'HORIZONTAL' && node.layoutMode !== 'VERTICAL') return false
  const primary = (node.layoutMode === 'HORIZONTAL') === (axis === 'width')
  return (primary ? node.primaryAxisSizing : node.counterAxisSizing) === 'HUG'
}

/**
 * Whether a layer fills an axis, which a fixed CSS size would prevent: across a flex parent by
 * stretching, along it by growing from a zero basis, or either axis of a grid cell.
 */
function stretches(node: SceneNode, parent: SceneNode | undefined, axis: Axis): boolean {
  const sizing = layoutSizingInParent(parent, node, axis === 'width' ? 'HORIZONTAL' : 'VERTICAL')
  return sizing === 'FILL' && parent !== undefined
}

/** Whether the layer fills its parent along an axis, which leaves the CSS size unset. */
function fillsAxis(node: SceneNode, parent: SceneNode | undefined, axis: Axis) {
  if (!laysOutChildren(parent)) return false
  if (parent.layoutMode === 'GRID') return true
  const along = (parent.layoutMode === 'HORIZONTAL') === (axis === 'width')
  return along ? node.layoutGrow > 0 : node.layoutAlignSelf === 'STRETCH'
}

function aspectRatioFromCSS(value: string | undefined): number | null {
  if (!value || value === 'auto') return null
  const parts = value
    .split('/')
    .map((part) => Number.parseFloat(part.trim()))
    .filter(Number.isFinite)
  if (parts.length === 1 && parts[0] > 0) return parts[0]
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) return parts[0] / parts[1]
  return null
}

/**
 * Projected CSS leaves a size unset where the layer hugs its content: an auto layout frame hugs
 * on the axes it does not fill, and text sizes itself on the axes its CSS leaves open.
 */
function readContentSizing(
  node: SceneNode,
  style: CSSDeclarations,
  parent: SceneNode | undefined
): void {
  const unsized = (axis: Axis) => !(axis in style) && !fillsAxis(node, parent, axis)
  if (node.type === 'TEXT') {
    if (unsized('width') && unsized('height')) node.textAutoResize = 'WIDTH_AND_HEIGHT'
    else if (unsized('height')) node.textAutoResize = 'HEIGHT'
    return
  }
  if (node.layoutMode !== 'HORIZONTAL' && node.layoutMode !== 'VERTICAL') return
  const row = node.layoutMode === 'HORIZONTAL'
  if (unsized(row ? 'width' : 'height')) node.primaryAxisSizing = 'HUG'
  if (unsized(row ? 'height' : 'width')) node.counterAxisSizing = 'HUG'
}

/**
 * A layer's size: fixed on the axes the design fixes, and left to the content where the layer
 * hugs it (an auto layout frame set to Hug, or auto-sizing text), so the page grows with it.
 * Reading it back waits for the layout (see `readContentSizing`), which comes later in the table.
 */
export const size: PropertyFamily = {
  name: 'size',
  dependsOnParent: true,
  fields: [
    'width',
    'height',
    'type',
    'textAutoResize',
    'layoutMode',
    'primaryAxisSizing',
    'counterAxisSizing',
    'layoutPositioning',
    'layoutGrow',
    'layoutAlignSelf'
  ],
  properties: ['width', 'height', 'aspect-ratio'],
  write(style, node, { parent, css }) {
    const sized = (axis: Axis) =>
      node[axis] > 0 && !hugs(node, axis) && !stretches(node, parent, axis)
    if (sized('width')) style.width = css('width', px(node.width))
    if (sized('height')) style.height = css('height', px(node.height))
  },
  read(style, node) {
    const width = firstCSSNumber(style, 'width')
    const height = firstCSSNumber(style, 'height')
    const aspectRatio = aspectRatioFromCSS(pickStyle(style, 'aspect-ratio'))
    if (width !== null) node.width = width
    if (height !== null) node.height = height
    if (height === null && width !== null && aspectRatio !== null) node.height = width / aspectRatio
    if (width === null && height !== null && aspectRatio !== null) node.width = height * aspectRatio
  }
}

/** Hug sizing, read once the layout mode and the parent's sizing of the layer are known. */
export const contentSizing: PropertyFamily = {
  name: 'content sizing',
  dependsOnParent: true,
  fields: [
    'width',
    'height',
    'type',
    'textAutoResize',
    'layoutMode',
    'primaryAxisSizing',
    'counterAxisSizing',
    'layoutGrow',
    'layoutAlignSelf'
  ],
  properties: [],
  read(style, node, { projected }) {
    if (projected) readContentSizing(node, style, projected.parent)
  }
}

const CONSTRAINTS = [
  ['min-width', 'minWidth'],
  ['max-width', 'maxWidth'],
  ['min-height', 'minHeight'],
  ['max-height', 'maxHeight']
] as const

export const sizeConstraints: PropertyFamily = {
  name: 'size constraints',
  fields: ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'],
  properties: CONSTRAINTS.map(([property]) => property),
  write(style, node, { css }) {
    for (const [property, field] of CONSTRAINTS) {
      const value = node[field]
      if (value !== null) style[property] = css(field, px(value))
    }
  },
  read(style, node) {
    for (const [property, field] of CONSTRAINTS) {
      const value = firstCSSNumber(style, property)
      if (value !== null) node[field] = value
    }
  }
}
