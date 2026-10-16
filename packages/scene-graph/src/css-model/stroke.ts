import type { SceneNode, Stroke } from '../types'
import { colorToStrokeFromCSS, pickStyle } from './from-css'
import { outlineStroke } from './paint-from-css'
import { strokeColorToCSS } from './to-css'
import {
  type CSSDeclarations,
  type FieldCSS,
  type PropertyFamily,
  firstCSSNumber,
  px
} from './types'

const SIDES = ['top', 'right', 'bottom', 'left'] as const
const SIDE_WEIGHTS = {
  top: 'borderTopWeight',
  right: 'borderRightWeight',
  bottom: 'borderBottomWeight',
  left: 'borderLeftWeight'
} as const

/** Where an outline sits so it draws a stroke inside, centered on, or outside the edge. */
function outlineOffset(align: SceneNode['strokeAlign'], weight: number): number {
  if (align === 'INSIDE') return -weight
  if (align === 'CENTER') return -weight / 2
  return 0
}

/**
 * A line has no height, so an outline around its box draws nothing. A solid line is a shadow as
 * thick as its stroke, centered on it, which leaves layout alone; a dashed one is a top border.
 */
function writeLineStroke(
  style: CSSDeclarations,
  weight: number,
  borderStyle: string,
  color: string,
  css: FieldCSS
): void {
  if (borderStyle === 'solid') {
    style['box-shadow'] = `0 0 0 ${px(weight / 2)} ${color}`
    return
  }
  style['border-top'] = `${css('strokeWeight', px(weight))} ${borderStyle} ${color}`
}

function writeStroke(style: CSSDeclarations, node: SceneNode, css: FieldCSS): void {
  const stroke = node.strokes.at(0)
  const literalColor = strokeColorToCSS(stroke)
  if (!literalColor || !stroke) return
  const color = css('strokes/0/color', literalColor)
  const borderStyle = node.dashPattern.length > 0 ? 'dashed' : 'solid'
  if (node.type === 'LINE') {
    writeLineStroke(style, stroke.weight, borderStyle, color, css)
    return
  }
  // A stroke takes no room in auto layout unless the design says so: an outline draws it
  // without moving the content, inside, centered on, or outside the edge.
  if (!node.independentStrokeWeights && !node.strokesIncludedInLayout) {
    const weight = stroke.weight
    style.outline = `${css('strokeWeight', px(weight))} ${borderStyle} ${color}`
    const offset = outlineOffset(node.strokeAlign, weight)
    if (offset !== 0) style['outline-offset'] = px(offset)
    return
  }
  if (!node.independentStrokeWeights) {
    style.border = `${css('strokeWeight', px(stroke.weight))} solid ${color}`
    if (borderStyle !== 'solid') style['border-style'] = borderStyle
    return
  }

  style['border-style'] = borderStyle
  style['border-color'] = color
  for (const side of SIDES) {
    const field = SIDE_WEIGHTS[side]
    style[`border-${side}-width`] = css(field, px(node[field]))
  }
}

function firstSideValue(style: CSSDeclarations, part: 'color' | 'style') {
  return (
    pickStyle(style, `border-${part}`) ??
    SIDES.map((side) => pickStyle(style, `border-${side}-${part}`)).find(
      (value) => value !== undefined
    )
  )
}

function strokeWeightFromStyle(style: CSSDeclarations) {
  const borderWidth = firstCSSNumber(style, 'border-width')
  if (borderWidth !== null) return borderWidth
  const sideWeights = SIDES.map((side) => firstCSSNumber(style, `border-${side}-width`)).filter(
    (weight): weight is number => weight !== null
  )
  if (sideWeights.length === 0) return null
  return Math.max(...sideWeights)
}

function dashPatternFromCSS(style: CSSDeclarations, strokeWeight: number): number[] {
  const borderStyle = firstSideValue(style, 'style')
  if (borderStyle === 'dashed') return [strokeWeight * 3, strokeWeight * 2]
  if (borderStyle === 'dotted') return [strokeWeight, strokeWeight]
  return []
}

function readBorderWeights(node: SceneNode, style: CSSDeclarations, stroke: Stroke): void {
  for (const side of SIDES)
    node[SIDE_WEIGHTS[side]] = firstCSSNumber(style, `border-${side}-width`) ?? stroke.weight
  node.independentStrokeWeights = SIDES.some((side) => node[SIDE_WEIGHTS[side]] !== stroke.weight)
}

function readStroke(style: CSSDeclarations, node: SceneNode): void {
  const strokes = colorToStrokeFromCSS(
    firstSideValue(style, 'color'),
    strokeWeightFromStyle(style)?.toString()
  )
  if (strokes.length > 0) {
    const dashPattern = dashPatternFromCSS(style, strokes[0].weight)
    if (dashPattern.length > 0) {
      strokes[0].dashPattern = dashPattern
      node.dashPattern = dashPattern
    }
    node.strokes = strokes
    node.strokeWeight = strokes[0].weight
    // A CSS border takes room in the layout; the stroke keeps doing so, and exports as a border.
    node.strokesIncludedInLayout = true
    strokes[0].align = 'INSIDE'
    node.strokeAlign = 'INSIDE'
    readBorderWeights(node, style, strokes[0])
    return
  }

  // An outline draws a stroke that takes no room, as auto layout strokes do by default.
  const outline = outlineStroke(style)
  if (!outline) return
  node.strokes = [outline.stroke]
  node.strokeWeight = outline.stroke.weight
  node.strokeAlign = outline.stroke.align
  node.strokesIncludedInLayout = false
  if (outline.dashed) node.dashPattern = [outline.stroke.weight * 3, outline.stroke.weight * 2]
}

/** Strokes are borders when they take room in the layout, outlines when they do not. */
export const stroke: PropertyFamily = {
  name: 'stroke',
  fields: [
    'strokes',
    'strokeWeight',
    'strokeAlign',
    'strokesIncludedInLayout',
    'dashPattern',
    'type',
    'independentStrokeWeights',
    'borderTopWeight',
    'borderRightWeight',
    'borderBottomWeight',
    'borderLeftWeight'
  ],
  properties: [
    'border',
    'border-top',
    'border-style',
    'border-color',
    'border-width',
    ...SIDES.flatMap((side) => [
      `border-${side}-width`,
      `border-${side}-color`,
      `border-${side}-style`
    ]),
    'outline',
    'outline-offset'
  ],
  write: (style, node, { css }) => writeStroke(style, node, css),
  read: readStroke
}
