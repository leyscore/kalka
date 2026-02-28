import { useResizeObserver } from '@vueuse/core'
import { onMounted, onUnmounted, watch, type Ref } from 'vue'

import { getCanvasKit } from '../engine/canvaskit'
import { SkiaRenderer } from '../engine/renderer'

import type { EditorStore } from '../stores/editor'
import type { CanvasKit } from 'canvaskit-wasm'

export function useCanvas(canvasRef: Ref<HTMLCanvasElement | null>, store: EditorStore) {
  let renderer: SkiaRenderer | null = null
  let ck: CanvasKit | null = null
  let destroyed = false

  async function init() {
    const canvas = canvasRef.value
    if (!canvas || destroyed) return

    ck = await getCanvasKit()
    if (destroyed) return

    await new Promise((r) => requestAnimationFrame(r))
    createSurface(canvas)
  }

  function createSurface(canvas: HTMLCanvasElement) {
    if (!ck) return

    renderer?.destroy()
    renderer = null

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr

    const surface = ck.MakeWebGLCanvasSurface(canvas, undefined, { preserveDrawingBuffer: 1 })
    if (!surface) {
      console.error('Failed to create WebGL surface')
      return
    }

    renderer = new SkiaRenderer(ck, surface)
    renderer.loadFonts().then(() => render())
    render()
    canvas.dataset.ready = '1'
  }

  function render() {
    if (!renderer) return
    renderer.dpr = window.devicePixelRatio || 1
    renderer.panX = store.state.panX
    renderer.panY = store.state.panY
    renderer.zoom = store.state.zoom
    renderer.viewportWidth = canvasRef.value?.clientWidth ?? 0
    renderer.viewportHeight = canvasRef.value?.clientHeight ?? 0
    renderer.showRulers = !new URLSearchParams(window.location.search).has('no-rulers')
    renderer.render(store.graph, store.state.selectedIds, {
      editingTextId: store.state.editingTextId,
      marquee: store.state.marquee,
      snapGuides: store.state.snapGuides,
      rotationPreview: store.state.rotationPreview,
      dropTargetId: store.state.dropTargetId,
      layoutInsertIndicator: store.state.layoutInsertIndicator,
      penState: store.state.penState ? {
        ...store.state.penState,
        cursorX: store.state.penCursorX ?? undefined,
        cursorY: store.state.penCursorY ?? undefined
      } : null
    })
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    destroyed = true
    renderer?.destroy()
  })

  useResizeObserver(canvasRef, () => {
    const canvas = canvasRef.value
    if (!canvas || !ck) return
    createSurface(canvas)
  })

  watch(
    () => store.state.renderVersion,
    () => render()
  )

  watch(
    () => store.state.selectedIds,
    () => render()
  )

  return { render }
}
