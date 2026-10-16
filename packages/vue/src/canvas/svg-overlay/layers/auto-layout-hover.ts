import type { RenderOverlays } from '@kalka/core/canvas'
import {
  AUTO_LAYOUT_HOVER_BLUE,
  AUTO_LAYOUT_HOVER_BLUE_FILL,
  AUTO_LAYOUT_HOVER_MAGENTA,
  AUTO_LAYOUT_HOVER_MAGENTA_FILL,
  AUTO_LAYOUT_HOVER_STRIPE_GAP,
  AUTO_LAYOUT_HOVER_STRIPE_WIDTH,
  AUTO_LAYOUT_HOVER_STROKE_WIDTH,
  AUTO_LAYOUT_HOVER_TICK_LENGTH,
  AUTO_LAYOUT_HOVER_VALUE_OFFSET,
  AUTO_LAYOUT_HOVER_VALUE_PILL_HEIGHT,
  AUTO_LAYOUT_HOVER_VALUE_PILL_PADDING_X,
  AUTO_LAYOUT_HOVER_VALUE_PILL_RADIUS,
  LABEL_FONT_SIZE,
  LAYOUT_OUTLINE_DASH,
  LAYOUT_OUTLINE_GAP,
  SELECTION_COLOR
} from '@kalka/core/constants'
import { createSceneGeometry } from '@kalka/core/geometry'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import type { Color } from '@kalka/scene-graph/primitives'

import { outlineColor, type OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

type Hover = NonNullable<RenderOverlays['autoLayoutHover']>
/** A region in canvas coordinates. */
type RectTuple = [x: number, y: number, width: number, height: number]

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })
/** The narrowest a value pill gets, as in the Skia overlay. */
const MIN_PILL_WIDTH = 24
/** Baseline of the pill's label below the pill's center. */
const PILL_TEXT_OFFSET_Y = 5

function visibleLayoutChildren(node: SceneNode, graph: SceneGraph): SceneNode[] {
  return node.childIds
    .map((id) => graph.getNode(id))
    .filter(
      (child): child is SceneNode =>
        !!child && child.visible && child.layoutPositioning !== 'ABSOLUTE'
    )
}

/**
 * The gaps between consecutive flow children, across the content box. Same region the hover
 * hit test in `shared/input/auto-layout-hover.ts` resolves `spacing` against.
 */
export function autoLayoutGapRects(node: SceneNode, graph: SceneGraph): RectTuple[] {
  const children = visibleLayoutChildren(node, graph)
  if (children.length < 2 || node.itemSpacing <= 0) return []
  const abs = graph.getAbsolutePosition(node.id)
  const isRow = node.layoutMode === 'HORIZONTAL'
  const rects: RectTuple[] = []
  for (let i = 0; i < children.length - 1; i++) {
    const prev = children[i]
    const next = children[i + 1]
    const gapStart = isRow ? prev.x + prev.width : prev.y + prev.height
    const gapEnd = isRow ? next.x : next.y
    if (gapEnd <= gapStart) continue
    rects.push(
      isRow
        ? [
            abs.x + gapStart,
            abs.y + node.paddingTop,
            gapEnd - gapStart,
            node.height - node.paddingTop - node.paddingBottom
          ]
        : [
            abs.x + node.paddingLeft,
            abs.y + gapStart,
            node.width - node.paddingLeft - node.paddingRight,
            gapEnd - gapStart
          ]
    )
  }
  return rects
}

/** The full-bleed band of one padding side, in canvas coordinates. */
export function autoLayoutPaddingRect(
  node: SceneNode,
  graph: SceneGraph,
  side: Hover['side']
): RectTuple | null {
  if (!side) return null
  const abs = graph.getAbsolutePosition(node.id)
  if (side === 'top') return [abs.x, abs.y, node.width, node.paddingTop]
  if (side === 'bottom') {
    return [abs.x, abs.y + node.height - node.paddingBottom, node.width, node.paddingBottom]
  }
  if (side === 'left') return [abs.x, abs.y, node.paddingLeft, node.height]
  return [abs.x + node.width - node.paddingRight, abs.y, node.paddingRight, node.height]
}

