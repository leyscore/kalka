import { readEffectiveFigmaRawField } from '#fig/source-metadata'

import type { NodeChange as KiwiNodeChange } from '@kalka/kiwi/fig/codec'
import type { GridChildAlign, GridTrack, SceneNode } from '@kalka/scene-graph'
import { fractionalPosition } from '@kalka/scene-graph/order-keys'
import type { GUID } from '@kalka/scene-graph/primitives'

import { gridTrackIds } from '../grid'
import type { SceneNodeToKiwiContext } from './context'
import { getOrCreatePropertyGuid } from './context'

type Axis = 'columns' | 'rows'

/** Figma's sizing of one track: a flexible share, a fixed size, or the size of its content. */
function trackSizing(track: GridTrack): { type: string; value: number } {
  if (track.sizing === 'FIXED') return { type: 'FIXED', value: track.value }
  if (track.sizing === 'AUTO') return { type: 'HUG', value: 0 }
  return { type: 'FLEX', value: track.value > 0 ? track.value : 1 }
}

function trackSize(track: GridTrack) {
  const sizing = trackSizing(track)
  return { minSizing: sizing, maxSizing: sizing }
}

/**
 * The ids a grid's tracks are written with: an imported grid keeps the ids its file gave its
 * tracks while their number holds, so unedited children's anchors still name them; others get
 * ids minted once per grid and axis, which the grid and its children share.
 */
function trackGuids(
  context: SceneNodeToKiwiContext,
  grid: SceneNode,
  axis: Axis,
  localIdCounter: { value: number }
): GUID[] {
  const tracks = axis === 'columns' ? grid.gridTemplateColumns : grid.gridTemplateRows
  const raw = gridTrackIds(
    readEffectiveFigmaRawField(grid, axis === 'columns' ? 'gridColumns' : 'gridRows')
  )
  return tracks.map((_, index) => {
    const imported = raw.length === tracks.length ? raw[index] : undefined
    return getOrCreatePropertyGuid(
      context,
      imported ?? `grid-track:${grid.id}:${axis}:${index}`,
      localIdCounter
    )
  })
}

function trackFields(
  context: SceneNodeToKiwiContext,
  grid: SceneNode,
  axis: Axis,
  localIdCounter: { value: number }
) {
  const tracks = axis === 'columns' ? grid.gridTemplateColumns : grid.gridTemplateRows
  const ids = trackGuids(context, grid, axis, localIdCounter)
  return {
    positions: {
      entries: ids.map((id, index) => ({ id, position: fractionalPosition(index) }))
    },
    sizes: {
      entries: ids.map((id, index) => ({ id, trackSize: trackSize(tracks[index]) }))
    }
  }
}

function kiwiGridChildAlign(align: GridChildAlign | SceneNode['layoutAlignSelf']): string {
  return align === 'MIN' || align === 'CENTER' || align === 'MAX' ? align : 'AUTO'
}

/**
 * Writes a grid frame's tracks and gaps, and a grid child's cell, span and alignment, the way
 * Figma's grid auto layout saves them (`gridColumns`, `gridColumnsSizing`, `gridColumnAnchor`).
 * Fields written here take precedence over the imported record's raw ones.
 */
export function serializeGridLayout(
  context: SceneNodeToKiwiContext,
  node: SceneNode,
  nc: KiwiNodeChange,
  localIdCounter: { value: number }
): void {
  if (node.layoutMode === 'GRID') {
    nc.stackMode = 'GRID'
    const columns = trackFields(context, node, 'columns', localIdCounter)
    const rows = trackFields(context, node, 'rows', localIdCounter)
    nc.gridColumns = columns.positions
    nc.gridColumnsSizing = columns.sizes
    nc.gridRows = rows.positions
    nc.gridRowsSizing = rows.sizes
    nc.gridColumnGap = node.gridColumnGap
    nc.gridRowGap = node.gridRowGap
  }

  const parent = node.parentId ? context.graph.getNode(node.parentId) : undefined
  if (parent?.layoutMode !== 'GRID' || node.layoutPositioning === 'ABSOLUTE') return
  nc.gridChildHorizontalAlign = kiwiGridChildAlign(node.gridChildHorizontalAlign)
  nc.gridChildVerticalAlign = kiwiGridChildAlign(node.layoutAlignSelf)
  const place = node.gridPosition
  if (!place) return
  const columns = trackGuids(context, parent, 'columns', localIdCounter)
  const rows = trackGuids(context, parent, 'rows', localIdCounter)
  const column = columns[place.column - 1] as GUID | undefined
  const row = rows[place.row - 1] as GUID | undefined
  if (column) nc.gridColumnAnchor = column
  if (row) nc.gridRowAnchor = row
  nc.gridColumnSpan = Math.max(1, place.columnSpan)
  nc.gridRowSpan = Math.max(1, place.rowSpan)
}
