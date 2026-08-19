import type { CanvasGuide } from '@open-pencil/scene-graph/guides'

interface FigmaCanvasGuide {
  axis?: string
  offset?: number
}

export function importCanvasGuides(value: unknown): CanvasGuide[] {
  if (!Array.isArray(value)) return []
  const guides: CanvasGuide[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const guide = raw as FigmaCanvasGuide
    if (typeof guide.offset !== 'number' || !Number.isFinite(guide.offset)) continue
    if (guide.axis === 'X') guides.push({ axis: 'x', position: guide.offset })
    else if (guide.axis === 'Y') guides.push({ axis: 'y', position: guide.offset })
  }
  return guides
}

export function exportCanvasGuides(guides: readonly CanvasGuide[]): FigmaCanvasGuide[] {
  return guides.map((guide) => ({
    axis: guide.axis === 'x' ? 'X' : 'Y',
    offset: guide.position
  }))
}
