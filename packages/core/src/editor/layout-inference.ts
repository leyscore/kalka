import type { LayoutCounterAlign } from '@kalka/scene-graph'
import type { Rect } from '@kalka/scene-graph/primitives'

/**
 * How auto layout reads layers that are already placed, as Figma does when a frame gains auto
 * layout or Shift+A wraps a selection: the flow follows how they are spread, the spacing is the
 * gap they already have, and the order is their order along the flow.
 */
export type FlowDirection = 'HORIZONTAL' | 'VERTICAL'

const ALIGN_TOLERANCE = 1

const start = (box: Rect, mode: FlowDirection) => (mode === 'HORIZONTAL' ? box.x : box.y)
const extent = (box: Rect, mode: FlowDirection) => (mode === 'HORIZONTAL' ? box.width : box.height)
const center = (box: Rect, mode: FlowDirection) => start(box, mode) + extent(box, mode) / 2
const spread = (values: readonly number[]) => Math.max(...values) - Math.min(...values)

/**
 * A row when the layers' centres spread further across than down, a column otherwise; one layer
 * makes a column. Comparing centres rather than the selection's bounds keeps three tall cards side
 * by side a row.
 */
export function inferredFlow(boxes: readonly Rect[]): FlowDirection {
  if (boxes.length < 2) return 'VERTICAL'
  const across = spread(boxes.map((box) => center(box, 'HORIZONTAL')))
  const down = spread(boxes.map((box) => center(box, 'VERTICAL')))
  return across > down ? 'HORIZONTAL' : 'VERTICAL'
}

/** The indexes of `boxes` in their order along the flow, the order auto layout lays them in. */
export function flowOrder(boxes: readonly Rect[], mode: FlowDirection): number[] {
  const across: FlowDirection = mode === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL'
  return boxes
    .map((box, index) => ({ box, index }))
    .toSorted(
      (a, b) =>
        center(a.box, mode) - center(b.box, mode) || start(a.box, across) - start(b.box, across)
    )
    .map(({ index }) => index)
}

/** The average gap between neighbours along the flow, so the row keeps its length; never negative. */
export function inferredSpacing(boxes: readonly Rect[], mode: FlowDirection): number {
  if (boxes.length < 2) return 0
  const sorted = flowOrder(boxes, mode).map((index) => boxes[index])
  let gaps = 0
  for (let i = 1; i < sorted.length; i++) {
    gaps += start(sorted[i], mode) - (start(sorted[i - 1], mode) + extent(sorted[i - 1], mode))
  }
  return Math.max(0, Math.round(gaps / (sorted.length - 1)))
}

/**
 * The alignment across the flow the layers already share: centred when their centres line up,
 * to the end when only their far edges do, to the start otherwise.
 */
export function inferredCounterAlign(
  boxes: readonly Rect[],
  mode: FlowDirection
): LayoutCounterAlign {
  if (boxes.length < 2) return 'MIN'
  const across: FlowDirection = mode === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL'
  const lined = (value: (box: Rect) => number) => spread(boxes.map(value)) <= ALIGN_TOLERANCE
  if (lined((box) => start(box, across))) return 'MIN'
  if (lined((box) => center(box, across))) return 'CENTER'
  if (lined((box) => start(box, across) + extent(box, across))) return 'MAX'
  return 'MIN'
}