/**
 * 45° hatching across a screen rectangle, each stripe clipped to it: the stripes run from
 * bottom-left to top-right, one every `gap` pixels along the bottom edge, as Skia draws them
 * before clipping.
 */
export function stripeSegments(
  left: number,
  top: number,
  right: number,
  bottom: number,
  gap = AUTO_LAYOUT_HOVER_STRIPE_GAP
): [x1: number, y1: number, x2: number, y2: number][] {
  const h = bottom - top
  if (h <= 0 || right <= left || gap <= 0) return []
  const segments: [number, number, number, number][] = []
  for (let sx = left - h; sx < right; sx += gap) {
    // The stripe is (sx + h·t, bottom − h·t) for t in [0, 1]; keep the part over [left, right].
    const t0 = Math.max(0, (left - sx) / h)
    const t1 = Math.min(1, (right - sx) / h)
    if (t1 <= t0) continue
    segments.push([sx + h * t0, bottom - h * t0, sx + h * t1, bottom - h * t1])
  }
  return segments
}

function stripedRect(
  context: OverlayContext,
  [x, y, width, height]: RectTuple,
  color: Color,
  fill: Color
): OverlayShape[] {
  if (width <= 0 || height <= 0) return []
  const { panX, panY, zoom } = context.view
  const left = x * zoom + panX
  const top = y * zoom + panY
  const right = (x + width) * zoom + panX
  const bottom = (y + height) * zoom + panY
  const stroke = css(color)
  return [
    { type: 'rect', x: left, y: top, width: right - left, height: bottom - top, fill: css(fill) },
    ...stripeSegments(left, top, right, bottom).map(([x1, y1, x2, y2]): OverlayShape => ({
      type: 'line',
      x1,
      y1,
      x2,
      y2,
      stroke,
      strokeWidth: AUTO_LAYOUT_HOVER_STRIPE_WIDTH
    }))
  ]
}

function valuePill(context: OverlayContext, text: string, x: number, y: number): OverlayShape[] {
  const width = Math.max(
    MIN_PILL_WIDTH,
    context.measureText(text, LABEL_FONT_SIZE) + AUTO_LAYOUT_HOVER_VALUE_PILL_PADDING_X * 2
  )
  const height = AUTO_LAYOUT_HOVER_VALUE_PILL_HEIGHT
  return [
    {
      type: 'rect',
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      rx: AUTO_LAYOUT_HOVER_VALUE_PILL_RADIUS,
      fill: css(SELECTION_COLOR)
    },
    {
      type: 'text',
      x,
      y: y + PILL_TEXT_OFFSET_Y,
      text,
      fill: WHITE,
      fontSize: LABEL_FONT_SIZE,
      anchor: 'middle'
    }
  ]
}

/** The pill sits up and right of a region's center, so it clears the tick there. */
function pillAt(context: OverlayContext, [x, y, width, height]: RectTuple, value: number) {
  const { panX, panY, zoom } = context.view
  return valuePill(
    context,
    String(Math.round(value)),
    (x + width / 2) * zoom + panX + AUTO_LAYOUT_HOVER_VALUE_OFFSET,
    (y + height / 2) * zoom + panY - AUTO_LAYOUT_HOVER_VALUE_OFFSET
  )
}

function tick(x: number, y: number, axis: 'horizontal' | 'vertical', color: Color): OverlayShape {
  const l = AUTO_LAYOUT_HOVER_TICK_LENGTH
  const paint = { stroke: css(color), strokeWidth: AUTO_LAYOUT_HOVER_STROKE_WIDTH }
  return axis === 'horizontal'
    ? { type: 'line', x1: x - l, y1: y, x2: x + l, y2: y, ...paint }
    : { type: 'line', x1: x, y1: y - l, x2: x, y2: y + l, ...paint }
}

