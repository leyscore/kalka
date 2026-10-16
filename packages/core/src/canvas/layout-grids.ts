import type { Canvas } from 'canvaskit-wasm'

import { readEffectiveFigmaRawField } from '@kalka/fig'
import type { SceneNode } from '@kalka/scene-graph'
import { layoutGuideSections } from '@kalka/scene-graph/layout-guides'
import type { Color } from '@kalka/scene-graph/primitives'

import { SELECTION_COLOR } from '#core/constants'

import type { SkiaRenderer } from './renderer'

type RawLayoutGrid = SceneNode['layoutGrids'][number] & {
  visible?: boolean
  color?: Color
  pattern?: string
  axis?: string
  type?: string
  alignment?: string
  numSections?: number
  count?: number
  offset?: number
  sectionSize?: number
  gutterSize?: number
}

interface GridGeometry {
  pattern: 'COLUMNS' | 'ROWS' | 'GRID'
  alignment: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH'
  count: number
  offset: number
  sectionSize: number
  gutterSize: number
  color: Color
}

function rawLayoutGrids(node: SceneNode): RawLayoutGrid[] {
  const modeledGrids = (node as Partial<SceneNode>).layoutGrids ?? []
  if (modeledGrids.length > 0) return modeledGrids
  const source = (node as Partial<SceneNode>).source
  const grids = source ? readEffectiveFigmaRawField(node, 'layoutGrids') : undefined
  if (!Array.isArray(grids)) return []
  return grids.filter((grid): grid is RawLayoutGrid => grid !== null && typeof grid === 'object')
}

function rawGridPattern(grid: RawLayoutGrid): GridGeometry['pattern'] {
  if (grid.pattern === 'GRID') return 'GRID'
  if (grid.pattern === 'ROWS') return 'ROWS'
  if (grid.pattern === 'COLUMNS') return 'COLUMNS'
  if (grid.axis === 'Y') return 'ROWS'
  return 'COLUMNS'
}

function rawGridAlignment(grid: RawLayoutGrid): GridGeometry['alignment'] {
  const value = grid.alignment ?? grid.type
  if (value === 'CENTER' || value === 'MAX' || value === 'STRETCH') return value
  return 'MIN'
}

function gridGeometry(grid: RawLayoutGrid): GridGeometry | null {
  if (grid.visible === false) return null
  const count = grid.count ?? grid.numSections ?? 1
  const sectionSize = grid.sectionSize ?? 0
  const alignment = rawGridAlignment(grid)
  if (!Number.isFinite(count) || count <= 0) return null
  if (rawGridPattern(grid) === 'GRID' && sectionSize <= 0) return null
  if (alignment !== 'STRETCH' && sectionSize <= 0) return null
  return {
    pattern: rawGridPattern(grid),
    alignment,
    count,
    offset: grid.offset ?? 0,
    sectionSize,
    gutterSize: grid.gutterSize ?? 0,
    color: grid.color ?? { ...SELECTION_COLOR, a: 0.1 }
  }
}

/** A layout grid's color and the rectangles it covers, in the frame's own coordinates. */
export interface LayoutGridPaint {
  color: Color
  rects: [x: number, y: number, width: number, height: number][]
}

/** Whether a layer has layout grids to show. */
export function hasLayoutGrids(node: SceneNode): boolean {
  return rawLayoutGrids(node).some((grid) => gridGeometry(grid) !== null)
}

/** What a frame's visible layout grids cover: column and row bands, or a square grid's lines. */
export function layoutGridPaints(node: SceneNode): LayoutGridPaint[] {
  const paints: LayoutGridPaint[] = []
  for (const rawGrid of rawLayoutGrids(node)) {
    const grid = gridGeometry(rawGrid)
    if (!grid) continue
    const rects: LayoutGridPaint['rects'] = []
    if (grid.pattern === 'GRID') {
      for (let x = grid.offset; x < node.width; x += grid.sectionSize)
        rects.push([x, 0, 1, node.height])
      for (let y = grid.offset; y < node.height; y += grid.sectionSize)
        rects.push([0, y, node.width, 1])
    } else {
      for (const section of layoutGuideSections(node, grid)) {
        const size = section.end - section.start
        rects.push(
          grid.pattern === 'ROWS'
            ? [0, section.start, node.width, size]
            : [section.start, 0, size, node.height]
        )
      }
    }
    paints.push({ color: grid.color, rects })
  }
  return paints
}

export function drawLayoutGrids(r: SkiaRenderer, canvas: Canvas, node: SceneNode): void {
  for (const { color, rects } of layoutGridPaints(node)) {
    r.auxFill.setColor(r.ck.Color4f(color.r, color.g, color.b, color.a))
    for (const [x, y, width, height] of rects)
      canvas.drawRect(r.ck.LTRBRect(x, y, x + width, y + height), r.auxFill)
  }
}
