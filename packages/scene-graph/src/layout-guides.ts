import type { LayoutGrid, SceneNode } from './types'

export interface LayoutGuideLine {
  axis: 'x' | 'y'
  position: number
}

function pattern(grid: LayoutGrid): 'COLUMNS' | 'ROWS' | 'GRID' {
  if (grid.pattern === 'GRID' || grid.pattern === 'ROWS') return grid.pattern
  if (grid.axis === 'Y') return 'ROWS'
  return 'COLUMNS'
}

function alignment(grid: LayoutGrid): 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' {
  const value = grid.alignment ?? grid.type
  if (value === 'CENTER' || value === 'MAX' || value === 'STRETCH') return value
  return 'MIN'
}

function sectionSize(nodeSize: number, grid: LayoutGrid): number {
  const fixed = grid.sectionSize ?? 0
  if (alignment(grid) !== 'STRETCH') return fixed
  const count = grid.count ?? grid.numSections ?? 1
  const gutter = grid.gutterSize ?? 0
  const offset = grid.offset ?? 0
  return (nodeSize - offset * 2 - Math.max(0, count - 1) * gutter) / count
}

function start(nodeSize: number, grid: LayoutGrid, size: number): number {
  const count = grid.count ?? grid.numSections ?? 1
  const gutter = grid.gutterSize ?? 0
  const offset = grid.offset ?? 0
  const span = count * size + Math.max(0, count - 1) * gutter
  if (alignment(grid) === 'CENTER') return (nodeSize - span) / 2 + offset
  if (alignment(grid) === 'MAX') return nodeSize - span - offset
  return offset
}

export interface LayoutGuideSection {
  axis: 'x' | 'y'
  start: number
  end: number
}

export function layoutGuideSections(
  node: Pick<SceneNode, 'width' | 'height'>,
  grid: LayoutGrid
): LayoutGuideSection[] {
  if (grid.visible === false || pattern(grid) === 'GRID') return []
  const axis = pattern(grid) === 'ROWS' ? 'y' : 'x'
  const nodeSize = axis === 'x' ? node.width : node.height
  const size = sectionSize(nodeSize, grid)
  const count = grid.count ?? grid.numSections ?? 1
  if (!Number.isFinite(count) || count <= 0 || size <= 0) return []
  const first = start(nodeSize, grid, size)
  const step = size + (grid.gutterSize ?? 0)
  return Array.from({ length: count }, (_, index) => {
    const sectionStart = first + index * step
    return { axis, start: sectionStart, end: sectionStart + size }
  })
}

export function layoutGuideLines(node: Pick<SceneNode, 'width' | 'height'>, grid: LayoutGrid) {
  if (grid.visible === false) return []
  const gridPattern = pattern(grid)
  const lines: LayoutGuideLine[] = []
  if (gridPattern === 'GRID') {
    const size = grid.sectionSize ?? 0
    if (size <= 0) return lines
    for (let x = grid.offset ?? 0; x <= node.width; x += size) {
      lines.push({ axis: 'x', position: x })
    }
    for (let y = grid.offset ?? 0; y <= node.height; y += size) {
      lines.push({ axis: 'y', position: y })
    }
    return lines
  }

  const sections = layoutGuideSections(node, grid)
  for (const section of sections) {
    lines.push(
      { axis: section.axis, position: section.start },
      { axis: section.axis, position: section.end }
    )
  }
  return lines
}
