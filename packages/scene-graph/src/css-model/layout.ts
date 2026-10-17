import { getNodeRotationOrigin } from '../coordinate'
import { parseCSSNumber } from '../css'
import { layoutSizingInParent } from '../layout-sizing'
import { resolveNodeTextDirection } from '../text-direction'
import type { SceneNode } from '../types'
import { pickStyle } from './from-css'
import { addGridContainer, addGridPlacement } from './grid'
import { layerTransformFromCSS } from './paint-from-css'
import {
  type CSSDeclarations,
  type FieldCSS,
  type PropertyFamily,
  firstCSSNumber,
  laysOutChildren,
  px
} from './types'

/**
 * Cross-axis alignment of a container's children, or of one child. Auto layout starts children
 * at the start while flexbox stretches them, so start is written out: a child that hugs its
 * content keeps its own size.
 */
function alignToCSS(
  value: SceneNode['counterAxisAlign'] | SceneNode['layoutAlignSelf']
): string | undefined {
  if (value === 'MIN') return 'flex-start'
  if (value === 'CENTER') return 'center'
  if (value === 'MAX') return 'flex-end'
  if (value === 'STRETCH') return 'stretch'
  if (value === 'BASELINE') return 'baseline'
  return undefined
}

function layoutAlignSelfFromCSS(value: string | undefined): SceneNode['layoutAlignSelf'] {
  if (value === 'center') return 'CENTER'
  if (value === 'end' || value === 'flex-end') return 'MAX'
  if (value === 'stretch') return 'STRETCH'
  if (value === 'baseline') return 'BASELINE'
  if (value === 'start' || value === 'flex-start') return 'MIN'
  return 'AUTO'
}

function justifyContentToCSS(value: SceneNode['primaryAxisAlign']): string | undefined {
  if (value === 'CENTER') return 'center'
  if (value === 'MAX') return 'flex-end'
  if (value === 'SPACE_BETWEEN') return 'space-between'
  return undefined
}

function primaryAxisAlignFromCSS(value: string | undefined): SceneNode['primaryAxisAlign'] {
  if (value === 'center') return 'CENTER'
  if (value === 'end' || value === 'flex-end') return 'MAX'
  if (value === 'space-between') return 'SPACE_BETWEEN'
  return 'MIN'
}

function counterAxisAlignFromCSS(value: string | undefined): SceneNode['counterAxisAlign'] {
  if (value === 'center') return 'CENTER'
  if (value === 'end' || value === 'flex-end') return 'MAX'
  if (value === 'stretch') return 'STRETCH'
  if (value === 'baseline') return 'BASELINE'
  return 'MIN'
}

/** Whether a layer fills its flex parent's main axis, sharing the free space with its peers. */
function growsAlongParent(node: SceneNode, parent: SceneNode | undefined): boolean {
  if (!parent || (parent.layoutMode !== 'HORIZONTAL' && parent.layoutMode !== 'VERTICAL'))
    return false
  if (node.layoutPositioning === 'ABSOLUTE') return false
  const axis = parent.layoutMode === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL'
  return node.layoutGrow > 0 || layoutSizingInParent(parent, node, axis) === 'FILL'
}

/**
 * A layer's turn and flips as a CSS `transform`, in the order the canvas applies them
 * (`getNodeLocalMatrix`): the layer turns about its center, or a line about where it starts, and
 * then mirrors about its center.
 */
function layerTransformToCSS(node: SceneNode): string | undefined {
  const turn = node.rotation !== 0 ? `rotate(${node.rotation}deg)` : undefined
  if (!node.flipX && !node.flipY) return turn
  const flip = `scale(${node.flipX ? -1 : 1}, ${node.flipY ? -1 : 1})`
  const origin = getNodeRotationOrigin(node)
  const dx = node.width / 2 - origin.x
  const dy = node.height / 2 - origin.y
  // A line's transform starts where it does, so its flip moves to its center and back.
  const mirror =
    dx === 0 && dy === 0
      ? flip
      : `translate(${dx}px, ${dy}px) ${flip} translate(${-dx}px, ${-dy}px)`
  return turn ? `${mirror} ${turn}` : mirror
}

/**
 * Styles a layer takes from its parent's layout, and its own rotation and flips. Auto layout never
 * squeezes a layer below its size; fill shares the free space equally, from nothing, and may go
 * below its content as Figma's does. That zero minimum is the projection's, not the layer's.
 */
