import { mergedStyle, pickStyle } from '@kalka/scene-graph/css-model'

import type { DesignElement, DesignNode } from '../types'

/**
 * A table imported as a grid: the layer model has no table layout, and cells placed where the
 * browser measured them would stay that wide while their text grows over the next column. As
 * grid cells in tracks sized by their content, a longer cell widens its whole column, as in the
 * browser.
 */
export interface TableGrid {
  columns: number
  rows: number
  /** Gap between cells: the table's `border-spacing`, nothing once borders collapse. */
  gap: { column: number; row: number }
  cells: TableCell[]
}

export interface TableCell {
  /** The cell, laid out as a row that hugs its content and aligned as the cell aligned it. */
  element: DesignElement
  /** One-based, as CSS grid lines are. */
  column: number
  row: number
  columnSpan: number
  rowSpan: number
}

const ROW_GROUPS = new Set(['thead', 'tbody', 'tfoot'])

function elementChildren(element: DesignElement): DesignElement[] {
  return element.children.filter((child): child is DesignElement => child.type === 'element')
}

function rowsOf(table: DesignElement): DesignElement[] {
  return elementChildren(table).flatMap((child) => {
    if (child.tagName === 'tr') return [child]
    return ROW_GROUPS.has(child.tagName)
      ? elementChildren(child).filter((row) => row.tagName === 'tr')
      : []
  })
}

function span(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1
}

const JUSTIFY: Record<string, string> = {
  center: 'center',
  right: 'flex-end',
  end: 'flex-end',
  '-webkit-right': 'flex-end',
  '-webkit-center': 'center'
}

const ALIGN: Record<string, string> = { top: 'flex-start', bottom: 'flex-end' }

/** A cell as a row that hugs its content: its text aligned as `text-align` and `vertical-align` had it. */
function cellAsRow(cell: DesignElement): DesignElement {
  const style = mergedStyle(cell)
  return {
    ...cell,
    computedStyle: {
      ...cell.computedStyle,
      display: 'flex',
      'flex-direction': 'row',
      'justify-content': JUSTIFY[pickStyle(style, 'text-align') ?? ''] ?? 'flex-start',
      'align-items': ALIGN[pickStyle(style, 'vertical-align') ?? ''] ?? 'center'
    }
  }
}

function borderSpacing(table: DesignElement): { column: number; row: number } {
  const style = mergedStyle(table)
  if (pickStyle(style, 'border-collapse') === 'collapse') return { column: 0, row: 0 }
  const [column = 0, row = column] = (pickStyle(style, 'border-spacing') ?? '')
    .split(/\s+/)
    .map((part) => Number.parseFloat(part))
    .filter((value) => Number.isFinite(value))
  return { column, row }
}

/**
 * The grid a measured `<table>` becomes, or null for anything else, or a table whose rows hold
 * something other than cells, which keeps its measured boxes.
 */
export function tableGrid(element: DesignNode): TableGrid | null {
  if (element.type !== 'element' || element.tagName !== 'table' || !element.layoutBox) return null
  const rows = rowsOf(element)
  if (rows.length === 0) return null
  const cells: TableCell[] = []
  // Cells spanning rows take columns of the rows below them, as the table algorithm does.
  const taken = new Set<string>()
  let columns = 0
  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 1
    let column = 1
    for (const cell of elementChildren(row)) {
      if (cell.tagName !== 'td' && cell.tagName !== 'th') return null
      while (taken.has(`${rowNumber}:${column}`)) column++
      const columnSpan = span(cell.attrs.colspan)
      const rowSpan = Math.min(span(cell.attrs.rowspan), rows.length - index)
      for (let r = 0; r < rowSpan; r++)
        for (let c = 0; c < columnSpan; c++) taken.add(`${rowNumber + r}:${column + c}`)
      cells.push({ element: cellAsRow(cell), column, row: rowNumber, columnSpan, rowSpan })
      column += columnSpan
      columns = Math.max(columns, column - 1)
    }
  }
  if (cells.length === 0) return null
  return { columns, rows: rows.length, gap: borderSpacing(element), cells }
}
