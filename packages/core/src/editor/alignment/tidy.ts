import type { Rect, Vector } from '@kalka/scene-graph/primitives'

/** A layer to tidy: its id and its box on the page. */
export interface TidyItem extends Rect {
  id: string
}

const centerX = (item: Rect) => item.x + item.width / 2
const centerY = (item: Rect) => item.y + item.height / 2

/**
 * The rows the layers stand in, top to bottom, each left to right. A layer joins the row above
 * when its centre lies within that row's height, as rows of slightly uneven cards do.
 */
export function tidyRows(items: readonly TidyItem[]): TidyItem[][] {
  const rows: TidyItem[][] = []
  let bottom = Number.NEGATIVE_INFINITY
  for (const item of [...items].sort((a, b) => centerY(a) - centerY(b) || a.x - b.x)) {
    const row = rows.at(-1)
    if (row && centerY(item) <= bottom) {
      row.push(item)
      bottom = Math.max(bottom, item.y + item.height)
    } else {
      rows.push([item])
      bottom = item.y + item.height
    }
  }
  return rows.map((row) => row.sort((a, b) => centerX(a) - centerX(b)))
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0
  return Math.max(0, Math.round(values.reduce((sum, value) => sum + value, 0) / values.length))
}

/**
 * Figma's Tidy up: the layers in a grid of the rows and columns they roughly stand in, with one
 * horizontal and one vertical spacing, each the average gap they had, from the top left corner
 * of what they cover. Each layer takes its cell's top left corner; a column is as wide as its
 * widest layer and a row as tall as its tallest. Returns each layer's new top left corner.
 */
export function tidyPositions(items: readonly TidyItem[]): Map<string, Vector> {
  const rows = tidyRows(items)
  const columns = Math.max(0, ...rows.map((row) => row.length))
  const columnWidths = Array.from({ length: columns }, (_, index) =>
    Math.max(0, ...rows.map((row) => row[index]?.width ?? 0))
  )
  const rowHeights = rows.map((row) => Math.max(...row.map((item) => item.height)))
  const columnGap = average(
    rows.flatMap((row) =>
      row.slice(1).map((item, index) => item.x - (row[index].x + row[index].width))
    )
  )
  const rowGap = average(
    rows.slice(1).map((row, index) => {
      const above = rows[index]
      const top = Math.min(...row.map((item) => item.y))
      return top - Math.max(...above.map((item) => item.y + item.height))
    })
  )

  const left = Math.min(...items.map((item) => item.x))
  let top = Math.min(...items.map((item) => item.y))
  const positions = new Map<string, Vector>()
  rows.forEach((row, rowIndex) => {
    let x = left
    row.forEach((item, column) => {
      positions.set(item.id, { x, y: top })
      x += columnWidths[column] + columnGap
    })
    top += rowHeights[rowIndex] + rowGap
  })
  return positions
}
