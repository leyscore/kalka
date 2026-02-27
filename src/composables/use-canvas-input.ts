import { useEventListener } from '@vueuse/core'
import { ref, type Ref } from 'vue'

import type { NodeType, SceneNode } from '../engine/scene-graph'
import type { EditorStore, Tool } from '../stores/editor'

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface DragDraw {
  type: 'draw'
  startX: number
  startY: number
  nodeId: string
}

interface DragMove {
  type: 'move'
  startX: number
  startY: number
  originals: Map<string, { x: number; y: number }>
  duplicated?: boolean
}

interface DragPan {
  type: 'pan'
  startScreenX: number
  startScreenY: number
  startPanX: number
  startPanY: number
}

interface DragResize {
  type: 'resize'
  handle: HandlePosition
  startX: number
  startY: number
  origRect: { x: number; y: number; width: number; height: number }
  nodeId: string
}

interface DragMarquee {
  type: 'marquee'
  startX: number
  startY: number
}

type DragState = DragDraw | DragMove | DragPan | DragResize | DragMarquee

const TOOL_TO_NODE: Partial<Record<Tool, NodeType>> = {
  FRAME: 'FRAME',
  RECTANGLE: 'RECTANGLE',
  ELLIPSE: 'ELLIPSE',
  LINE: 'LINE'
}

const HANDLE_HIT_RADIUS = 6

const HANDLE_CURSORS: Record<HandlePosition, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize'
}

function getHandlePositions(node: SceneNode, zoom: number, panX: number, panY: number) {
  const x1 = node.x * zoom + panX
  const y1 = node.y * zoom + panY
  const x2 = (node.x + node.width) * zoom + panX
  const y2 = (node.y + node.height) * zoom + panY
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2

  return {
    nw: { x: x1, y: y1 },
    n: { x: mx, y: y1 },
    ne: { x: x2, y: y1 },
    e: { x: x2, y: my },
    se: { x: x2, y: y2 },
    s: { x: mx, y: y2 },
    sw: { x: x1, y: y2 },
    w: { x: x1, y: my }
  } as Record<HandlePosition, { x: number; y: number }>
}

function hitTestHandle(
  sx: number,
  sy: number,
  node: SceneNode,
  zoom: number,
  panX: number,
  panY: number
): HandlePosition | null {
  const handles = getHandlePositions(node, zoom, panX, panY)
  for (const [pos, pt] of Object.entries(handles)) {
    if (Math.abs(sx - pt.x) < HANDLE_HIT_RADIUS && Math.abs(sy - pt.y) < HANDLE_HIT_RADIUS) {
      return pos as HandlePosition
    }
  }
  return null
}