/** Blue ticks mid-padding on each padded side, magenta ticks mid-gap. */
function baselineTicks(context: OverlayContext, node: SceneNode): OverlayShape[] {
  const { graph } = context
  const { panX, panY, zoom } = context.view
  const abs = graph.getAbsolutePosition(node.id)
  const sx = (x: number) => x * zoom + panX
  const sy = (y: number) => y * zoom + panY
  const xCenter = sx(abs.x + node.width / 2)
  const yCenter = sy(abs.y + node.height / 2)
  const blue = AUTO_LAYOUT_HOVER_BLUE
  const shapes: OverlayShape[] = []
  if (node.paddingTop > 0)
    shapes.push(tick(xCenter, sy(abs.y + node.paddingTop / 2), 'horizontal', blue))
  if (node.paddingBottom > 0)
    shapes.push(tick(xCenter, sy(abs.y + node.height - node.paddingBottom / 2), 'horizontal', blue))
  if (node.paddingLeft > 0)
    shapes.push(tick(sx(abs.x + node.paddingLeft / 2), yCenter, 'vertical', blue))
  if (node.paddingRight > 0)
    shapes.push(tick(sx(abs.x + node.width - node.paddingRight / 2), yCenter, 'vertical', blue))

  for (const [x, y, width, height] of autoLayoutGapRects(node, graph)) {
    shapes.push(
      node.layoutMode === 'HORIZONTAL'
        ? tick(sx(x + width / 2), yCenter, 'vertical', AUTO_LAYOUT_HOVER_MAGENTA)
        : tick(xCenter, sy(y + height / 2), 'horizontal', AUTO_LAYOUT_HOVER_MAGENTA)
    )
  }
  return shapes
}

/** Dotted outlines around the visible direct children, in the container's outline color. */
function childOutlines(context: OverlayContext, node: SceneNode): OverlayShape[] {
  const geometry = createSceneGeometry(context.graph)
  const stroke = css(outlineColor(node, context.graph))
  return node.childIds
    .map((id) => context.graph.getNode(id))
    .filter((child): child is SceneNode => !!child && child.visible)
    .map((child) => ({
      type: 'group',
      matrix: geometry.screenMatrix(child, context.view),
      children: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: child.width,
          height: child.height,
          stroke,
          strokeWidth: 1,
          dash: [LAYOUT_OUTLINE_DASH, LAYOUT_OUTLINE_GAP]
        }
      ]
    }))
}

/**
 * Auto layout spacing and padding feedback for the hovered part of a selected flow frame:
 * hatched gaps or padding band, the value pill when the tick is hovered, and the baseline ticks.
 * Hidden while layers transform; the caller also leaves it out while measuring.
 */
export function autoLayoutHoverLayer(context: OverlayContext): OverlayShape[] {
  const { graph, overlays } = context
  const hover = overlays.autoLayoutHover
  if (!hover || overlays.transforming) return []
  const node = graph.getNode(hover.nodeId)
  if (!node || (node.layoutMode !== 'HORIZONTAL' && node.layoutMode !== 'VERTICAL')) return []

  const shapes: OverlayShape[] = []
  if (hover.kind === 'children') shapes.push(...childOutlines(context, node))

  if (hover.kind === 'spacing' || hover.kind === 'spacing-value') {
    const rects = autoLayoutGapRects(node, graph)
    for (const rect of rects) {
      shapes.push(
        ...stripedRect(context, rect, AUTO_LAYOUT_HOVER_MAGENTA, AUTO_LAYOUT_HOVER_MAGENTA_FILL)
      )
    }
    if (hover.kind === 'spacing-value' && rects.length > 0) {
      shapes.push(...pillAt(context, rects[0], node.itemSpacing))
    }
  }

  if (hover.kind === 'padding' || hover.kind === 'padding-value') {
    const rect = autoLayoutPaddingRect(node, graph, hover.side)
    if (rect) {
      shapes.push(
        ...stripedRect(context, rect, AUTO_LAYOUT_HOVER_BLUE, AUTO_LAYOUT_HOVER_BLUE_FILL)
      )
      if (hover.kind === 'padding-value') {
        const value = hover.side === 'left' || hover.side === 'right' ? rect[2] : rect[3]
        shapes.push(...pillAt(context, rect, value))
      }
    }
  }

  shapes.push(...baselineTicks(context, node))
  return shapes
}
