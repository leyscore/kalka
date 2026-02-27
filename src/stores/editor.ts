import { reactive, shallowRef, computed } from 'vue'

import {
  parseFigmaClipboard,
  importClipboardNodes,
  parseOpenPencilClipboard,
  buildFigmaClipboardHTML,
  buildOpenPencilClipboardHTML,
  prefetchFigmaSchema
} from '../engine/clipboard'
import { readFigFile } from '../engine/fig-file'
import { computeLayout, computeAllLayouts } from '../engine/layout'
import { SceneGraph } from '../engine/scene-graph'
import { UndoManager } from '../engine/undo'

import type { SceneNode, NodeType, Fill, LayoutMode } from '../engine/scene-graph'
import type { SnapGuide } from '../engine/snap'

export type Tool = 'SELECT' | 'FRAME' | 'RECTANGLE' | 'ELLIPSE' | 'LINE' | 'TEXT' | 'PEN' | 'HAND'

export interface ToolDef {
  key: Tool
  label: string
  icon: string
  shortcut: string
  flyout?: Tool[]
}

export const TOOLS: ToolDef[] = [
  { key: 'SELECT', label: 'Move', icon: '↖', shortcut: 'V' },
  { key: 'FRAME', label: 'Frame', icon: '#', shortcut: 'F' },
  {
    key: 'RECTANGLE',
    label: 'Rectangle',
    icon: '□',
    shortcut: 'R',
    flyout: ['RECTANGLE', 'ELLIPSE', 'LINE']
  },
  { key: 'PEN', label: 'Pen', icon: '✒', shortcut: 'P' },
  { key: 'TEXT', label: 'Text', icon: 'T', shortcut: 'T' },
  { key: 'HAND', label: 'Hand', icon: '✋', shortcut: 'H' }
]

export const TOOL_SHORTCUTS: Record<string, Tool> = {
  v: 'SELECT',
  f: 'FRAME',
  r: 'RECTANGLE',
  o: 'ELLIPSE',
  l: 'LINE',
  t: 'TEXT',
  p: 'PEN',
  h: 'HAND'
}

const DEFAULT_FILLS: Record<string, Fill> = {
  FRAME: { type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true },
  RECTANGLE: {
    type: 'SOLID',
    color: { r: 0.83, g: 0.83, b: 0.83, a: 1 },
    opacity: 1,
    visible: true
  },
  ELLIPSE: {
    type: 'SOLID',
    color: { r: 0.83, g: 0.83, b: 0.83, a: 1 },
    opacity: 1,
    visible: true
  },
  LINE: { type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 1 }, opacity: 1, visible: true },
  TEXT: { type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }
}

