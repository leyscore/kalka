import { getGuideScreenSegment } from '@open-pencil/core/canvas'
import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'
import { guideOwnersOnPage } from '@open-pencil/scene-graph/guides'
import type { Color } from '@open-pencil/scene-graph/primitives'

import { measurementSegmentShapes } from '#vue/canvas/svg-overlay/layers/measurement'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

const GUIDE_COLOR = { r: 0.85, g: 0.29, b: 0.2, a: 0.78 }
const HOVERED_GUIDE_COLOR = { r: 0.96, g: 0.4, b: 0.26, a: 1 }
const SELECTED_GUIDE_COLOR = { r: 0.1, g: 0.45, b: 0.95, a: 1 }
const GUIDE_DASH = [3, 4] as const

type GuideVisualState = 'idle' | 'hovered' | 'selected'

/** What guides need beyond the overlay context: the page they belong to and the view's size. */
export interface GuideViewportSize {
  /** The page shown; the graph's root when absent, as in the Skia renderer. */
  pageId?: string | null
  /** Screen pixels. */
  width: number
  /** Screen pixels. */
  height: number
}

function guideColor(state: GuideVisualState): Color {
  if (state === 'selected') return SELECTED_GUIDE_COLOR
  if (state === 'hovered') return HOVERED_GUIDE_COLOR
  return GUIDE_COLOR
}

function guideState(selected: boolean, hovered: boolean): GuideVisualState {
  if (selected) return 'selected'
  if (hovered) return 'hovered'
  return 'idle'
}

function guideShapes(
  context: OverlayContext,
  size: GuideViewportSize,
  graph: SceneGraph,
  owner: SceneNode,
  axis: 'x' | 'y',
  position: number,
  preview: boolean,
  state: GuideVisualState
): OverlayShape[] {
  const stroke = css(guideColor(state))
  const segment = getGuideScreenSegment(
    graph,
    owner,
    { axis, position },
    { ...context.view, width: size.width, height: size.height }
  )
  // Page guides are a one-pixel-wide stroked box, as Skia draws them.
  if (owner.type === 'CANVAS') {
    return [
      axis === 'x'
        ? {
            type: 'rect',
            x: segment.x1,
            y: segment.y1,
            width: 1,
            height: segment.y2 - segment.y1,
            stroke,
            strokeWidth: 1
          }
        : {
            type: 'rect',
            x: segment.x1,
            y: segment.y1,
            width: segment.x2 - segment.x1,
            height: 1,
            stroke,
            strokeWidth: 1
          }
    ]
  }
  const shapes: OverlayShape[] = [{ type: 'line', ...segment, stroke, strokeWidth: 1 }]
  // A frame guide being dragged also extends across the whole view, dashed.
  if (preview) {
    shapes.push(
      axis === 'x'
        ? {
            type: 'line',
            x1: segment.x1,
            y1: 0,
            x2: segment.x1,
            y2: size.height,
            stroke,
            strokeWidth: 1,
            dash: GUIDE_DASH
          }
        : {
            type: 'line',
            x1: 0,
            y1: segment.y1,
            x2: size.width,
            y2: segment.y1,
            stroke,
            strokeWidth: 1,
            dash: GUIDE_DASH
          }
    )
  }
  return shapes
}

/**
 * Ruler guides on the page and its frames: idle, hovered or selected, and the one being dragged
 * drawn at its preview position instead of where it was.
 */
export function guidesLayer(context: OverlayContext, size: GuideViewportSize): OverlayShape[] {
  const { graph } = context
  const page = graph.getNode(size.pageId ?? graph.rootId)
  if (!page) return []
  const guides = context.overlays.guides
  const preview = guides?.preview
  const hovered = guides?.hovered
  const selected = guides?.selected

  const shapes: OverlayShape[] = []
  for (const owner of guideOwnersOnPage(graph, page.id)) {
    for (const guide of owner.guides) {
      if (preview?.source?.ownerId === owner.id && preview.source.guideId === guide.id) continue
      const state = guideState(
        selected?.ownerId === owner.id && selected.guideId === guide.id,
        hovered?.ownerId === owner.id && hovered.guideId === guide.id
      )
      shapes.push(
        ...guideShapes(context, size, graph, owner, guide.axis, guide.position, false, state)
      )
    }
  }

  if (preview) {
    const owner = graph.getNode(preview.ownerId)
    if (owner)
      shapes.push(
        ...guideShapes(
          context,
          size,
          graph,
          owner,
          preview.axis,
          preview.position,
          true,
          'selected'
        )
      )
  }
  return shapes
}

/** The distance from a guide being dragged to the layer it measures against. */
export function guideRedlineLayer(context: OverlayContext): OverlayShape[] {
  const redline = context.overlays.guides?.redline
  if (!redline) return []
  return measurementSegmentShapes(context.view, context.measureText, redline.segment)
}
