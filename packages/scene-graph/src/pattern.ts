import type { SceneGraph } from './index'
import type { Rect, Vector } from './primitives'
import type { Fill, SceneNode } from './types'

/**
 * Where a pattern fill draws its source layer: one tile, repeated across the filled layer from
 * its origin, and the places in that tile where the source is drawn at `scale`.
 */
export interface PatternTileLayout {
  rect: Rect
  scale: number
  positions: Vector[]
}

function patternAlignmentOffset(
  alignment: Fill['horizontalAlignment'],
  gap: number,
  sourceSize: number,
  axis: 'x' | 'y'
): number {
  if (alignment === 'CENTER') return axis === 'x' ? -gap / 2 : -sourceSize / 2
  if (alignment === 'END') return -gap
  return 0
}

/**
 * The tile a pattern fill repeats: the source scaled, plus its spacing as a fraction of that
 * size, and a second copy offset by half a tile for the hexagonal arrangements.
 */
export function patternTileLayout(source: Pick<SceneNode, 'width' | 'height'>, fill: Fill) {
  const scale = fill.scale && fill.scale > 0 ? fill.scale : 1
  const spacing = fill.patternSpacing ?? { x: 0, y: 0 }
  const scaledWidth = source.width * scale
  const scaledHeight = source.height * scale
  const gapX = scaledWidth * spacing.x
  const gapY = scaledHeight * spacing.y
  const width = scaledWidth + gapX
  const height = scaledHeight + gapY
  const x = patternAlignmentOffset(fill.horizontalAlignment, gapX, scaledWidth, 'x')
  const y = patternAlignmentOffset(fill.verticalAlignment, gapY, scaledHeight, 'y')
  const positions = [{ x, y }]

  if (fill.patternTileType === 'HORIZONTAL_HEXAGONAL') {
    positions.push({ x: x + width / 2, y: y + height / 2 })
  } else if (fill.patternTileType === 'VERTICAL_HEXAGONAL') {
    positions.push({ x: x + width / 2, y: y - height / 2 })
  }

  return { rect: { x: 0, y: 0, width, height }, scale, positions } satisfies PatternTileLayout
}

/**
 * Every place the source is drawn inside one tile: its positions, and each of them moved by a
 * whole tile where that copy reaches into the tile. A copy past the tile's edge then shows on
 * the opposite side, as in the neighboring tile, instead of being cut off where tiles meet.
 */
export function patternTileCopies(
  source: Pick<SceneNode, 'width' | 'height'>,
  layout: PatternTileLayout
): Vector[] {
  const { width, height } = layout.rect
  const drawnWidth = source.width * layout.scale
  const drawnHeight = source.height * layout.scale
  const copies: Vector[] = []
  for (const position of layout.positions) {
    for (const dy of [-height, 0, height]) {
      for (const dx of [-width, 0, width]) {
        const x = position.x + dx
        const y = position.y + dy
        const overlaps = x < width && x + drawnWidth > 0 && y < height && y + drawnHeight > 0
        if (overlaps) copies.push({ x, y })
      }
    }
  }
  return copies
}

/**
 * The layer a pattern fill repeats, by its id or, in a document imported from a file, by the
 * id it had there. Null for a fill without a drawable source, or one that repeats its own layer.
 */
export function patternSource(graph: SceneGraph, node: SceneNode, fill: Fill): SceneNode | null {
  const sourceId = fill.sourceNodeId
  if (fill.type !== 'PATTERN' || !sourceId) return null
  if (sourceId === node.id || sourceId === node.source.id) return null
  let source = graph.getNode(sourceId)
  if (!source) {
    for (const candidate of graph.getAllNodes()) {
      if (candidate.source.id === sourceId) {
        source = candidate
        break
      }
    }
  }
  if (!source || source.width <= 0 || source.height <= 0) return null
  return source
}