export const layoutChild: PropertyFamily = {
  name: 'layout child',
  dependsOnParent: true,
  fields: [
    'layoutAlignSelf',
    'layoutPositioning',
    'layoutGrow',
    'gridPosition',
    'rotation',
    'flipX',
    'flipY',
    'type',
    'layoutMode',
    'minWidth',
    'minHeight'
  ],
  properties: [
    'align-self',
    'flex-grow',
    'flex-basis',
    'flex-shrink',
    'grid-column',
    'grid-column-start',
    'grid-row',
    'grid-row-start',
    'transform',
    'transform-origin'
  ],
  write(style, node, { parent }) {
    const alignSelf = alignToCSS(node.layoutAlignSelf)
    if (alignSelf) style['align-self'] = alignSelf
    if (parent?.layoutMode === 'GRID') addGridPlacement(style, node)
    else if (parent && parent.layoutMode !== 'NONE' && node.layoutPositioning !== 'ABSOLUTE') {
      if (growsAlongParent(node, parent)) {
        style['flex-grow'] = '1'
        style['flex-basis'] = '0px'
        const minimum = parent.layoutMode === 'HORIZONTAL' ? 'min-width' : 'min-height'
        style[minimum] ??= '0px'
      } else style['flex-shrink'] = '0'
    }
    const transform = layerTransformToCSS(node)
    if (transform) {
      style.transform = transform
      // CSS turns a box about its center, as the layers do, except a line, which turns about
      // where it starts.
      if (node.type === 'LINE') {
        const origin = getNodeRotationOrigin(node)
        style['transform-origin'] = `${origin.x}px ${origin.y}px`
      }
    }
  },
  read(style, node, { projected }) {
    const alignSelf = layoutAlignSelfFromCSS(pickStyle(style, 'align-self'))
    if (alignSelf !== 'AUTO') node.layoutAlignSelf = alignSelf

    const grow = parseCSSNumber(pickStyle(style, 'flex-grow'))
    if (grow !== null && grow > 0) node.layoutGrow = grow

    const transform = layerTransformFromCSS(pickStyle(style, 'transform'))
    if (transform) {
      node.rotation = transform.rotation
      node.flipX = transform.flipX
      node.flipY = transform.flipY
    }

    const parent = projected?.parent
    if (!laysOutChildren(parent) || parent.layoutMode === 'GRID' || node.layoutGrow <= 0) return
    const row = parent.layoutMode === 'HORIZONTAL'
    if (style[row ? 'min-width' : 'min-height'] !== '0px') return
    if (row) node.minWidth = null
    else node.minHeight = null
  }
}

export const direction: PropertyFamily = {
  name: 'direction',
  fields: ['layoutDirection'],
  properties: ['direction'],
  write(style, node) {
    if (node.layoutDirection === 'RTL') style.direction = 'rtl'
  },
  read(style, node) {
    if (pickStyle(style, 'direction') === 'rtl') node.layoutDirection = 'RTL'
  }
}

/** Text runs in the direction its characters set unless the layer says otherwise. */
export const textDirection: PropertyFamily = {
  name: 'text direction',
  fields: ['textDirection', 'text'],
  properties: ['direction'],
  write(style, node) {
    if (resolveNodeTextDirection(node) === 'RTL') style.direction = 'rtl'
  }
}

function writeFlexGap(style: CSSDeclarations, node: SceneNode, css: FieldCSS): void {
  // Figma leaves the spacing between wrapped rows unset when it follows the item spacing.
  const counterSpacing = Number.isFinite(node.counterAxisSpacing)
    ? node.counterAxisSpacing
    : node.itemSpacing
  if (node.itemSpacing <= 0 && counterSpacing <= 0) return
  const item = css('itemSpacing', px(node.itemSpacing))
  if (counterSpacing <= 0 || counterSpacing === node.itemSpacing) {
    style.gap = item
    return
  }

  const counter = css('counterAxisSpacing', px(counterSpacing))
  if (node.layoutMode === 'HORIZONTAL') {
    if (node.itemSpacing > 0) style['column-gap'] = item
    style['row-gap'] = counter
    return
  }

  if (node.itemSpacing > 0) style['row-gap'] = item
  style['column-gap'] = counter
}

