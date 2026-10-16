import {
  issueMarkerLabel,
  layoutIssueMarkers,
  type DesignIssueSeverity,
  type PlacedIssueMarker
} from '@kalka/core/canvas'
import {
  ISSUE_EDGE_ARROW,
  ISSUE_ERROR_COLOR,
  ISSUE_HIGHLIGHT_FILL_ALPHA,
  ISSUE_HIGHLIGHT_STROKE_WIDTH,
  ISSUE_INFO_COLOR,
  ISSUE_MARKER_RING_WIDTH,
  ISSUE_WARNING_COLOR,
  SIZE_FONT_SIZE
} from '@kalka/core/constants'
import { createSceneGeometry } from '@kalka/core/geometry'
import type { Color, Rect } from '@kalka/scene-graph/primitives'

import { nodeShape, type OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** Half the base of an edge pin's chevron. */
const EDGE_ARROW_HALF_WIDTH = 4
const MARKER_SHADOW_OFFSET_Y = 1
const MARKER_SHADOW_ALPHA = 0.3
/** SVG shapes cannot blur; the shadow is faked with a soft outer band of this width. */
const MARKER_SHADOW_SPREAD = 1.5
const MARKER_HOVER_HALO = 3
const MARKER_HOVER_HALO_ALPHA = 0.28
/** Baseline below the vertical center for 10px Inter digits and the exclamation mark. */
const MARKER_TEXT_BASELINE = 3.5
const MARKER_FONT_WEIGHT = 700
const TARGET_DASH = 3

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })

export function issueSeverityColor(severity: DesignIssueSeverity): Color {
  if (severity === 'error') return ISSUE_ERROR_COLOR
  if (severity === 'warning') return ISSUE_WARNING_COLOR
  return ISSUE_INFO_COLOR
}

/** Amber needs dark text; red and gray read best with white. */
function issueSeverityForeground(severity: DesignIssueSeverity): Color {
  return severity === 'warning' ? { r: 0, g: 0, b: 0, a: 0.85 } : { r: 1, g: 1, b: 1, a: 1 }
}

/** The layer an issue row or marker points at: a tint, its outline, and its minimum size. */
export function issueHighlightLayer(context: OverlayContext): OverlayShape[] {
  const { graph, overlays, view } = context
  const highlight = overlays.designIssues?.highlight
  const node = highlight ? graph.getNode(highlight.nodeId) : undefined
  if (!highlight || !node) return []
  const color = issueSeverityColor(highlight.severity)
  const stroke = css(color)
  const children: OverlayShape[] = [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: node.width,
      height: node.height,
      fill: css(color, ISSUE_HIGHLIGHT_FILL_ALPHA)
    },
    nodeShape(node, { stroke, strokeWidth: ISSUE_HIGHLIGHT_STROKE_WIDTH })
  ]
  const minSize = highlight.minSize
  if (minSize && (node.width < minSize.width || node.height < minSize.height)) {
    const width = Math.max(node.width, minSize.width)
    const height = Math.max(node.height, minSize.height)
    children.push({
      type: 'rect',
      x: (node.width - width) / 2,
      y: (node.height - height) / 2,
      width,
      height,
      stroke,
      strokeWidth: 1,
      dash: [TARGET_DASH, TARGET_DASH]
    })
  }
  const geometry = createSceneGeometry(graph, overlays.rotationPreview)
  return [{ type: 'group', matrix: geometry.screenMatrix(node, view), children }]
}

export interface IssueViewport {
  /** The page drawn, whose top-level layers end the walk up for a marker's target. */
  pageId: string
  /** The canvas element's size in CSS pixels. */
  width: number
  height: number
}

/**
 * Lays out this frame's markers in screen pixels, as the Skia pass does. Keep the result: draw
 * it with `issueLayer` and hit test pointer events against it with `hitTestIssueMarkers`, so the
 * pointer always targets what is drawn. Markers hide while drawing a path and over the layer
 * being edited.
 */
