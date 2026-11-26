import { canTidyUp, smartGaps, smartSelectionOf } from '@kalka/core/editor'
import type { SmartGap, SmartGrid } from '@kalka/core/editor'
import type { SceneGraph } from '@kalka/scene-graph'
import { getAbsolutePositionFull } from '@kalka/scene-graph/coordinate'
import type { Rect, Vector } from '@kalka/scene-graph/primitives'

/** Screen pixels from the selection's bottom right corner to the Tidy up button. */
export const TIDY_BUTTON_OFFSET = 8
/** The Tidy up button's side, in screen pixels. */
export const TIDY_BUTTON_SIZE = 20
/** Screen radius of a layer's centre handle as drawn, and the reach that picks it up. */
export const CENTER_HANDLE_RADIUS = 4
const CENTER_HIT_RADIUS = 8
/** Screen length of a gap's handle across the gap, and how far either side of it a press reaches. */
export const GAP_HANDLE_LENGTH = 12
const GAP_HIT_HALF_LENGTH = 10
const GAP_HIT_MIN_HALF_WIDTH = 4
/** Past this many selected layers the canvas skips the handles, which it works out every frame. */
const MAX_LAYERS = 250

/** A smart selection's handles on the page: its gaps and the centres of its layers. */
export interface SmartSelectionHandles {
  grid: SmartGrid
  gaps: SmartGap[]
  centers: { id: string; point: Vector }[]
}

/** What the canvas shows for the selection: smart selection handles, or the Tidy up button. */
export interface SmartSelectionChrome {
  handles: SmartSelectionHandles | null
  /** The Tidy up button's box on the page, when the selection is not arranged. */
  tidy: Rect | null
}

/** A handle under a point: a gap along its axis, a layer's centre, or the Tidy up button. */
export type SmartSelectionHit =
  | { kind: 'gap'; axis: 'x' | 'y' }
  | { kind: 'center'; nodeId: string }
  | { kind: 'tidy' }

/** The bottom right corner of what the selected layers cover. */
function selectionCorner(graph: SceneGraph, ids: ReadonlySet<string>): Vector | null {
  const boxes = [...ids].flatMap((id) => {
    const node = graph.getNode(id)
    if (!node) return []
    const box = getAbsolutePositionFull(node, graph)
    return [{ x: box.boundX + box.width, y: box.boundY + box.height }]
  })
  if (boxes.length === 0) return null
  return { x: Math.max(...boxes.map((box) => box.x)), y: Math.max(...boxes.map((box) => box.y)) }
}

/** The smart selection chrome for the selected layers, in canvas coordinates. */
export function smartSelectionChrome(
  graph: SceneGraph,
  selectedIds: ReadonlySet<string>,
  zoom: number
): SmartSelectionChrome {
  if (selectedIds.size < 2 || selectedIds.size > MAX_LAYERS) return { handles: null, tidy: null }
  const grid = smartSelectionOf(graph, selectedIds)
  const handles = grid
    ? {
        grid,
        gaps: smartGaps(grid),
        centers: grid.rows.flat().map((item) => ({
          id: item.id,
          point: { x: item.x + item.width / 2, y: item.y + item.height / 2 }
        }))
      }
    : null
  if (grid || !canTidyUp(graph, selectedIds)) return { handles, tidy: null }
  const corner = selectionCorner(graph, selectedIds)
  if (!corner) return { handles, tidy: null }
  const size = TIDY_BUTTON_SIZE / zoom
  const offset = TIDY_BUTTON_OFFSET / zoom
  return {
    handles,
    tidy: { x: corner.x + offset, y: corner.y + offset, width: size, height: size }
  }
}

function gapHit(gap: SmartGap, point: Vector, zoom: number): boolean {
  const along = gap.axis
  const across = along === 'x' ? 'y' : 'x'
  const size = along === 'x' ? gap.width : gap.height
  const crossSize = along === 'x' ? gap.height : gap.width
  const center = {
    x: gap.x + gap.width / 2,
    y: gap.y + gap.height / 2
  }
  const halfWidth = Math.max(size / 2, GAP_HIT_MIN_HALF_WIDTH / zoom)
  const halfLength = Math.min(crossSize / 2, GAP_HIT_HALF_LENGTH / zoom)
  return (
    Math.abs(point[along] - center[along]) <= halfWidth &&
    Math.abs(point[across] - center[across]) <= halfLength
  )
}

/** The handle under a canvas point, the Tidy up button first, then centres, then gaps. */
export function hitSmartSelection(
  chrome: SmartSelectionChrome,
  point: Vector,
  zoom: number
): SmartSelectionHit | null {
  const { tidy, handles } = chrome
  if (
    tidy &&
    point.x >= tidy.x &&
    point.x <= tidy.x + tidy.width &&
    point.y >= tidy.y &&
    point.y <= tidy.y + tidy.height
  ) {
    return { kind: 'tidy' }
  }
  if (!handles) return null
  const reach = CENTER_HIT_RADIUS / zoom
  const center = handles.centers.find(
    (c) => Math.hypot(c.point.x - point.x, c.point.y - point.y) <= reach
  )
  if (center) return { kind: 'center', nodeId: center.id }
  const gap = handles.gaps.find((g) => gapHit(g, point, zoom))
  return gap ? { kind: 'gap', axis: gap.axis } : null
}
