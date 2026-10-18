import {
  useDevicePixelRatio,
  useEventListener,
  usePreferredReducedMotion,
  useResizeObserver
} from '@vueuse/core'
import { onScopeDispose, watch, type Ref } from 'vue'

import {
  hitTestComponentLabel,
  hitTestFrameTitle,
  hitTestSectionTitle,
  LabelCache,
  overlaysFromEditorState,
  type LabelHitOptions,
  type PlacedIssueMarker
} from '@kalka/core/canvas'
import type { Editor, EditorState } from '@kalka/core/editor'
import type { Color } from '@kalka/scene-graph'
import type { Rect } from '@kalka/scene-graph/primitives'

import { createFrameRequest } from '#vue/canvas/frame-request'
import { composeOverlay } from '#vue/canvas/svg-overlay/compose'
import type { AgentWorkMark } from '#vue/canvas/svg-overlay/layers/agent-work'
import { clearOverlay, renderOverlay } from '#vue/canvas/svg-overlay/render'
import { createMeasureText, loadLabelFont } from '#vue/canvas/svg-overlay/text'

export { SVG_OVERLAY_LAYERS } from '#vue/canvas/svg-overlay/compose'

export interface UseSVGOverlayOptions {
  /** The view this pane draws. Defaults to `editor.state`. */
  getRenderState?: () => EditorState
  /** Whether the rulers show; reactive, so the overlay redraws when it changes. */
  showRulers?: () => boolean
  /** UI floating over the canvas, in its CSS pixels, which edge-pinned markers keep clear of. */
  getOverlayObstacles?: () => readonly Rect[]
  /** The color behind the artboards, when the app shows its own instead of the page's. */
  getCanvasColor?: (pageColor: Color) => Color
  /**
   * Layers agents are building on `pageId`, marked with their names. Reactive, so the overlay
   * redraws when they change; return the same array while nothing changed.
   */
  getAgentWork?: (pageId: string) => readonly AgentWorkMark[]
}

/** The same empty list every frame, so a pane without agents never redraws for it. */
const NO_AGENT_WORK: readonly AgentWorkMark[] = []

/**
 * Editor chrome over the DOM scene, drawn as SVG: labels, selection, guides, rulers. It draws a
 * frame only when something it shows changed: the editor's versions, the view, its size, or a
 * flash or AI mark still animating.
 */
export function useSVGOverlay(
  host: Ref<HTMLElement | null>,
  editor: Editor,
  options: UseSVGOverlayOptions = {}
) {
  let measureText = createMeasureText()
  const labels = new LabelCache()
  const reducedMotion = usePreferredReducedMotion()
  const { pixelRatio } = useDevicePixelRatio()
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

  /** The color behind the artboards: the app's, when it shows its own, else the page's. */
  function canvasColorOf(state: EditorState): Color {
    return options.getCanvasColor ? options.getCanvasColor(state.pageColor) : state.pageColor
  }

  function agentWorkOn(pageId: string): readonly AgentWorkMark[] {
    return options.getAgentWork?.(pageId) ?? NO_AGENT_WORK
  }

  /** Draws one requested frame; true while flashes or AI marks animate and need the next. */
  function tick(): boolean {
    const element = host.value
    if (!element) return false
    const state = options.getRenderState?.() ?? editor.state
    const renderer = editor.renderer
    const flashes = renderer?._flashes ?? []
    const aiMarks = {
      active: renderer?._aiActiveNodes ?? [],
      done: renderer?._aiDoneFlashes ?? [],
      still: reducedMotion.value === 'reduce'
    }
    const animating = flashes.length > 0 || aiMarks.done.length > 0 || renderer?._aiActiveNodes.size
    const showRulers = options.showRulers?.() ?? false
    const obstacles = options.getOverlayObstacles?.() ?? []
    const canvasColor = canvasColorOf(state)
    const agentWork = agentWorkOn(state.currentPageId)
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
      agentWork,
      state.guides,
      canvasColor,
      state.rulerTheme,
      showRulers,
      width,
      height,
      window.devicePixelRatio,
      obstacles.map((rect) => `${rect.x},${rect.y},${rect.width},${rect.height}`).join(';'),
      // Flashes and AI marks animate: redraw every frame while one runs.
      animating ? performance.now() : 0
    ]
    if (!changed(key)) return !!animating
    labels.update(editor.graph, state.currentPageId, state.sceneVersion)
    const overlays = overlaysFromEditorState(state, editor.graph, editor.textEditor)
    const composed = composeOverlay({
      graph: editor.graph,
      view: { panX: state.panX, panY: state.panY, zoom: state.zoom },
      overlays,
      selectedIds: overlays.playing ? new Set() : state.selectedIds,
      measureText,
      pageId: state.currentPageId,
      sceneVersion: state.sceneVersion,
      viewportSize: { width, height },
      dpr: window.devicePixelRatio,
      pageColor: canvasColor,
      labels,
      showRulers,
      rulerTheme: state.rulerTheme,
      obstacles,
      flashes,
      aiMarks,
      agentWork,
      now: performance.now()
    })
    issueMarkers = composed.issueMarkers
    renderOverlay(element, composed.shapes)
    return !!animating
  }

  const frames = createFrameRequest(tick)

  // Names are measured again once the labels' font has loaded, and the overlay redraws with it.
  const fontsReady = loadLabelFont().then(() => {
    measureText = createMeasureText()
    drawn = []
    frames.request()
    return undefined
  })

  // What the overlay shows comes from reactive state; each change draws one frame. Flashes and
  // AI marks bump the render version while they animate.
  watch(
    () => {
      const state = options.getRenderState?.() ?? editor.state
      return [
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
        state.rulerTheme,
        canvasColorOf(state),
        agentWorkOn(state.currentPageId),
        options.showRulers?.(),
        reducedMotion.value,
        pixelRatio.value
      ]
    },
    frames.request,
    { flush: 'sync' }
  )
  // The overlay's size and the UI floating over it are read when a frame draws.
  useResizeObserver(host, frames.request)
  useEventListener(window, 'resize', frames.request, { passive: true })

  watch(
    host,
    (element, previous) => {
      if (previous) clearOverlay(previous)
      drawn = []
      frames.cancel()
      if (element) frames.request()
    },
    { immediate: true, flush: 'post' }
  )
  onScopeDispose(() => {
    frames.cancel()
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
    /** Settles once the labels' font has loaded; the overlay draws with it on the next frame. */
    fontsReady,
    /** The issue markers as last drawn, in the host's CSS pixels, for pointer hit testing. */
    issueMarkers: () => issueMarkers,
    hitTestFrameTitle: labelHits(hitTestFrameTitle),
    hitTestSectionTitle: labelHits(hitTestSectionTitle),
    hitTestComponentLabel: labelHits(hitTestComponentLabel)
  }
}
