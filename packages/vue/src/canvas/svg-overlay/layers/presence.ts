import type { PresenceCursor } from '@kalka/core/canvas'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type MeasureText, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

const CURSOR_SIZE = 9
const LABEL_PADDING_X = 4
const LABEL_PADDING_Y = 2
const LABEL_FONT_SIZE = 10
const LABEL_OFFSET_X = 12
const LABEL_OFFSET_Y = 20
const LABEL_RADIUS = 4
/** Baseline below the pill's vertical center for 10px Inter. */
const LABEL_TEXT_BASELINE = 3.5
/** Longer names end with an ellipsis. */
const LABEL_MAX_WIDTH = 160
const ELLIPSIS = '…'
/** The sparkle that marks an agent's name. */
const LABEL_SPARKLE_RADIUS = 4
const LABEL_SPARKLE_GAP = 3
const SELECTION_ALPHA = 0.6
const SELECTION_STROKE_WIDTH = 1.5

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })

function selectionOutlines(context: OverlayContext, cursor: PresenceCursor): OverlayShape[] {
  const { graph, view } = context
  const { panX, panY, zoom } = view
  const paint = {
    stroke: css(cursor.color, SELECTION_ALPHA),
    strokeWidth: SELECTION_STROKE_WIDTH
  }
  const shapes: OverlayShape[] = []
  // Outlines of what is not a layer yet, such as JSX an agent is still streaming.
  for (const rect of cursor.outline ?? []) {
    shapes.push({
      type: 'rect',
      x: rect.x * zoom + panX,
      y: rect.y * zoom + panY,
      width: rect.width * zoom,
      height: rect.height * zoom,
      ...paint
    })
  }
  for (const nodeId of cursor.selection ?? []) {
    const node = graph.getNode(nodeId)
    if (!node) continue
    // Corners through the world matrix, as the shape is rendered, so the box tracks rotation,
    // flips and parent transforms.
    const corners = Matrix.mapPoints(getWorldMatrix(node, graph), [
      0,
      0,
      node.width,
      0,
      node.width,
      node.height,
      0,
      node.height
    ])
    shapes.push({
      type: 'polygon',
      points: Array.from(corners, (value, index) =>
        index % 2 === 0 ? value * zoom + panX : value * zoom + panY
      ),
      ...paint
    })
  }
  return shapes
}

function arrowPoints(x: number, y: number): number[] {
  const S = CURSOR_SIZE
  return [
    x,
    y,
    x,
    y + S * 1.35,
    x + S * 0.38,
    y + S * 1.0,
    x + S * 0.72,
    y + S * 1.5,
    x + S * 0.92,
    y + S * 1.38,
    x + S * 0.58,
    y + S * 0.88,
    x + S * 1.0,
    y + S * 0.82
  ]
}

/** A four-point sparkle of radius `R` centered on `cx`, `cy`. */
function sparklePoints(cx: number, cy: number, R: number): number[] {
  const inner = R * 0.32
  return [
    cx,
    cy - R,
    cx + inner,
    cy - inner,
    cx + R,
    cy,
    cx + inner,
    cy + inner,
    cx,
    cy + R,
    cx - inner,
    cy + inner,
    cx - R,
    cy,
    cx - inner,
    cy - inner
  ]
}

/** `text` cut to fit `maxWidth`, ending with an ellipsis when it was cut, and its width. */
export function fitLabel(
  measureText: MeasureText,
  text: string,
  fontSize: number,
  maxWidth: number
): { text: string; width: number } {
  const full = measureText(text, fontSize)
  if (full <= maxWidth) return { text, width: full }
  const chars = Array.from(text)
  let low = 0
  let high = chars.length
  // The longest prefix that still fits with the ellipsis.
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (measureText(chars.slice(0, mid).join('') + ELLIPSIS, fontSize) <= maxWidth) low = mid
    else high = mid - 1
  }
  const cut = chars.slice(0, low).join('').trimEnd() + ELLIPSIS
  return { text: cut, width: Math.min(measureText(cut, fontSize), maxWidth) }
}

/** The pointer, filled with a person's color, or for an agent its owner's, outlined in white. */
function arrow(x: number, y: number, cursor: PresenceCursor): OverlayShape[] {
  const points = arrowPoints(x, y)
  return [
    { type: 'polygon', points, stroke: WHITE, strokeWidth: 2 },
    { type: 'polygon', points, fill: css(cursor.color, 1) }
  ]
}

/**
 * A name pill: filled for people; for agents outlined in the owner's color, with a sparkle
 * before the name.
 */
function label(
  context: OverlayContext,
  x: number,
  y: number,
  cursor: PresenceCursor
): OverlayShape[] {
  if (!cursor.name) return []
  const color = css(cursor.color, 1)
  const agent = cursor.kind === 'agent'
  const badge = agent ? LABEL_SPARKLE_RADIUS * 2 + LABEL_SPARKLE_GAP : 0
  const pillX = x + LABEL_OFFSET_X - LABEL_PADDING_X
  const pillY = y + LABEL_OFFSET_Y - LABEL_FONT_SIZE - LABEL_PADDING_Y + 2
  const pillHeight = LABEL_FONT_SIZE + LABEL_PADDING_Y * 2
  const fitted = fitLabel(context.measureText, cursor.name, LABEL_FONT_SIZE, LABEL_MAX_WIDTH)
  const shapes: OverlayShape[] = [
    {
      type: 'rect',
      x: pillX,
      y: pillY,
      width: badge + fitted.width + LABEL_PADDING_X * 2,
      height: pillHeight,
      rx: LABEL_RADIUS,
      fill: agent ? WHITE : color,
      stroke: agent ? color : undefined,
      strokeWidth: agent ? 1 : undefined
    }
  ]
  if (agent) {
    shapes.push({
      type: 'polygon',
      points: sparklePoints(
        pillX + LABEL_PADDING_X + LABEL_SPARKLE_RADIUS,
        pillY + pillHeight / 2,
        LABEL_SPARKLE_RADIUS
      ),
      fill: color
    })
  }
  shapes.push({
    type: 'text',
    x: pillX + LABEL_PADDING_X + badge,
    y: pillY + pillHeight / 2 + LABEL_TEXT_BASELINE,
    text: fitted.text,
    fill: agent ? color : WHITE,
    fontSize: LABEL_FONT_SIZE
  })
  return shapes
}

/** Cursors of people and agents in screen space, with outlines of what they selected. */
export function presenceLayer(context: OverlayContext): OverlayShape[] {
  const { panX, panY, zoom } = context.view
  const shapes: OverlayShape[] = []
  for (const cursor of context.overlays.presenceCursors ?? []) {
    const x = cursor.x * zoom + panX
    const y = cursor.y * zoom + panY
    shapes.push(
      ...selectionOutlines(context, cursor),
      ...arrow(x, y, cursor),
      ...label(context, x, y, cursor)
    )
  }
  return shapes
}
