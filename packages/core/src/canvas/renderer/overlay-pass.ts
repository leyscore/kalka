import type { Canvas } from 'canvaskit-wasm'

import type { SceneGraph } from '@kalka/scene-graph'

import { drawGuides } from '#core/canvas/guides/draw'
import { drawIssueHighlight, drawIssueMarkers } from '#core/canvas/issues/draw'
import { layoutIssueMarkers } from '#core/canvas/issues/layout'
import { drawComponentSetBorders } from '#core/canvas/overlays/component-sets'
import { drawDropTarget, drawEditingText } from '#core/canvas/overlays/feedback'
import { drawLayoutOutlines } from '#core/canvas/overlays/layout-outlines'
import { drawMeasurementSegment } from '#core/canvas/overlays/measurement'
import { drawPixelGrid } from '#core/canvas/overlays/pixel-grid'
import { drawCodeFocus } from '#core/canvas/overlays/selection'
import { drawSlotOutlines } from '#core/canvas/overlays/slots'
import type { RenderOverlays, SkiaRenderer } from '#core/canvas/renderer'
import type { OverlayLayerId } from '#core/canvas/renderer/types'
import { FLASH_ATTACK_MS, FLASH_HOLD_MS, FLASH_RELEASE_MS, RULER_SIZE } from '#core/constants'

function measurementVisible(overlays: RenderOverlays): boolean {
  return (
    overlays.measurementMode !== undefined &&
    overlays.measurementMode !== 'off' &&
    !overlays.editingTextId &&
    !overlays.nodeEditState &&
    !overlays.penState
  )
}

export function drawLabelPass(
  r: SkiaRenderer,
  canvas: Canvas,
  graph: SceneGraph,
  selectedIds: ReadonlySet<string>,
  overlays?: RenderOverlays
): void {
  const profiler = r.profiler
  const own = ownership(r)
  profiler.beginPhase('render:frameTitles')
  if (own('frameTitles')) r.drawFrameTitles(canvas, graph, selectedIds, overlays)
  profiler.endPhase('render:frameTitles')
  profiler.beginPhase('render:sectionTitles')
  if (own('sectionTitles')) r.drawSectionTitles(canvas, graph, overlays)
  profiler.endPhase('render:sectionTitles')
  profiler.beginPhase('render:componentLabels')
  if (own('componentLabels')) r.drawComponentLabels(canvas, graph, overlays)
  profiler.endPhase('render:componentLabels')
}

function suppressedIssueIds(overlays: RenderOverlays): Set<string> {
  const ids = new Set<string>()
  if (overlays.editingTextId) ids.add(overlays.editingTextId)
  if (overlays.nodeEditState) ids.add(overlays.nodeEditState.nodeId)
  return ids
}

/**
 * Lays out markers for this frame and keeps them for hit testing, so the pointer always targets
 * what is drawn. Markers stay attached to their layers through edits and hide while drawing a path.
 */
function updateIssueMarkers(r: SkiaRenderer, graph: SceneGraph, overlays: RenderOverlays): void {
  const markers = overlays.designIssues?.markers
  if (!markers || markers.length === 0 || overlays.penState) {
    r.issueMarkers = []
    return
  }
  const measureText = (text: string) => {
    const font = r.sizeFont
    if (!font) return 0
    let width = 0
    for (const glyph of font.getGlyphWidths(font.getGlyphIDs(text))) width += glyph
    return width
  }
  const inset = r.showRulers ? RULER_SIZE : 0
  r.issueMarkers = layoutIssueMarkers(graph, markers, {
    pageId: r.pageId ?? '',
    view: {
      panX: r.panX,
      panY: r.panY,
      zoom: r.zoom,
      width: r.viewportWidth,
      height: r.viewportHeight,
      insetTop: inset,
      insetLeft: inset
    },
    suppressedIds: suppressedIssueIds(overlays),
    preview: overlays.rotationPreview,
    measureText,
    obstacles: r.overlayObstacles
  })
}

type Own = (layer: OverlayLayerId) => boolean

/** Whether this canvas draws `layer`, or another backend such as the SVG overlay does. */
function ownership(r: SkiaRenderer): Own {
  return (layer) => !r.delegatedOverlays.has(layer)
}

/** Outlines under every editing overlay: the pixel grid, sets, code focus, slots and layouts. */
function drawStructureOutlines(
  r: SkiaRenderer,
  canvas: Canvas,
  graph: SceneGraph,
  selectedIds: Set<string>,
  overlays: RenderOverlays,
  hoveredNodeId: string | null | undefined,
  measuring: boolean
): void {
  const own = ownership(r)
  // Over the design and under every editing outline, as in Figma.
  if (own('pixelGrid') && overlays.showPixelGrid) drawPixelGrid(r, canvas)
  if (own('componentSetBorders'))
    drawComponentSetBorders(r, canvas, graph, overlays.rotationPreview)
  if (own('codeFocus'))
    drawCodeFocus(r, canvas, graph, overlays.codeFocusNodeId, overlays.rotationPreview)
  if (measuring) return
  if (own('slotOutlines'))
    drawSlotOutlines(r, canvas, graph, selectedIds, hoveredNodeId, overlays.rotationPreview)
  if (own('layoutOutlines'))
    drawLayoutOutlines(r, canvas, graph, selectedIds, hoveredNodeId, overlays)
}

