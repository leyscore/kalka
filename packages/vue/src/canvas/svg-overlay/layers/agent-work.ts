import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'
import type { Color } from '@kalka/scene-graph/primitives'

import { fitLabel } from '#vue/canvas/svg-overlay/layers/presence'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** A layer an agent is building, marked with its name until it lets go. */
export interface AgentWorkMark {
  nodeId: string
  /** The agent's callsign. */
  name: string
  /** The agent's color: its owner's in a room. */
  color: Color
}

/** Marks drawn per frame; an agent rarely holds more, and the rest wait for it to let go. */
export const MAX_DRAWN_WORK_MARKS = 48
/** Name tags drawn per frame, so a crowd of small layers does not fill the view with text. */
const MAX_WORK_LABELS = 12
/** A layer smaller than this on screen keeps its outline but gets no name tag. */
const MIN_LABELED_SIZE = 24
const OUTLINE_ALPHA = 0.85
const OUTLINE_WIDTH = 1
const OUTLINE_DASH: readonly [number, number] = [4, 3]
const LABEL_FONT_SIZE = 10
const LABEL_PADDING_X = 5
const LABEL_HEIGHT = 16
const LABEL_GAP = 4
const LABEL_RADIUS = 4
const LABEL_MAX_WIDTH = 120
/** Baseline below the tag's vertical center for 10px Inter. */
const LABEL_TEXT_BASELINE = 3.5

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })

/** The layer's corners on screen, through its world matrix, so the mark turns with it. */
function screenCorners(context: OverlayContext, nodeId: string): number[] | null {
  const { graph, view } = context
  const node = graph.getNode(nodeId)
  if (!node) return null
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
  return Array.from(corners, (value, index) =>
    index % 2 === 0 ? value * view.zoom + view.panX : value * view.zoom + view.panY
  )
}

/** A filled tag with the agent's name, right-aligned above the layer, clear of frame titles. */
function nameTag(
  context: OverlayContext,
  mark: AgentWorkMark,
  right: number,
  top: number
): OverlayShape[] {
  const fitted = fitLabel(context.measureText, mark.name, LABEL_FONT_SIZE, LABEL_MAX_WIDTH)
  const width = fitted.width + LABEL_PADDING_X * 2
  const x = right - width
  const y = top - LABEL_GAP - LABEL_HEIGHT
  return [
    {
      type: 'rect',
      x,
      y,
      width,
      height: LABEL_HEIGHT,
      rx: LABEL_RADIUS,
      fill: css(mark.color, 1)
    },
    {
      type: 'text',
      x: x + LABEL_PADDING_X,
      y: y + LABEL_HEIGHT / 2 + LABEL_TEXT_BASELINE,
      text: fitted.text,
      fill: WHITE,
      fontSize: LABEL_FONT_SIZE,
      fontWeight: 500
    }
  ]
}

/**
 * Layers agents are building: a dashed outline in the agent's color and a tag with its name.
 * Static, so it costs nothing between edits and stays calm while the agent thinks.
 */
export function agentWorkLayer(
  context: OverlayContext,
  marks: readonly AgentWorkMark[]
): OverlayShape[] {
  const shapes: OverlayShape[] = []
  let labels = 0
  for (const mark of marks.slice(0, MAX_DRAWN_WORK_MARKS)) {
    const points = screenCorners(context, mark.nodeId)
    if (!points) continue
    shapes.push({
      type: 'polygon',
      points,
      stroke: css(mark.color, OUTLINE_ALPHA),
      strokeWidth: OUTLINE_WIDTH,
      dash: OUTLINE_DASH
    })
    const xs = points.filter((_, index) => index % 2 === 0)
    const ys = points.filter((_, index) => index % 2 === 1)
    const right = Math.max(...xs)
    const top = Math.min(...ys)
    const large =
      right - Math.min(...xs) >= MIN_LABELED_SIZE && Math.max(...ys) - top >= MIN_LABELED_SIZE
    if (!large || labels >= MAX_WORK_LABELS) continue
    labels++
    shapes.push(...nameTag(context, mark, right, top))
  }
  return shapes
}
