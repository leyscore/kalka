import { ref, onMounted, onUnmounted, type Ref } from 'vue'

import type { NodeType } from '../engine/scene-graph'
import type { EditorStore, Tool } from '../stores/editor'

interface DragState {
  type: 'draw' | 'move' | 'pan'
  startScreenX: number
  startScreenY: number
  startCanvasX: number
  startCanvasY: number
  nodeId?: string
  originals?: Map<string, { x: number; y: number }>
  startPanX?: number
  startPanY?: number
}

const TOOL_TO_NODE: Partial<Record<Tool, NodeType>> = {
  FRAME: 'FRAME',
  RECTANGLE: 'RECTANGLE',
  ELLIPSE: 'ELLIPSE',
  LINE: 'LINE'
}

export function useCanvasInput(canvasRef: Ref<HTMLCanvasElement | null>, store: EditorStore) {
  const drag = ref<DragState | null>(null)

  function getCanvasCoords(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas) return { sx: 0, sy: 0, cx: 0, cy: 0 }
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const { x: cx, y: cy } = store.screenToCanvas(sx, sy)
    return { sx, sy, cx, cy }
  }

  function onMouseDown(e: MouseEvent) {
    const { sx, sy, cx, cy } = getCanvasCoords(e)
    const tool = store.state.activeTool

    // Middle mouse or Hand tool or space → pan
    if (e.button === 1 || tool === 'HAND') {
      drag.value = {
        type: 'pan',
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        startCanvasX: cx,
        startCanvasY: cy,
        startPanX: store.state.panX,
        startPanY: store.state.panY
      }
      return
    }

    // Alt+click → pan
    if (tool === 'SELECT' && e.altKey) {
      drag.value = {
        type: 'pan',
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        startCanvasX: cx,
        startCanvasY: cy,
        startPanX: store.state.panX,
        startPanY: store.state.panY
      }
      return
    }

    if (tool === 'SELECT') {
      const hit = store.graph.hitTest(cx, cy)
      if (hit) {
        store.select([hit.id], e.shiftKey)

        const originals = new Map<string, { x: number; y: number }>()
        const ids = e.shiftKey ? store.state.selectedIds : new Set([hit.id])
        for (const id of ids) {
          const n = store.graph.getNode(id)
          if (n) originals.set(id, { x: n.x, y: n.y })
        }

        drag.value = {
          type: 'move',
          startScreenX: sx,
          startScreenY: sy,
          startCanvasX: cx,
          startCanvasY: cy,
          originals
        }
      } else {
        store.clearSelection()
      }
      return
    }

    // Shape creation
    const nodeType = TOOL_TO_NODE[tool]
    if (!nodeType) return

    const nodeId = store.createShape(nodeType, cx, cy, 0, 0)
    store.select([nodeId])

    drag.value = {
      type: 'draw',
      startScreenX: sx,
      startScreenY: sy,
      startCanvasX: cx,
      startCanvasY: cy,
      nodeId
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!drag.value) return
    const d = drag.value

    if (d.type === 'pan') {
      const dx = e.clientX - d.startScreenX
      const dy = e.clientY - d.startScreenY
      store.state.panX = (d.startPanX ?? 0) + dx
      store.state.panY = (d.startPanY ?? 0) + dy
      store.requestRender()
      return
    }

    const { cx, cy } = getCanvasCoords(e)

    if (d.type === 'move' && d.originals) {
      const dx = cx - d.startCanvasX
      const dy = cy - d.startCanvasY
      for (const [id, orig] of d.originals) {
        store.updateNode(id, { x: orig.x + dx, y: orig.y + dy })
      }
      return
    }

    if (d.type === 'draw' && d.nodeId) {
      const w = cx - d.startCanvasX
      const h = cy - d.startCanvasY
      store.updateNode(d.nodeId, {
        x: w < 0 ? cx : d.startCanvasX,
        y: h < 0 ? cy : d.startCanvasY,
        width: Math.abs(w),
        height: Math.abs(h)
      })
    }
  }

  function onMouseUp() {
    if (!drag.value) return
    const d = drag.value

    if (d.type === 'move' && d.originals) {
      store.commitMove(d.originals)
    }

    if (d.type === 'draw' && d.nodeId) {
      const node = store.graph.getNode(d.nodeId)
      if (node && node.width < 2 && node.height < 2) {
        store.updateNode(d.nodeId, { width: 100, height: 100 })
      }
      store.setTool('SELECT')
    }

    drag.value = null
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    const canvas = canvasRef.value
    if (!canvas) return

    if (e.ctrlKey || e.metaKey) {
      const rect = canvas.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      store.applyZoom(e.deltaY, sx, sy)
    } else {
      store.pan(-e.deltaX, -e.deltaY)
    }
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.addEventListener('wheel', onWheel, { passive: false })
  })

  onUnmounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.removeEventListener('wheel', onWheel)
  })

  return {
    drag,
    onMouseDown,
    onMouseMove,
    onMouseUp
  }
}