/** Finished flashes leave the list here when another backend draws them. */
function pruneFlashes(r: SkiaRenderer, graph: SceneGraph): void {
  const now = performance.now()
  const total = FLASH_ATTACK_MS + FLASH_HOLD_MS + FLASH_RELEASE_MS
  r._flashes = r._flashes.filter(
    (flash) => now - flash.startTime <= total && graph.getNode(flash.nodeId)
  )
}

/** Flashes, guides, snap lines, the marquee and the auto layout insert position. */
function drawGestureFeedback(
  r: SkiaRenderer,
  canvas: Canvas,
  graph: SceneGraph,
  overlays: RenderOverlays,
  measuring: boolean
): void {
  const own = ownership(r)
  if (own('flashes')) r.drawFlashes(canvas, graph)
  else pruneFlashes(r, graph)
  if (own('guideRedline') && overlays.guides?.redline)
    drawMeasurementSegment(r, canvas, overlays.guides.redline.segment)
  if (own('guides')) drawGuides(r, canvas, graph, overlays.guides)
  if (own('snapGuides')) r.drawSnapGuides(canvas, overlays.snapGuides)
  if (own('marquee')) r.drawMarquee(canvas, overlays.marquee)
  if (own('layoutInsertIndicator'))
    r.drawLayoutInsertIndicator(canvas, overlays.layoutInsertIndicator)
  if (own('autoLayoutHover') && !measuring && !overlays.transforming) {
    r.drawAutoLayoutHover(canvas, graph, overlays.autoLayoutHover)
  }
}

/** Path editing, the pen, design issue markers and collaborators' cursors, on top. */
function drawTopOverlays(
  r: SkiaRenderer,
  canvas: Canvas,
  graph: SceneGraph,
  overlays: RenderOverlays
): void {
  const own = ownership(r)
  // The shape follows the vertices as they move; the DOM scene redraws it itself.
  r.drawNodeEditOverlay(
    canvas,
    graph,
    overlays.nodeEditState,
    own('nodeEdit'),
    own('nodeEditShape')
  )
  if (own('pen')) r.drawPenOverlay(canvas, overlays.penState)
  if (own('issueMarkers')) {
    updateIssueMarkers(r, graph, overlays)
    drawIssueMarkers(r, canvas, r.issueMarkers, overlays.designIssues?.hoveredMarkerKey)
  } else {
    // Hit testing reads the markers the other backend laid out, never a stale layout here.
    r.issueMarkers = []
  }
  if (own('presence')) r.drawPresenceCursors(canvas, graph, overlays.presenceCursors)
}

export function drawOverlayPass(
  r: SkiaRenderer,
  canvas: Canvas,
  graph: SceneGraph,
  selectedIds: Set<string>,
  overlays: RenderOverlays
): void {
  const own = ownership(r)
  const measuring = measurementVisible(overlays)
  const hoveredNodeId =
    measuring || overlays.hoveredNodeId === overlays.nodeEditState?.nodeId
      ? null
      : overlays.hoveredNodeId
  drawStructureOutlines(r, canvas, graph, selectedIds, overlays, hoveredNodeId, measuring)
  if (own('hover')) r.drawHoverHighlight(canvas, graph, hoveredNodeId, overlays.rotationPreview)
  if (own('issueHighlight'))
    drawIssueHighlight(r, canvas, graph, overlays.designIssues?.highlight, overlays.rotationPreview)
  if (own('enteredContainer'))
    r.drawEnteredContainer(canvas, graph, overlays.enteredContainerId, overlays.rotationPreview)
  if (own('dropTarget'))
    drawDropTarget(r, canvas, graph, overlays.dropTargetId, overlays.rotationPreview)
  if (own('textEdit')) drawEditingText(r, canvas, graph, overlays)
  r.profiler.beginPhase('render:selection')
  if (own('selection')) r.drawSelection(canvas, graph, selectedIds, overlays)
  if (own('measurements') && measuring)
    r.drawMeasurements(canvas, graph, selectedIds, overlays.hoveredNodeId)
  r.profiler.endPhase('render:selection')
  drawGestureFeedback(r, canvas, graph, overlays, measuring)
  drawTopOverlays(r, canvas, graph, overlays)
}

export function drawChromePass(
  r: SkiaRenderer,
  canvas: Canvas,
  graph: SceneGraph,
  selectedIds: Set<string>,
  overlays: RenderOverlays
): void {
  r.profiler.beginPhase('render:rulers')
  if (r.showRulers && !r.delegatedOverlays.has('rulers'))
    r.drawRulers(canvas, graph, selectedIds, overlays.guides)
  r.profiler.endPhase('render:rulers')
  r.profiler.drawHUD(canvas, r.showRulers)
}
