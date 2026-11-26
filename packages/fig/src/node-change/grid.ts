import * as v from 'valibot'

import { guidToString } from '@kalka/kiwi/fig/guid'
import type { GridChildAlign, GridTrack, SceneGraph, SceneNode } from '@kalka/scene-graph'

const Guid = v.object({ sessionID: v.number(), localID: v.number() })

/** Figma's tracks, each an id at a fractional position: their order is the positions'. */
const TrackPositions = v.object({
  entries: v.array(v.object({ id: Guid, position: v.string() }))
})

const Sizing = v.object({
  type: v.optional(v.picklist(['FLEX', 'FIXED', 'HUG'])),
  value: v.optional(v.number())
})

/** Each track's size, as its smallest and largest sizing. */
const TrackSizes = v.object({
  entries: v.array(
    v.object({
      id: Guid,
      trackSize: v.object({ minSizing: v.optional(Sizing), maxSizing: v.optional(Sizing) })
    })
  )
})

/** Fractional positions order by code unit, not by locale. */
function byPosition(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

/** Figma's track ids in their order. */
export function gridTrackIds(positions: unknown): string[] {
  const parsed = v.safeParse(TrackPositions, positions)
  if (!parsed.success) return []
  return parsed.output.entries
    .toSorted((a, b) => byPosition(a.position, b.position))
    .map((entry) => guidToString(entry.id))
}

/** A track as CSS sizes it: flexible tracks share the space, hugging ones take their content. */
function track(sizing: v.InferOutput<typeof Sizing> | undefined): GridTrack {
  if (sizing?.type === 'FIXED') return { sizing: 'FIXED', value: sizing.value ?? 0 }
  if (sizing?.type === 'HUG') return { sizing: 'AUTO', value: 0 }
  return { sizing: 'FR', value: sizing?.value && sizing.value > 0 ? sizing.value : 1 }
}

/** Figma's tracks along one axis as Kalka's, in order. */
export function gridTracks(positions: unknown, sizes: unknown): GridTrack[] {
  const parsed = v.safeParse(TrackSizes, sizes)
  const byId = new Map(
    parsed.success
      ? parsed.output.entries.map((entry) => [guidToString(entry.id), entry.trackSize])
      : []
  )
  return gridTrackIds(positions).map((id) => {
    const size = byId.get(id)
    return track(size?.maxSizing ?? size?.minSizing)
  })
}

function number(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** A grid frame's tracks and gaps, from its node change; nothing for another frame. */
export function convertGridContainer(
  nc: Record<string, unknown>,
  layoutMode: SceneNode['layoutMode']
): Partial<
  Pick<SceneNode, 'gridTemplateColumns' | 'gridTemplateRows' | 'gridColumnGap' | 'gridRowGap'>
> {
  if (layoutMode !== 'GRID') return {}
  return {
    gridTemplateColumns: gridTracks(nc.gridColumns, nc.gridColumnsSizing),
    gridTemplateRows: gridTracks(nc.gridRows, nc.gridRowsSizing),
    gridColumnGap: Math.max(0, number(nc.gridColumnGap) ?? 0),
    gridRowGap: Math.max(0, number(nc.gridRowGap) ?? 0)
  }
}

/** A grid child's place across its cell, from Figma's `gridChildHorizontalAlign`. */
export function mapGridChildAlign(value: unknown): GridChildAlign {
  return value === 'MIN' || value === 'CENTER' || value === 'MAX' ? value : 'AUTO'
}

function anchorIndex(anchor: unknown, ids: readonly string[]): number {
  const parsed = v.safeParse(Guid, anchor)
  return parsed.success ? ids.indexOf(guidToString(parsed.output)) : -1
}

function span(value: unknown): number {
  const count = number(value)
  return count !== undefined && count >= 1 ? Math.round(count) : 1
}

/**
 * Places the children of the grid frames among `nodes` in the cells Figma anchored them to,
 * which name the tracks by id: it runs once every layer exists, as a child's anchor is read
 * against its parent's tracks. Children without anchors keep CSS's automatic placement.
 */
export function applyGridAnchors(graph: SceneGraph, nodes: Iterable<SceneNode>): void {
  for (const grid of nodes) {
    if (grid.layoutMode !== 'GRID') continue
    const raw = grid.source.fig.rawNodeFields
    const columns = gridTrackIds(raw.gridColumns)
    const rows = gridTrackIds(raw.gridRows)
    for (const childId of grid.childIds) {
      const child = graph.getNode(childId)
      if (!child) continue
      const fields = child.source.fig.rawNodeFields
      const column = anchorIndex(fields.gridColumnAnchor, columns)
      const row = anchorIndex(fields.gridRowAnchor, rows)
      if (column < 0 && row < 0) continue
      graph.updateNode(child.id, {
        gridPosition: {
          column: column + 1,
          row: row + 1,
          columnSpan: span(fields.gridColumnSpan),
          rowSpan: span(fields.gridRowSpan)
        }
      })
    }
  }
}