export function issueMarkersLayout(
  context: OverlayContext,
  viewport: IssueViewport,
  obstacles: readonly Rect[] = [],
  inset: { top: number; left: number } = { top: 0, left: 0 }
): PlacedIssueMarker[] {
  const { graph, overlays, view, measureText } = context
  const markers = overlays.designIssues?.markers
  if (!markers || markers.length === 0 || overlays.penState) return []
  const suppressedIds = new Set<string>()
  if (overlays.editingTextId) suppressedIds.add(overlays.editingTextId)
  if (overlays.nodeEditState) suppressedIds.add(overlays.nodeEditState.nodeId)
  return layoutIssueMarkers(graph, markers, {
    pageId: viewport.pageId,
    view: {
      panX: view.panX,
      panY: view.panY,
      zoom: view.zoom,
      width: viewport.width,
      height: viewport.height,
      insetTop: inset.top,
      insetLeft: inset.left
    },
    suppressedIds,
    preview: overlays.rotationPreview,
    // Sized by the regular face, as Skia measures before emboldening.
    measureText: (text) => measureText(text, SIZE_FONT_SIZE),
    obstacles
  })
}

function pill(rect: Rect, grow: number, paint: { fill: string }, dy = 0): OverlayShape {
  return {
    type: 'rect',
    x: rect.x - grow,
    y: rect.y - grow + dy,
    width: rect.width + grow * 2,
    height: rect.height + grow * 2,
    rx: rect.height / 2 + grow,
    ...paint
  }
}

/**
 * The chevron an edge pin points with: a triangle from the pill's border toward the issues,
 * outlined in white like the pill so it reads on any canvas.
 */
function edgeArrow(marker: PlacedIssueMarker, color: Color, ring: number): OverlayShape[] {
  const { rect, direction } = marker
  if (!direction) return []
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  const tx = direction.x === 0 ? Infinity : rect.width / 2 / Math.abs(direction.x)
  const ty = direction.y === 0 ? Infinity : rect.height / 2 / Math.abs(direction.y)
  const border = Math.min(tx, ty)
  const normal = { x: -direction.y, y: direction.x }
  const base = border - 1
  const triangle = (reach: number, half: number): number[] => [
    center.x + direction.x * (border + reach),
    center.y + direction.y * (border + reach),
    center.x + direction.x * base + normal.x * half,
    center.y + direction.y * base + normal.y * half,
    center.x + direction.x * base - normal.x * half,
    center.y + direction.y * base - normal.y * half
  ]
  return [
    {
      type: 'polygon',
      points: triangle(ISSUE_EDGE_ARROW + ring * 2, EDGE_ARROW_HALF_WIDTH + ring),
      fill: WHITE
    },
    { type: 'polygon', points: triangle(ISSUE_EDGE_ARROW, EDGE_ARROW_HALF_WIDTH), fill: css(color) }
  ]
}

function markerShapes(marker: PlacedIssueMarker, hovered: boolean): OverlayShape[] {
  const { rect } = marker
  const color = issueSeverityColor(marker.severity)
  const ring = ISSUE_MARKER_RING_WIDTH
  const shadowAlpha = MARKER_SHADOW_ALPHA / 2
  const shapes: OverlayShape[] = [
    pill(
      rect,
      ring + MARKER_SHADOW_SPREAD,
      { fill: css({ r: 0, g: 0, b: 0, a: shadowAlpha }) },
      MARKER_SHADOW_OFFSET_Y
    ),
    pill(rect, ring, { fill: css({ r: 0, g: 0, b: 0, a: shadowAlpha }) }, MARKER_SHADOW_OFFSET_Y)
  ]
  if (hovered)
    shapes.push(pill(rect, ring + MARKER_HOVER_HALO, { fill: css(color, MARKER_HOVER_HALO_ALPHA) }))
  shapes.push(
    ...edgeArrow(marker, color, ring),
    pill(rect, ring, { fill: WHITE }),
    pill(rect, 0, { fill: css(color) }),
    {
      type: 'text',
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2 + MARKER_TEXT_BASELINE,
      text: issueMarkerLabel(marker.count),
      fill: css(issueSeverityForeground(marker.severity)),
      fontSize: SIZE_FONT_SIZE,
      fontWeight: MARKER_FONT_WEIGHT,
      anchor: 'middle'
    }
  )
  return shapes
}

/** Draws placed markers so the first placed, most severe marker ends up on top. */
export function issueLayer(
  _context: OverlayContext,
  markers: readonly PlacedIssueMarker[],
  hoveredKey: string | null | undefined
): OverlayShape[] {
  const shapes: OverlayShape[] = []
  for (let index = markers.length - 1; index >= 0; index--) {
    shapes.push(...markerShapes(markers[index], markers[index].key === hoveredKey))
  }
  return shapes
}
