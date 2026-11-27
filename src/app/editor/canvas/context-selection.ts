import type { Ref } from 'vue'

import { hitTestGuides } from '@kalka/core/canvas'

import type { EditorStore } from '@/app/editor/active-store'

export function createCanvasContextSelection(
  canvasRef: Ref<HTMLCanvasElement | null>,
  store: EditorStore
) {
  function selectAtContextPoint(event: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sx = event.clientX - rect.left
    const sy = event.clientY - rect.top
    const guide = hitTestGuides(
      store.graph,
      store.state.currentPageId,
      {
        panX: store.state.panX,
        panY: store.state.panY,
        zoom: store.state.zoom,
        width: rect.width,
        height: rect.height
      },
      sx,
      sy
    )
    if (guide) {
      store.setSelectedGuide({ ownerId: guide.ownerId, guideId: guide.guideId })
      return
    }
    store.setSelectedGuide(null)
    const { x: cx, y: cy } = store.screenToCanvas(sx, sy)
    // As in Figma, a right-click on the selection keeps it, even over a layer inside it, so its
    // menu acts on what was selected.
    if (insideSelection(cx, cy)) return
    store.selectAtPoint(cx, cy)
  }

  function insideSelection(x: number, y: number): boolean {
    for (const id of store.state.selectedIds) {
      const node = store.graph.getNode(id)
      if (!node || node.type === 'CANVAS') continue
      const box = store.graph.getAbsoluteBounds(id)
      if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height) return true
    }
    return false
  }

  return { selectAtContextPoint }
}
