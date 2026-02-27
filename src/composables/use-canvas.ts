import { useResizeObserver } from '@vueuse/core'
import { onMounted, onUnmounted, watch, type Ref } from 'vue'

import { getCanvasKit } from '../engine/canvaskit'
import { SkiaRenderer } from '../engine/renderer'

import type { EditorStore } from '../stores/editor'

export function useCanvas(canvasRef: Ref<HTMLCanvasElement | null>, store: EditorStore) {
  let renderer: SkiaRenderer | null = null
  let destroyed = false

  async function init() {
    const canvas = canvasRef.value
    if (!canvas || destroyed) return

    const ck = await getCanvasKit()
    if (destroyed) return

    await new Promise((r) => requestAnimationFrame(r))
    resizeCanvas(canvas)

    const surface = ck.MakeWebGLCanvasSurface(canvas)
    if (!surface) {
      console.error('Failed to create WebGL surface')
      return
    }

    renderer = new SkiaRenderer(ck, surface)
    render()
  }

  function resizeCanvas(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
  }

  function render() {
    if (!renderer) return
    renderer.dpr = window.devicePixelRatio || 1
    renderer.panX = store.state.panX
    renderer.panY = store.state.panY
    renderer.zoom = store.state.zoom
    renderer.render(store.graph, store.state.selectedIds, store.state.marquee)
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
    if (!canvas || !renderer) return
    resizeCanvas(canvas)
    render()
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
