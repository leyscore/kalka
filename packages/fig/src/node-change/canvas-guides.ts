import type { CanvasGuide } from '@open-pencil/scene-graph/guides'
import type { GUID } from '@open-pencil/scene-graph/primitives'

interface FigmaCanvasGuide {
  axis?: string
  offset?: number
  guid?: GUID
}

function guideId(guid: GUID | undefined, index: number): string {
  return guid ? `fig-guide:${guid.sessionID}:${guid.localID}` : `guide:${index}`
}

export function importCanvasGuides(value: unknown): CanvasGuide[] {
  if (!Array.isArray(value)) return []
  const guides: CanvasGuide[] = []
  for (const [index, raw] of value.entries()) {
    if (!raw || typeof raw !== 'object') continue
    const guide = raw as FigmaCanvasGuide
    if (typeof guide.offset !== 'number' || !Number.isFinite(guide.offset)) continue
    if (guide.axis === 'X') {
      guides.push({
        id: guideId(guide.guid, index),
        axis: 'x',
        position: guide.offset,
        figGuid: guide.guid
      })
    } else if (guide.axis === 'Y') {
      guides.push({
        id: guideId(guide.guid, index),
        axis: 'y',
        position: guide.offset,
        figGuid: guide.guid
      })
    }
  }
  return guides
}

export function exportCanvasGuides(guides: readonly CanvasGuide[]): FigmaCanvasGuide[] {
  return guides.map((guide) => ({
    axis: guide.axis === 'x' ? 'X' : 'Y',
    offset: guide.position,
    ...(guide.figGuid ? { guid: guide.figGuid } : {})
  }))
}
