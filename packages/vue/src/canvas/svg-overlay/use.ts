import { onScopeDispose, watch, type Ref } from 'vue'

import { overlaysFromEditorState } from '@open-pencil/core/canvas'
import type { Editor, EditorState } from '@open-pencil/core/editor'

import { composeOverlay } from './compose'
import { clearOverlay, renderOverlay } from './render'
import type { MeasureText } from './shapes'

export { SVG_OVERLAY_LAYERS } from './compose'

export interface UseSVGOverlayOptions {
  /** The view this pane draws. Defaults to `editor.state`. */
  getRenderState?: () => EditorState
}

/** Text widths as the overlay draws them, with the app's interface font. */
function createMeasureText(): MeasureText {
  const context = new OffscreenCanvas(1, 1).getContext('2d')
  return (text, fontSize, fontWeight = 400) => {
    if (!context) return text.length * fontSize * 0.6
    context.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
    return context.measureText(text).width
  }
}

/**
 * Editor chrome over the DOM scene, drawn as SVG: selection, hover, guides. It redraws on the
 * frames the editor asks for, the same versions the canvas renderer follows.
 */
export function useSVGOverlay(
  host: Ref<HTMLElement | null>,
  editor: Editor,
  options: UseSVGOverlayOptions = {}
) {
  const measureText = createMeasureText()
  let frame = 0
  let drawn = ''

  function tick() {
    frame = requestAnimationFrame(tick)
    const element = host.value
    if (!element) return
    const state = options.getRenderState?.() ?? editor.state
    const key = `${state.renderVersion}:${state.sceneVersion}:${state.panX}:${state.panY}:${state.zoom}:${state.currentPageId}:${[...state.selectedIds].join(',')}`
    if (key === drawn) return
    drawn = key
    const overlays = overlaysFromEditorState(state, editor.graph, editor.textEditor)
    renderOverlay(
      element,
      composeOverlay({
        graph: editor.graph,
        view: { panX: state.panX, panY: state.panY, zoom: state.zoom },
        overlays,
        selectedIds: overlays.playing ? new Set() : state.selectedIds,
        measureText
      })
    )
  }

  watch(
    host,
    (element, previous) => {
      if (previous) clearOverlay(previous)
      drawn = ''
      cancelAnimationFrame(frame)
      if (element) frame = requestAnimationFrame(tick)
    },
    { immediate: true, flush: 'post' }
  )
  onScopeDispose(() => {
    cancelAnimationFrame(frame)
    if (host.value) clearOverlay(host.value)
  })
}
