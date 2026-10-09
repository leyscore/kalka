import { computeMeasurementSegments, type MeasurementSegment } from '@open-pencil/core/canvas'
import {
  MEASUREMENT_COLOR,
  MEASUREMENT_PILL_HEIGHT,
  MEASUREMENT_PILL_PADDING_X,
  MEASUREMENT_PILL_RADIUS,
  MEASUREMENT_TEXT_BASELINE,
  SIZE_FONT_SIZE
} from '@open-pencil/core/constants'
import { viewportMatrix, type ViewportTransform } from '@open-pencil/core/geometry'
import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'
import { getAxisAlignedWorldBounds, getWorldMatrix } from '@open-pencil/scene-graph/coordinate'
import { computeBounds } from '@open-pencil/scene-graph/geometry'
import Matrix from '@open-pencil/scene-graph/matrix'
import type { Rect } from '@open-pencil/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type MeasureText, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

const STROKE = css(MEASUREMENT_COLOR, 1)
const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })

/** The distance label: an orange pill centred on (x, y) holding the rounded value in white. */
function pill(measureText: MeasureText, text: string, x: number, y: number): OverlayShape[] {
  const width = measureText(text, SIZE_FONT_SIZE) + MEASUREMENT_PILL_PADDING_X * 2
  const left = x - width / 2
  return [
    {
      type: 'rect',
      x: left,
      y: y - MEASUREMENT_PILL_HEIGHT / 2,
      width,
      height: MEASUREMENT_PILL_HEIGHT,
      rx: MEASUREMENT_PILL_RADIUS,
      fill: STROKE
    },
    {
      type: 'text',
      x: left + MEASUREMENT_PILL_PADDING_X,
      y: y + MEASUREMENT_TEXT_BASELINE,
      text,
      fill: WHITE,
      fontSize: SIZE_FONT_SIZE
    }
  ]
}

/**
 * A measured gap in world coordinates: an orange line with its distance in a pill at its middle.
 * Measurement mode and the guide redline both draw it.
 */
export function measurementSegmentShapes(
  view: ViewportTransform,
  measureText: MeasureText,
  segment: MeasurementSegment
): OverlayShape[] {
  const { panX, panY, zoom } = view
  const text = String(Math.round(segment.value))
  if (segment.axis === 'x') {
    const x1 = segment.from * zoom + panX
    const x2 = segment.to * zoom + panX
    const y = segment.cross * zoom + panY
    return [
      { type: 'line', x1, y1: y, x2, y2: y, stroke: STROKE, strokeWidth: 1 },
      ...pill(measureText, text, (x1 + x2) / 2, y)
    ]
  }
  const x = segment.cross * zoom + panX
  const y1 = segment.from * zoom + panY
  const y2 = segment.to * zoom + panY
  return [
    { type: 'line', x1: x, y1, x2: x, y2, stroke: STROKE, strokeWidth: 1 },
    ...pill(measureText, text, x, (y1 + y2) / 2)
  ]
}

function selectedBounds(graph: SceneGraph, selectedIds: ReadonlySet<string>): Rect | null {
  const nodes: SceneNode[] = []
  for (const id of selectedIds) {
    const node = graph.getNode(id)
    if (node) nodes.push(node)
  }
  if (nodes.length === 0) return null
  return computeBounds(nodes.map((node) => getAxisAlignedWorldBounds(node, graph)))
}

/** The hovered layer's outline, as a quad on screen. */
function targetOutline(context: OverlayContext, target: SceneNode): OverlayShape {
  const matrix = Matrix.multiply(
    viewportMatrix(context.view),
    getWorldMatrix(target, context.graph)
  )
  const { width: w, height: h } = target
  return {
    type: 'polygon',
    points: Matrix.mapPoints(matrix, [0, 0, w, 0, w, h, 0, h]),
    stroke: STROKE,
    strokeWidth: 1
  }
}

/**
 * Measurement mode (Alt held): the distances from the selection to the hovered layer, with the
 * hovered layer outlined. Draw it only while measuring, as the Skia pass does; the hovered id is
 * the raw `overlays.hoveredNodeId`, which measuring hides from the hover layer.
 */
export function measurementsLayer(context: OverlayContext): OverlayShape[] {
  const { graph, selectedIds } = context
  const targetId = context.overlays.hoveredNodeId
  if (!targetId || selectedIds.size === 0 || selectedIds.has(targetId)) return []
  const target = graph.getNode(targetId)
  const from = selectedBounds(graph, selectedIds)
  if (!target || !from) return []
  const segments = computeMeasurementSegments(from, getAxisAlignedWorldBounds(target, graph))
  return [
    targetOutline(context, target),
    ...segments.flatMap((segment) =>
      measurementSegmentShapes(context.view, context.measureText, segment)
    )
  ]
}