function readFlexGap(style: CSSDeclarations, node: SceneNode): void {
  const gap = firstCSSNumber(style, 'gap')
  const rowGap = firstCSSNumber(style, 'row-gap')
  const columnGap = firstCSSNumber(style, 'column-gap')
  const isHorizontal = node.layoutMode === 'HORIZONTAL'
  const isWrapped = node.layoutWrap === 'WRAP'

  node.itemSpacing = (isHorizontal ? columnGap : rowGap) ?? gap ?? 0
  node.counterAxisSpacing = (isHorizontal ? rowGap : columnGap) ?? (isWrapped ? (gap ?? 0) : 0)
}

const PADDING_FIELDS = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const

/** Sides compare by their CSS, so a token and a literal of the same size stay separate. */
function writePadding(style: CSSDeclarations, node: SceneNode, css: FieldCSS): void {
  const [top, right, bottom, left] = PADDING_FIELDS.map((field) => css(field, px(node[field])))
  const zero = px(0)
  if ([top, right, bottom, left].every((value) => value === zero)) return

  if (top === right && right === bottom && bottom === left) {
    style.padding = top
    return
  }

  if (top === bottom && right === left) {
    if (top !== zero) style['padding-block'] = top
    if (right !== zero) style['padding-inline'] = right
    return
  }

  if (top !== zero) style['padding-top'] = top
  if (right !== zero) style['padding-right'] = right
  if (bottom !== zero) style['padding-bottom'] = bottom
  if (left !== zero) style['padding-left'] = left
}

function readPadding(style: CSSDeclarations, node: SceneNode): void {
  node.paddingTop = firstCSSNumber(style, 'padding-top', 'padding-block', 'padding') ?? 0
  node.paddingRight = firstCSSNumber(style, 'padding-right', 'padding-inline', 'padding') ?? 0
  node.paddingBottom = firstCSSNumber(style, 'padding-bottom', 'padding-block', 'padding') ?? 0
  node.paddingLeft = firstCSSNumber(style, 'padding-left', 'padding-inline', 'padding') ?? 0
}

/** Auto layout is flexbox, grid layout is CSS grid; either way padding insets the children. */
export const container: PropertyFamily = {
  name: 'layout container',
  fields: [
    'layoutMode',
    'primaryAxisAlign',
    'counterAxisAlign',
    'layoutWrap',
    'itemSpacing',
    'counterAxisSpacing',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'gridTemplateColumns',
    'gridTemplateRows',
    'gridColumnGap',
    'gridRowGap'
  ],
  properties: [
    'display',
    'flex-direction',
    'justify-content',
    'align-items',
    'flex-wrap',
    'gap',
    'row-gap',
    'column-gap',
    'grid-template-columns',
    'grid-template-rows',
    'padding',
    'padding-block',
    'padding-inline',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left'
  ],
  write(style, node, { css }) {
    if (node.layoutMode === 'NONE') return
    if (node.layoutMode === 'GRID') addGridContainer(style, node, css)
    else {
      style.display = 'flex'
      // Row is the flexbox default.
      if (node.layoutMode === 'VERTICAL') style['flex-direction'] = 'column'
      const justifyContent = justifyContentToCSS(node.primaryAxisAlign)
      const alignItems = alignToCSS(node.counterAxisAlign)
      if (justifyContent) style['justify-content'] = justifyContent
      if (alignItems) style['align-items'] = alignItems
      if (node.layoutWrap === 'WRAP') style['flex-wrap'] = 'wrap'
      writeFlexGap(style, node, css)
    }
    writePadding(style, node, css)
  },
  read(style, node) {
    readPadding(style, node)
    const display = pickStyle(style, 'display')
    if (display !== 'flex' && display !== 'inline-flex') return
    node.layoutMode = pickStyle(style, 'flex-direction') === 'column' ? 'VERTICAL' : 'HORIZONTAL'
    node.primaryAxisAlign = primaryAxisAlignFromCSS(pickStyle(style, 'justify-content'))
    node.counterAxisAlign = counterAxisAlignFromCSS(pickStyle(style, 'align-items'))
    node.layoutWrap = pickStyle(style, 'flex-wrap') === 'wrap' ? 'WRAP' : 'NO_WRAP'
    readFlexGap(style, node)
  }
}
