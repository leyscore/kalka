import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { getAbsolutePositionFull } from '@kalka/scene-graph/coordinate'
import type { Rect, Vector } from '@kalka/scene-graph/primitives'

import { tidyPositions, tidyRows, type TidyItem } from './tidy'

/** How far, in canvas pixels, a gap or a position may stray and still count as even. */
const TOLERANCE = 0.5

/**
 * Figma's smart selection: layers that stand evenly spaced in a row, a column or a grid. A row
 * or a column only needs even gaps along it; a grid must already be what Tidy up would make.
 */
export interface SmartGrid {
  kind: 'row' | 'column' | 'grid'
  /** The layers row by row, each left to right; a column has one layer per row. */
  rows: TidyItem[][]
  /** The spacing between neighbours across, and between rows down. */
  columnGap: number
  rowGap: number
}

/** A gap between two neighbours, in canvas coordinates, and the axis that widens it. */
export interface SmartGap extends Rect {
  axis: 'x' | 'y'
}

const near = (a: number, b: number) => Math.abs(a - b) <= TOLERANCE

/** The gaps between consecutive layers along an axis, or null if any pair overlaps. */
function linearGaps(items: readonly TidyItem[], axis: 'x' | 'y'): number[] | null {
  const size = axis === 'x' ? 'width' : 'height'
  const gaps = items
    .slice(1)
    .map((item, index) => item[axis] - (items[index][axis] + items[index][size]))
  return gaps.every((gap) => gap >= -TOLERANCE) ? gaps : null
}

function evenGap(gaps: readonly number[] | null): number | null {
  if (!gaps || gaps.length === 0) return null
  const [first] = gaps
  return gaps.every((gap) => near(gap, first)) ? Math.max(0, first) : null
}

function sortedAlong(items: readonly TidyItem[], axis: 'x' | 'y'): TidyItem[] {
  return [...items].sort((a, b) => a[axis] - b[axis] || a.id.localeCompare(b.id))
}

/** The layers as a smart selection, or null when they are fewer than three or not even. */
export function smartGrid(items: readonly TidyItem[]): SmartGrid | null {
  if (items.length < 3) return null
  const rows = tidyRows(items)
  if (rows.length === 1) {
    const row = sortedAlong(items, 'x')
    const gap = evenGap(linearGaps(row, 'x'))
    return gap === null ? null : { kind: 'row', rows: [row], columnGap: gap, rowGap: 0 }
  }
  if (rows.every((row) => row.length === 1)) {
    const column = sortedAlong(items, 'y')
    const gap = evenGap(linearGaps(column, 'y'))
    return gap === null
      ? null
      : { kind: 'column', rows: column.map((item) => [item]), columnGap: 0, rowGap: gap }
  }
  if (!isTidy(items)) return null
  // Tidy, so every column starts one spacing after the widest layer of the column before it.
  const wide = rows.find((row) => row.length > 1) ?? rows[0]
  const firstColumn = Math.max(...rows.map((row) => row[0].width))
  const columnGap = wide.length > 1 ? wide[1].x - wide[0].x - firstColumn : 0
  const firstRow = Math.max(...rows[0].map((item) => item.height))
  const rowGap = rows[1][0].y - rows[0][0].y - firstRow
  return { kind: 'grid', rows, columnGap: Math.max(0, columnGap), rowGap: Math.max(0, rowGap) }
}

/** Whether Tidy up would leave every layer where it is. */
export function isTidy(items: readonly TidyItem[]): boolean {
  const positions = tidyPositions(items)
  return items.every((item) => {
    const target = positions.get(item.id)
    return !!target && near(target.x, item.x) && near(target.y, item.y)
  })
}

/** Whether the layers are already arranged: evenly spaced in a row, a column, or tidy. */
export function isArranged(items: readonly TidyItem[]): boolean {
  if (items.length < 2) return true
  return isTidy(items) || smartGrid(items) !== null
}

/** The span two ranges share, or both of them when they do not meet. */
function span(a: [number, number], b: [number, number]): [number, number] {
  const start = Math.max(a[0], b[0])
  const end = Math.min(a[1], b[1])
  return end > start ? [start, end] : [Math.min(a[0], b[0]), Math.max(a[1], b[1])]
}

/** The gaps the smart selection's handles sit in. */
export function smartGaps(grid: SmartGrid): SmartGap[] {
  const gaps: SmartGap[] = []
  for (const row of grid.rows) {
    for (let index = 1; index < row.length; index++) {
      const before = row[index - 1]
      const after = row[index]
      const [top, bottom] = span(
        [before.y, before.y + before.height],
        [after.y, after.y + after.height]
      )
      const x = before.x + before.width
      gaps.push({ axis: 'x', x, y: top, width: after.x - x, height: bottom - top })
    }
  }
  grid.rows.slice(1).forEach((row, index) => {
    const above = grid.rows[index]
    const lower = Math.max(...above.map((item) => item.y + item.height))
    const upper = Math.min(...row.map((item) => item.y))
    const range = (items: readonly TidyItem[]): [number, number] => [
      Math.min(...items.map((item) => item.x)),
      Math.max(...items.map((item) => item.x + item.width))
    ]
    const [left, right] =
      grid.kind === 'column' ? span(range(above), range(row)) : range([...above, ...row])
    gaps.push({ axis: 'y', x: left, y: lower, width: right - left, height: upper - lower })
  })
  return gaps
}

