import { onScopeDispose, watch, type Ref } from 'vue'

import {
  hitTestComponentLabel,
  hitTestFrameTitle,
  hitTestSectionTitle,
  LabelCache,
  overlaysFromEditorState,
  type LabelHitOptions,
  type PlacedIssueMarker
} from '@open-pencil/core/canvas'
import type { Editor, EditorState } from '@open-pencil/core/editor'
import type { Rect } from '@open-pencil/scene-graph/primitives'

import { composeOverlay } from '#vue/canvas/svg-overlay/compose'
import { clearOverlay, renderOverlay } from '#vue/canvas/svg-overlay/render'
import type { MeasureText } from '#vue/canvas/svg-overlay/shapes'

export { SVG_OVERLAY_LAYERS } from '#vue/canvas/svg-overlay/compose'

export interface UseSVGOverlayOptions {
  /** The view this pane draws. Defaults to `editor.state`. */
  getRenderState?: () => EditorState
  /** Whether the rulers show; read every frame. */
  showRulers?: () => boolean
  /** UI floating over the canvas, in its CSS pixels, which edge-pinned markers keep clear of. */
  getOverlayObstacles?: () => readonly Rect[]
}

/** Text widths as the overlay draws them, with the app's interface font. */
function createMeasureText(): MeasureText {
  const context = new OffscreenCanvas(1, 1).getContext('2d')
  const cache = new Map<string, number>()
  return (text, fontSize, fontWeight = 400) => {
    const key = `${fontWeight}:${fontSize}:${text}`
    const known = cache.get(key)
    if (known !== undefined) return known
    if (!context) return text.length * fontSize * 0.6
    context.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
    const width = context.measureText(text).width
    if (cache.size > 2000) cache.clear()
    cache.set(key, width)
    return width
  }
}

/**
 * Editor chrome over the DOM scene, drawn as SVG: labels, selection, guides, rulers. It redraws
 * on the frames where something it shows changed: the editor's versions, the view, or the
 * transient state the canvas renderer reads every frame.
 */
export function useSVGOverlay(
  host: Ref<HTMLElement | null>,
  editor: Editor,
  options: UseSVGOverlayOptions = {}
) {
  const measureText = createMeasureText()
  const labels = new LabelCache()
  let frame = 0
  let drawn: unknown[] = []
  let issueMarkers: PlacedIssueMarker[] = []

  function changed(next: unknown[]): boolean {
    if (
      next.length === drawn.length &&
      next.every((value, index) => Object.is(value, drawn[index]))
    )
      return false
    drawn = next
    return true
  }

  function tick() {
    frame = requestAnimationFrame(tick)
    const element = host.value
    if (!element) return
    const state = options.getRenderState?.() ?? editor.state
    const renderer = editor.renderer
    const flashes = renderer?._flashes ?? []
    const aiMarks = { active: renderer?._aiActiveNodes ?? [], done: renderer?._aiDoneFlashes ?? [] }
    const animating = flashes.length > 0 || aiMarks.done.length > 0 || renderer?._aiActiveNodes.size
    const showRulers = options.showRulers?.() ?? false
    const obstacles = options.getOverlayObstacles?.() ?? []
    const width = element.clientWidth
    const height = element.clientHeight
    const key = [
      state.renderVersion,
      state.sceneVersion,
      state.panX,
      state.panY,
      state.zoom,
      state.currentPageId,
      state.selectedIds,
      state.hoveredNodeId,
      state.designIssues,
      state.presenceCursors,
      state.guides,
      state.pageColor,
      state.rulerTheme,
      showRulers,
      width,
      height,
      window.devicePixelRatio,
      obstacles.map((rect) => `${rect.x},${rect.y},${rect.width},${rect.height}`).join(';'),
      // Flashes and AI marks animate: redraw every frame while one runs.
      animating ? performance.now() : 0
    ]
    if (!changed(key)) return
    labels.update(editor.graph, state.currentPageId, state.sceneVersion)
    const overlays = overlaysFromEditorState(state, editor.graph, editor.textEditor)
    const composed = composeOverlay({
      graph: editor.graph,
      view: { panX: state.panX, panY: state.panY, zoom: state.zoom },
      overlays,
      selectedIds: overlays.playing ? new Set() : state.selectedIds,
      measureText,
      pageId: state.currentPageId,
      viewportSize: { width, height },
      dpr: window.devicePixelRatio,
      pageColor: state.pageColor,
      labels,
      showRulers,
      rulerTheme: state.rulerTheme,
      obstacles,
      flashes,
      aiMarks,
      now: performance.now()
    })
    issueMarkers = composed.issueMarkers
    renderOverlay(element, composed.shapes)
  }

  watch(
    host,
    (element, previous) => {
      if (previous) clearOverlay(previous)
      drawn = []
      cancelAnimationFrame(frame)
      if (element) frame = requestAnimationFrame(tick)
    },
    { immediate: true, flush: 'post' }
  )
  onScopeDispose(() => {
    cancelAnimationFrame(frame)
    if (host.value) clearOverlay(host.value)
  })

  /** Label hit tests measure names as the overlay draws them, so a click lands on what shows. */
  function labelHits(hit: typeof hitTestFrameTitle) {
    return (worldX: number, worldY: number) => {
      const state = options.getRenderState?.() ?? editor.state
      const element = host.value
      const { panX, panY, zoom } = state
      labels.update(editor.graph, state.currentPageId, state.sceneVersion)
      const hitOptions: LabelHitOptions = {
        preview: state.rotationPreview,
        viewport: {
          x: -panX / zoom,
          y: -panY / zoom,
          w: (element?.clientWidth ?? 0) / zoom,
          h: (element?.clientHeight ?? 0) / zoom
        },
        measure: (node, layout) => ({
          width: measureText(node.name, layout.fontSize, layout.fontWeight),
          height: layout.fontSize
        })
      }
      return hit(editor.graph, worldX, worldY, zoom, state.currentPageId, null, labels, hitOptions)
    }
  }

  return {
    /** The issue markers as last drawn, in the host's CSS pixels, for pointer hit testing. */
    issueMarkers: () => issueMarkers,
    hitTestFrameTitle: labelHits(hitTestFrameTitle),
    hitTestSectionTitle: labelHits(hitTestSectionTitle),
    hitTestComponentLabel: labelHits(hitTestComponentLabel)
  }
}
