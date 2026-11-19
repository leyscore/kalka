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
  /**
   * The region the agent works in right now, while it is at work: its tag carries a small
   * pixel loader, so the build has one calm place that says it is still going.
   */
  busy?: boolean
}

/** How the loader on a busy mark's tag moves: one step this often, on the overlay's clock. */
export const LOADER_STEP_MS = 110
/** The loader is a 3×3 grid of square pixels; the lit one walks round its edge. */
const LOADER_PIXEL = 2
const LOADER_GAP = 1
const LOADER_SIZE = LOADER_PIXEL * 3 + LOADER_GAP * 2
const LOADER_TEXT_GAP = 5
/** The outer cells clockwise from the top-left, as column and row. */
const LOADER_RING: readonly (readonly [number, number])[] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
  [1, 2],
  [0, 2],
  [0, 1]
]
/** How bright each ring cell is by how far it trails the lit one; the center stays dim. */
const LOADER_TRAIL = [1, 0.7, 0.45, 0.3]
const LOADER_REST_ALPHA = 0.3
const LOADER_STILL_ALPHA = 0.75

/** How the overlay animates a mark: the time now, and whether motion is reduced. */
export interface AgentWorkClock {
  now: number
  still?: boolean
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

/** Which step the loaders are at `now`; the overlay redraws only when it changes. */
export function loaderStep(now: number): number {
  return Math.floor(now / LOADER_STEP_MS)
}

/** The pixel loader with its top-left at `x`, `y`: steady when motion is reduced. */
export function pixelLoader(x: number, y: number, clock: AgentWorkClock): OverlayShape[] {
  const lit = loaderStep(clock.now) % LOADER_RING.length
  const shapes: OverlayShape[] = []
  const cell = (column: number, row: number, alpha: number) =>
    shapes.push({
      type: 'rect',
      x: x + column * (LOADER_PIXEL + LOADER_GAP),
      y: y + row * (LOADER_PIXEL + LOADER_GAP),
      width: LOADER_PIXEL,
      height: LOADER_PIXEL,
      fill: WHITE,
      opacity: alpha
    })
  LOADER_RING.forEach(([column, row], index) => {
    const behind = (lit - index + LOADER_RING.length) % LOADER_RING.length
    const alpha = clock.still ? LOADER_STILL_ALPHA : (LOADER_TRAIL[behind] ?? LOADER_REST_ALPHA)
    cell(column, row, alpha)
  })
  cell(1, 1, LOADER_REST_ALPHA)
  return shapes
}

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
  top: number,
  clock: AgentWorkClock
): OverlayShape[] {
  const fitted = fitLabel(context.measureText, mark.name, LABEL_FONT_SIZE, LABEL_MAX_WIDTH)
  const loader = mark.busy ? LOADER_SIZE + LOADER_TEXT_GAP : 0
  const width = loader + fitted.width + LABEL_PADDING_X * 2
  const x = right - width
  const y = top - LABEL_GAP - LABEL_HEIGHT
  const shapes: OverlayShape[] = [
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
      x: x + LABEL_PADDING_X + loader,
      y: y + LABEL_HEIGHT / 2 + LABEL_TEXT_BASELINE,
      text: fitted.text,
      fill: WHITE,
      fontSize: LABEL_FONT_SIZE,
      fontWeight: 500
    }
  ]
  if (mark.busy)
    shapes.push(...pixelLoader(x + LABEL_PADDING_X, y + (LABEL_HEIGHT - LOADER_SIZE) / 2, clock))
  return shapes
}

/**
 * Layers agents are building: a dashed outline in the agent's color and a tag with its name.
 * The region an agent works in now carries a pixel loader that steps a few times a second;
 * everything else is static, so it costs nothing between edits.
 */
export function agentWorkLayer(
  context: OverlayContext,
  marks: readonly AgentWorkMark[],
  clock: AgentWorkClock = { now: 0, still: true }
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
    // Where an agent works now is always tagged, so its loader shows however small it is.
    if (!mark.busy && (!large || labels >= MAX_WORK_LABELS)) continue
    labels++
    shapes.push(...nameTag(context, mark, right, top, clock))
  }
  return shapes
}