/** Lays rows out from a corner with the given spacings, each column as wide as its widest. */
function gridPositions(
  rows: readonly TidyItem[][],
  origin: Vector,
  columnGap: number,
  rowGap: number
): Map<string, Vector> {
  const columns = Math.max(0, ...rows.map((row) => row.length))
  const widths = Array.from({ length: columns }, (_, index) =>
    Math.max(0, ...rows.map((row) => row[index]?.width ?? 0))
  )
  const positions = new Map<string, Vector>()
  let top = origin.y
  for (const row of rows) {
    let x = origin.x
    for (const [column, item] of row.entries()) {
      positions.set(item.id, { x, y: top })
      x += widths[column] + columnGap
    }
    top += Math.max(...row.map((item) => item.height)) + rowGap
  }
  return positions
}

/** Packs a row or a column along its axis from its first layer; the other axis stays. */
function linearPositions(items: readonly TidyItem[], axis: 'x' | 'y', start: number, gap: number) {
  const size = axis === 'x' ? 'width' : 'height'
  const positions = new Map<string, Vector>()
  let cursor = start
  for (const item of items) {
    positions.set(item.id, axis === 'x' ? { x: cursor, y: item.y } : { x: item.x, y: cursor })
    cursor += item[size] + gap
  }
  return positions
}

function origin(grid: SmartGrid): Vector {
  const items = grid.rows.flat()
  return {
    x: Math.min(...items.map((item) => item.x)),
    y: Math.min(...items.map((item) => item.y))
  }
}

function layout(grid: SmartGrid, rows: readonly TidyItem[][], columnGap: number, rowGap: number) {
  const corner = origin(grid)
  if (grid.kind === 'row') return linearPositions(rows[0], 'x', corner.x, columnGap)
  if (grid.kind === 'column')
    return linearPositions(
      rows.map((row) => row[0]),
      'y',
      corner.y,
      rowGap
    )
  return gridPositions(rows, corner, columnGap, rowGap)
}

/** Every layer's top left corner once the gaps along `axis` are `gap`, as one handle drags them. */
export function smartGapPositions(
  grid: SmartGrid,
  axis: 'x' | 'y',
  gap: number
): Map<string, Vector> {
  const value = Math.max(0, gap)
  return layout(
    grid,
    grid.rows,
    axis === 'x' ? value : grid.columnGap,
    axis === 'y' ? value : grid.rowGap
  )
}

function center(rect: Rect): Vector {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

/**
 * Where a layer dragged by its centre goes among the others: along a row or a column, after
 * every other layer whose centre the pointer passed; in a grid, the cell nearest the pointer.
 */
export function smartSlotAt(grid: SmartGrid, id: string, point: Vector): number {
  const items = grid.rows.flat()
  if (grid.kind !== 'grid') {
    const axis = grid.kind === 'row' ? 'x' : 'y'
    return items.filter((item) => item.id !== id && center(item)[axis] < point[axis]).length
  }
  let best = 0
  let bestDistance = Number.POSITIVE_INFINITY
  items.forEach((item, index) => {
    const c = center(item)
    const distance = Math.hypot(c.x - point.x, c.y - point.y)
    if (distance < bestDistance) {
      best = index
      bestDistance = distance
    }
  })
  return best
}

/**
 * The layers once `id` takes slot `slot` and the others close up around it, keeping the
 * selection's gaps and the number of layers in each row. Returns their order and corners.
 */
export function smartReorder(
  grid: SmartGrid,
  id: string,
  slot: number
): { order: string[]; positions: Map<string, Vector> } {
  const items = grid.rows.flat()
  const moved = items.find((item) => item.id === id)
  const others = items.filter((item) => item.id !== id)
  const index = Math.max(0, Math.min(others.length, slot))
  const ordered = moved ? [...others.slice(0, index), moved, ...others.slice(index)] : items
  const rows: TidyItem[][] = []
  let cursor = 0
  for (const row of grid.rows) {
    rows.push(ordered.slice(cursor, cursor + row.length))
    cursor += row.length
  }
  return {
    order: ordered.map((item) => item.id),
    positions: layout(grid, rows, grid.columnGap, grid.rowGap)
  }
}

/** Whether a layer may be placed freely: not a flow child of an auto layout frame. */
export function canPositionNode(graph: SceneGraph, node: SceneNode): boolean {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  return !parent || parent.layoutMode === 'NONE' || node.layoutPositioning === 'ABSOLUTE'
}

/** The layers' boxes on the page, or null when one is missing, locked or placed by auto layout. */
export function arrangeableBoxes(graph: SceneGraph, nodeIds: Iterable<string>): TidyItem[] | null {
  const boxes: TidyItem[] = []
  for (const id of nodeIds) {
    const node = graph.getNode(id)
    if (!node || node.locked || !canPositionNode(graph, node)) return null
    const box = getAbsolutePositionFull(node, graph)
    boxes.push({ id, x: box.boundX, y: box.boundY, width: box.width, height: box.height })
  }
  return boxes.length > 0 ? boxes : null
}

/** The selection as a smart selection, or null when it is not one. */
export function smartSelectionOf(graph: SceneGraph, nodeIds: Iterable<string>): SmartGrid | null {
  const boxes = arrangeableBoxes(graph, nodeIds)
  return boxes ? smartGrid(boxes) : null
}

/** Whether Tidy up would rearrange the layers: two or more that can move and are not arranged. */
export function canTidyUp(graph: SceneGraph, nodeIds: Iterable<string>): boolean {
  const boxes = arrangeableBoxes(graph, nodeIds)
  return !!boxes && boxes.length >= 2 && !isArranged(boxes)
}