export function useCanvasInput(canvasRef: Ref<HTMLCanvasElement | null>, store: EditorStore) {
  const drag = ref<DragState | null>(null)
  const cursorOverride = ref<string | null>(null)

  function getCoords(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas) return { sx: 0, sy: 0, cx: 0, cy: 0 }
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const { x: cx, y: cy } = store.screenToCanvas(sx, sy)
    return { sx, sy, cx, cy }
  }

  function onMouseDown(e: MouseEvent) {
    const { sx, sy, cx, cy } = getCoords(e)
    const tool = store.state.activeTool

    // Middle mouse or Hand tool → pan
    if (e.button === 1 || tool === 'HAND') {
      drag.value = {
        type: 'pan',
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        startPanX: store.state.panX,
        startPanY: store.state.panY
      }
      return
    }

    // Alt+click with SELECT → pan
    if (tool === 'SELECT' && e.altKey && !store.state.selectedIds.size) {
      drag.value = {
        type: 'pan',
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        startPanX: store.state.panX,
        startPanY: store.state.panY
      }
      return
    }

    if (tool === 'SELECT') {
      // Check resize handles first
      for (const id of store.state.selectedIds) {
        const node = store.graph.getNode(id)
        if (!node) continue
        const handle = hitTestHandle(
          sx,
          sy,
          node,
          store.state.zoom,
          store.state.panX,
          store.state.panY
        )
        if (handle) {
          drag.value = {
            type: 'resize',
            handle,
            startX: cx,
            startY: cy,
            origRect: { x: node.x, y: node.y, width: node.width, height: node.height },
            nodeId: id
          }
          return
        }
      }

      // Hit test nodes
      const hit = store.graph.hitTest(cx, cy)
      if (hit) {
        if (!store.state.selectedIds.has(hit.id) && !e.shiftKey) {
          store.select([hit.id])
        } else if (e.shiftKey) {
          store.select([hit.id], true)
        }

        const originals = new Map<string, { x: number; y: number }>()
        for (const id of store.state.selectedIds) {
          const n = store.graph.getNode(id)
          if (n) originals.set(id, { x: n.x, y: n.y })
        }

        // Alt+drag selected → duplicate
        if (e.altKey && store.state.selectedIds.size > 0) {
          const newIds: string[] = []
          const newOriginals = new Map<string, { x: number; y: number }>()
          for (const id of store.state.selectedIds) {
            const src = store.graph.getNode(id)
            if (!src) continue
            const newId = store.createShape(src.type, src.x, src.y, src.width, src.height)
            store.graph.updateNode(newId, {
              name: src.name + ' copy',
              fills: [...src.fills],
              strokes: [...src.strokes],
              effects: [...src.effects],
              cornerRadius: src.cornerRadius,
              opacity: src.opacity,
              rotation: src.rotation
            })
            newIds.push(newId)
            newOriginals.set(newId, { x: src.x, y: src.y })
          }
          store.select(newIds)
          drag.value = {
            type: 'move',
            startX: cx,
            startY: cy,
            originals: newOriginals,
            duplicated: true
          }
          store.requestRender()
          return
        }

        drag.value = { type: 'move', startX: cx, startY: cy, originals }
      } else {
        // Marquee selection
        store.clearSelection()
        drag.value = { type: 'marquee', startX: cx, startY: cy }
      }
      return
    }

    // Shape creation
    const nodeType = TOOL_TO_NODE[tool]
    if (!nodeType) return

    const nodeId = store.createShape(nodeType, cx, cy, 0, 0)
    store.select([nodeId])

    drag.value = { type: 'draw', startX: cx, startY: cy, nodeId }
  }

  function onMouseMove(e: MouseEvent) {
    // Cursor changes on hover (when not dragging)
    if (!drag.value && store.state.activeTool === 'SELECT') {
      const { sx, sy } = getCoords(e)
      let cursor: string | null = null
      for (const id of store.state.selectedIds) {
        const node = store.graph.getNode(id)
        if (!node) continue
        const handle = hitTestHandle(
          sx,
          sy,
          node,
          store.state.zoom,
          store.state.panX,
          store.state.panY
        )
        if (handle) {
          cursor = HANDLE_CURSORS[handle]
          break
        }
      }
      cursorOverride.value = cursor
    }

    if (!drag.value) return
    const d = drag.value

    if (d.type === 'pan') {
      const dx = e.clientX - d.startScreenX
      const dy = e.clientY - d.startScreenY
      store.state.panX = d.startPanX + dx
      store.state.panY = d.startPanY + dy
      store.requestRender()
      return
    }

    const { cx, cy } = getCoords(e)

    if (d.type === 'move') {
      const dx = cx - d.startX
      const dy = cy - d.startY
      for (const [id, orig] of d.originals) {
        store.updateNode(id, { x: Math.round(orig.x + dx), y: Math.round(orig.y + dy) })
      }
      return
    }

    if (d.type === 'resize') {
      applyResize(d, cx, cy, e.shiftKey)
      return
    }

    if (d.type === 'draw') {
      let w = cx - d.startX
      let h = cy - d.startY

      // Shift → constrain to square
      if (e.shiftKey) {
        const size = Math.max(Math.abs(w), Math.abs(h))
        w = Math.sign(w) * size
        h = Math.sign(h) * size
      }

      store.updateNode(d.nodeId, {
        x: w < 0 ? d.startX + w : d.startX,
        y: h < 0 ? d.startY + h : d.startY,
        width: Math.abs(w),
        height: Math.abs(h)
      })
      return
    }

    if (d.type === 'marquee') {
      const minX = Math.min(d.startX, cx)
      const minY = Math.min(d.startY, cy)
      const maxX = Math.max(d.startX, cx)
      const maxY = Math.max(d.startY, cy)

      const hits: string[] = []
      for (const node of store.graph.getChildren(store.graph.rootId)) {
        if (
          node.x + node.width > minX &&
          node.x < maxX &&
          node.y + node.height > minY &&
          node.y < maxY
        ) {
          hits.push(node.id)
        }
      }
      store.select(hits)
      store.setMarquee({ x: minX, y: minY, width: maxX - minX, height: maxY - minY })
    }
  }

  function applyResize(d: DragResize, cx: number, cy: number, constrain: boolean) {
    const { handle, origRect } = d
    let { x, y, width, height } = origRect
    const dx = cx - d.startX
    const dy = cy - d.startY

    // Which edges move
    const moveLeft = handle.includes('w')
    const moveRight = handle.includes('e')
    const moveTop = handle === 'nw' || handle === 'n' || handle === 'ne'
    const moveBottom = handle === 'sw' || handle === 's' || handle === 'se'

    if (moveRight) width = origRect.width + dx
    if (moveLeft) {
      x = origRect.x + dx
      width = origRect.width - dx
    }
    if (moveBottom) height = origRect.height + dy
    if (moveTop) {
      y = origRect.y + dy
      height = origRect.height - dy
    }

    // Shift → maintain aspect ratio
    if (constrain && origRect.width > 0 && origRect.height > 0) {
      const aspect = origRect.width / origRect.height
      if (handle === 'n' || handle === 's') {
        width = Math.abs(height) * aspect
        x = origRect.x + (origRect.width - width) / 2
      } else if (handle === 'e' || handle === 'w') {
        height = Math.abs(width) / aspect
        y = origRect.y + (origRect.height - height) / 2
      } else {
        if (Math.abs(dx) > Math.abs(dy)) {
          height = (Math.abs(width) / aspect) * Math.sign(height || 1)
          if (moveTop) y = origRect.y + origRect.height - Math.abs(height)
        } else {
          width = Math.abs(height) * aspect * Math.sign(width || 1)
          if (moveLeft) x = origRect.x + origRect.width - Math.abs(width)
        }
      }
    }

    // Prevent negative sizes — flip
    if (width < 0) {
      x = x + width
      width = -width
    }
    if (height < 0) {
      y = y + height
      height = -height
    }

    store.updateNode(d.nodeId, {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(Math.max(1, width)),
      height: Math.round(Math.max(1, height))
    })
  }

  function onMouseUp() {
    if (!drag.value) return
    const d = drag.value

    if (d.type === 'move') {
      store.commitMove(d.originals)
    }

    if (d.type === 'resize') {
      // TODO: commit resize to undo stack
    }

    if (d.type === 'draw') {
      const node = store.graph.getNode(d.nodeId)
      if (node && node.width < 2 && node.height < 2) {
        store.updateNode(d.nodeId, { width: 100, height: 100 })
      }
      store.setTool('SELECT')
    }

    if (d.type === 'marquee') {
      store.setMarquee(null)
    }

    drag.value = null
    cursorOverride.value = null
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

  useEventListener(canvasRef, 'mousedown', onMouseDown)
  useEventListener(canvasRef, 'mousemove', onMouseMove)
  useEventListener(canvasRef, 'mouseup', onMouseUp)
  useEventListener(canvasRef, 'mouseleave', onMouseUp)
  useEventListener(canvasRef, 'wheel', onWheel, { passive: false })

  return {
    drag,
    cursorOverride
  }
}