export function createEditorStore() {
  let graph = new SceneGraph()
  const undo = new UndoManager()

  prefetchFigmaSchema()

  const state = reactive({
    activeTool: 'SELECT' as Tool,
    selectedIds: new Set<string>(),
    marquee: null as { x: number; y: number; width: number; height: number } | null,
    snapGuides: [] as SnapGuide[],
    rotationPreview: null as { nodeId: string; angle: number } | null,
    dropTargetId: null as string | null,
    layoutInsertIndicator: null as {
      parentId: string
      index: number
      x: number
      y: number
      length: number
      direction: 'HORIZONTAL' | 'VERTICAL'
    } | null,
    editingTextId: null as string | null,
    panX: 0,
    panY: 0,
    zoom: 1,
    renderVersion: 0
  })

  const selectedNodes = computed(() => {
    const nodes: SceneNode[] = []
    for (const id of state.selectedIds) {
      const n = graph.getNode(id)
      if (n) nodes.push(n)
    }
    return nodes
  })

  const selectedNode = computed(() =>
    selectedNodes.value.length === 1 ? selectedNodes.value[0] : undefined
  )

  const layerTree = computed(() => {
    void state.renderVersion
    return graph.flattenTree()
  })

  function requestRender() {
    state.renderVersion++
  }

  function setTool(tool: Tool) {
    state.activeTool = tool
  }

  function select(ids: string[], additive = false) {
    if (additive) {
      const next = new Set(state.selectedIds)
      for (const id of ids) {
        if (next.has(id)) next.delete(id)
        else next.add(id)
      }
      state.selectedIds = next
    } else {
      state.selectedIds = new Set(ids)
    }
  }

  function clearSelection() {
    state.selectedIds = new Set()
  }

  function setMarquee(rect: { x: number; y: number; width: number; height: number } | null) {
    state.marquee = rect
    requestRender()
  }

  function setSnapGuides(guides: SnapGuide[]) {
    state.snapGuides = guides
    requestRender()
  }

  function setRotationPreview(preview: { nodeId: string; angle: number } | null) {
    state.rotationPreview = preview
    requestRender()
  }

  function setDropTarget(id: string | null) {
    state.dropTargetId = id
    requestRender()
  }

  function setLayoutInsertIndicator(
    indicator: typeof state.layoutInsertIndicator
  ) {
    state.layoutInsertIndicator = indicator
    requestRender()
  }

  function reorderInAutoLayout(nodeId: string, parentId: string, insertIndex: number) {
    const parent = graph.getNode(parentId)
    if (!parent || parent.layoutMode === 'NONE') return

    const node = graph.getNode(nodeId)
    if (!node) return

    // Convert position if coming from different parent
    if (node.parentId !== parentId) {
      const absPos = graph.getAbsolutePosition(nodeId)
      const parentAbs = graph.getAbsolutePosition(parentId)
      graph.updateNode(nodeId, { x: absPos.x - parentAbs.x, y: absPos.y - parentAbs.y })
    }

    graph.reorderChild(nodeId, parentId, insertIndex)
    computeLayout(graph, parentId)
    runLayoutForNode(parentId)
    requestRender()
  }

  function reparentNodes(nodeIds: string[], newParentId: string) {
    for (const id of nodeIds) {
      graph.reparentNode(id, newParentId)
    }
    requestRender()
  }

  function startTextEditing(nodeId: string) {
    state.editingTextId = nodeId
  }

  function commitTextEdit(nodeId: string, text: string) {
    graph.updateNode(nodeId, { text })
    state.editingTextId = null
    requestRender()
  }

  async function openFigFile(file: File) {
    try {
      const imported = await readFigFile(file)
      graph = imported
      computeAllLayouts(graph)
      undo.clear()
      state.selectedIds = new Set()
      state.panX = 0
      state.panY = 0
      state.zoom = 1
      requestRender()
    } catch (e) {
      console.error('Failed to open .fig file:', e)
    }
  }

  function runLayoutForNode(id: string) {
    const node = graph.getNode(id)
    if (!node) return

    if (node.layoutMode !== 'NONE') {
      computeLayout(graph, id)
    }

    let parent = node.parentId ? graph.getNode(node.parentId) : undefined
    while (parent) {
      if (parent.layoutMode !== 'NONE') {
        computeLayout(graph, parent.id)
      }
      parent = parent.parentId ? graph.getNode(parent.parentId) : undefined
    }
  }

  function updateNode(id: string, changes: Partial<SceneNode>) {
    graph.updateNode(id, changes)
    runLayoutForNode(id)
    requestRender()
  }

  function setLayoutMode(id: string, mode: LayoutMode) {
    const node = graph.getNode(id)
    if (!node) return

    const updates: Partial<SceneNode> = { layoutMode: mode }
    if (mode !== 'NONE' && node.layoutMode === 'NONE') {
      updates.itemSpacing = 0
      updates.paddingTop = 0
      updates.paddingRight = 0
      updates.paddingBottom = 0
      updates.paddingLeft = 0
      updates.primaryAxisSizing = 'HUG'
      updates.counterAxisSizing = 'HUG'
      updates.primaryAxisAlign = 'MIN'
      updates.counterAxisAlign = 'MIN'
    }

    graph.updateNode(id, updates)
    if (mode !== 'NONE') computeLayout(graph, id)
    runLayoutForNode(id)
    requestRender()
  }

  function wrapInAutoLayout() {
    const nodes = selectedNodes.value
    if (nodes.length === 0) return

    // Find common parent
    const parentId = nodes[0].parentId ?? graph.rootId
    const sameParent = nodes.every((n) => (n.parentId ?? graph.rootId) === parentId)
    if (!sameParent) return

    // Compute bounding box in absolute coords
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const n of nodes) {
      const abs = graph.getAbsolutePosition(n.id)
      minX = Math.min(minX, abs.x)
      minY = Math.min(minY, abs.y)
      maxX = Math.max(maxX, abs.x + n.width)
      maxY = Math.max(maxY, abs.y + n.height)
    }

    // Position relative to parent
    const parentAbs =
      parentId === graph.rootId ? { x: 0, y: 0 } : graph.getAbsolutePosition(parentId)

    const frame = graph.createNode('FRAME', parentId, {
      name: 'Frame',
      x: minX - parentAbs.x,
      y: minY - parentAbs.y,
      width: maxX - minX,
      height: maxY - minY,
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG',
      primaryAxisAlign: 'MIN',
      counterAxisAlign: 'MIN',
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }]
    })

    // Reparent nodes into the new frame
    for (const n of nodes) {
      graph.reparentNode(n.id, frame.id)
    }

    computeLayout(graph, frame.id)
    runLayoutForNode(frame.id)
    state.selectedIds = new Set([frame.id])
    requestRender()
  }

  function createShape(
    type: NodeType,
    x: number,
    y: number,
    w: number,
    h: number,
    parentId?: string
  ): string {
    const fill = DEFAULT_FILLS[type] ?? DEFAULT_FILLS.RECTANGLE
    const node = graph.createNode(type, parentId ?? graph.rootId, {
      x,
      y,
      width: w,
      height: h,
      fills: [{ ...fill }]
    })
    requestRender()
    return node.id
  }

  function selectAll() {
    const children = graph.getChildren(graph.rootId)
    state.selectedIds = new Set(children.map((n) => n.id))
  }

  function duplicateSelected() {
    const newIds: string[] = []
    for (const id of state.selectedIds) {
      const src = graph.getNode(id)
      if (!src) continue
      const node = graph.createNode(src.type, graph.rootId, {
        ...src,
        name: src.name + ' copy',
        x: src.x + 20,
        y: src.y + 20
      })
      newIds.push(node.id)
    }
    if (newIds.length > 0) {
      state.selectedIds = new Set(newIds)
      requestRender()
    }
  }

  function writeCopyData(clipboardData: DataTransfer) {
    const nodes = selectedNodes.value
    if (nodes.length === 0) return

    const names = nodes.map((n) => n.name).join('\n')
    const internalHtml = buildOpenPencilClipboardHTML(nodes, graph)
    const figmaHtml = buildFigmaClipboardHTML(nodes, graph)

    const html = figmaHtml ? figmaHtml + internalHtml : internalHtml
    clipboardData.setData('text/html', html)
    clipboardData.setData('text/plain', names)
  }

  function pasteFromHTML(html: string) {
    const ownNodes = parseOpenPencilClipboard(html)
    if (ownNodes) {
      pasteOpenPencilNodes(ownNodes)
      return
    }

    parseFigmaClipboard(html).then((figma) => {
      if (figma) {
        const created = importClipboardNodes(figma.nodes, graph, graph.rootId, 20, 20)
        if (created.length > 0) {
          state.selectedIds = new Set(created)
          requestRender()
        }
      }
    })
  }

  function pasteOpenPencilNodes(
    nodes: Array<SceneNode & { children?: SceneNode[] }>,
    parentId?: string
  ) {
    const target = parentId ?? graph.rootId
    const newIds: string[] = []

    function createTree(src: SceneNode & { children?: SceneNode[] }, pid: string, isTop: boolean) {
      const node = graph.createNode(src.type, pid, {
        ...src,
        x: src.x + (isTop ? 20 : 0),
        y: src.y + (isTop ? 20 : 0)
      })
      if (isTop) newIds.push(node.id)
      if (src.children) {
        for (const child of src.children) {
          createTree(child, node.id, false)
        }
      }
    }

    for (const src of nodes) {
      createTree(src, target, true)
    }
    if (newIds.length > 0) {
      state.selectedIds = new Set(newIds)
      requestRender()
    }
  }

  function deleteSelected() {
    undo.beginBatch('Delete')
    for (const id of state.selectedIds) {
      const node = graph.getNode(id)
      if (!node) continue
      const snapshot = { ...node }
      const parentId = node.parentId ?? graph.rootId
      undo.apply({
        label: 'Delete',
        forward: () => graph.deleteNode(id),
        inverse: () => {
          graph.createNode(snapshot.type, parentId, snapshot)
        }
      })
    }
    undo.commitBatch()
    clearSelection()
    requestRender()
  }

  function commitMove(originals: Map<string, { x: number; y: number }>) {
    const finals = new Map<string, { x: number; y: number }>()
    for (const [id] of originals) {
      const n = graph.getNode(id)
      if (n) finals.set(id, { x: n.x, y: n.y })
    }
    undo.apply({
      label: 'Move',
      forward: () => {
        for (const [id, pos] of finals) graph.updateNode(id, pos)
      },
      inverse: () => {
        for (const [id, pos] of originals) graph.updateNode(id, pos)
      }
    })
  }

  function undoAction() {
    undo.undo()
    requestRender()
  }

  function redoAction() {
    undo.redo()
    requestRender()
  }

  function screenToCanvas(sx: number, sy: number) {
    return {
      x: (sx - state.panX) / state.zoom,
      y: (sy - state.panY) / state.zoom
    }
  }

  function applyZoom(delta: number, centerX: number, centerY: number) {
    const factor = Math.pow(0.99, delta)
    const newZoom = Math.max(0.02, Math.min(256, state.zoom * factor))
    state.panX = centerX - (centerX - state.panX) * (newZoom / state.zoom)
    state.panY = centerY - (centerY - state.panY) * (newZoom / state.zoom)
    state.zoom = newZoom
    requestRender()
  }

  function pan(dx: number, dy: number) {
    state.panX += dx
    state.panY += dy
    requestRender()
  }

  function zoomToFit() {
    const nodes = graph.getChildren(graph.rootId)
    if (nodes.length === 0) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const n of nodes) {
      minX = Math.min(minX, n.x)
      minY = Math.min(minY, n.y)
      maxX = Math.max(maxX, n.x + n.width)
      maxY = Math.max(maxY, n.y + n.height)
    }

    const padding = 80
    const w = maxX - minX + padding * 2
    const h = maxY - minY + padding * 2

    // Will be set by canvas composable
    const viewW = 800
    const viewH = 600
    const zoom = Math.min(viewW / w, viewH / h, 1)

    state.zoom = zoom
    state.panX = (viewW - w * zoom) / 2 - minX * zoom + padding * zoom
    state.panY = (viewH - h * zoom) / 2 - minY * zoom + padding * zoom
    requestRender()
  }

  return {
    get graph() {
      return graph
    },
    undo,
    state,
    selectedNodes,
    selectedNode,
    layerTree,
    requestRender,
    setTool,
    select,
    clearSelection,
    selectAll,
    setMarquee,
    setSnapGuides,
    setRotationPreview,
    setDropTarget,
    setLayoutInsertIndicator,
    reorderInAutoLayout,
    reparentNodes,
    startTextEditing,
    commitTextEdit,
    openFigFile,
    updateNode,
    setLayoutMode,
    wrapInAutoLayout,
    createShape,
    duplicateSelected,
    writeCopyData,
    pasteFromHTML,
    deleteSelected,
    commitMove,
    undoAction,
    redoAction,
    screenToCanvas,
    applyZoom,
    pan,
    zoomToFit
  }
}

export type EditorStore = ReturnType<typeof createEditorStore>

const storeRef = shallowRef<EditorStore>()

export function provideEditorStore(): EditorStore {
  const store = createEditorStore()
  storeRef.value = store
  return store
}

export function useEditorStore(): EditorStore {
  if (!storeRef.value) throw new Error('Editor store not provided')
  return storeRef.value
}
