import { useEffect, useRef, useState, useCallback } from 'react'

import { getCanvasKit } from './engine/canvaskit'
import { SkiaRenderer } from './engine/renderer'
import { SceneGraph } from './engine/scene-graph'
import { UndoManager } from './engine/undo'

import type { NodeType, Fill } from './engine/scene-graph'

type Tool = 'SELECT' | 'FRAME' | 'RECTANGLE' | 'ELLIPSE' | 'LINE'

const TOOL_SHORTCUTS: Record<string, Tool> = {
  v: 'SELECT',
  f: 'FRAME',
  r: 'RECTANGLE',
  o: 'ELLIPSE',
  l: 'LINE'
}

const TOOL_COLORS: Record<string, { r: number; g: number; b: number; a: number }> = {
  FRAME: { r: 1, g: 1, b: 1, a: 1 },
  RECTANGLE: { r: 0.83, g: 0.83, b: 0.83, a: 1 },
  ELLIPSE: { r: 0.83, g: 0.83, b: 0.83, a: 1 },
  LINE: { r: 0, g: 0, b: 0, a: 1 }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const graphRef = useRef(new SceneGraph())
  const rendererRef = useRef<SkiaRenderer | null>(null)
  const undoRef = useRef(new UndoManager())
  const [activeTool, setActiveTool] = useState<Tool>('SELECT')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [nodeCount, setNodeCount] = useState(0)
  const drawingRef = useRef<{
    startX: number
    startY: number
    nodeId: string
  } | null>(null)
  const panningRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(
    null
  )
  const movingRef = useRef<{
    startX: number
    startY: number
    originals: Map<string, { x: number; y: number }>
  } | null>(null)

  const requestRender = useCallback(() => {
    const renderer = rendererRef.current
    if (!renderer) return
    renderer.render(graphRef.current, selectedIds)
  }, [selectedIds])

  // Initialize CanvasKit
  useEffect(() => {
    let destroyed = false

    async function init() {
      const canvas = canvasRef.current
      if (!canvas) return

      const ck = await getCanvasKit()
      if (destroyed) return

      // Wait for layout to settle
      await new Promise((r) => requestAnimationFrame(r))

      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      console.log(`Canvas size: ${w}x${h}, DPR: ${dpr}`)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      const surface = ck.MakeWebGLCanvasSurface(canvas)
      if (!surface) {
        console.error('Failed to create WebGL surface')
        return
      }
      console.log('WebGL surface created successfully')

      const renderer = new SkiaRenderer(ck, surface)
      rendererRef.current = renderer

      // Create some demo shapes
      const graph = graphRef.current
      graph.createNode('FRAME', graph.rootId, {
        name: 'Desktop',
        x: 100,
        y: 80,
        width: 800,
        height: 500,
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }],
        strokes: [
          {
            color: { r: 0.87, g: 0.87, b: 0.87, a: 1 },
            weight: 1,
            opacity: 1,
            visible: true,
            align: 'INSIDE'
          }
        ]
      })

      graph.createNode('RECTANGLE', graph.rootId, {
        name: 'Blue card',
        x: 150,
        y: 140,
        width: 240,
        height: 160,
        cornerRadius: 12,
        fills: [
          { type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96, a: 1 }, opacity: 1, visible: true }
        ],
        effects: [
          {
            type: 'DROP_SHADOW',
            color: { r: 0, g: 0, b: 0, a: 0.15 },
            offset: { x: 0, y: 4 },
            radius: 12,
            spread: 0,
            visible: true
          }
        ]
      })

      graph.createNode('ELLIPSE', graph.rootId, {
        name: 'Green circle',
        x: 440,
        y: 160,
        width: 120,
        height: 120,
        fills: [
          { type: 'SOLID', color: { r: 0.13, g: 0.77, b: 0.42, a: 1 }, opacity: 1, visible: true }
        ]
      })

      graph.createNode('RECTANGLE', graph.rootId, {
        name: 'Orange rect',
        x: 620,
        y: 140,
        width: 200,
        height: 100,
        cornerRadius: 8,
        fills: [
          { type: 'SOLID', color: { r: 0.96, g: 0.52, b: 0.13, a: 1 }, opacity: 1, visible: true }
        ]
      })

      graph.createNode('RECTANGLE', graph.rootId, {
        name: 'Purple pill',
        x: 150,
        y: 360,
        width: 300,
        height: 56,
        cornerRadius: 28,
        fills: [
          { type: 'SOLID', color: { r: 0.55, g: 0.36, b: 0.96, a: 1 }, opacity: 1, visible: true }
        ]
      })

      setNodeCount(graph.nodes.size - 1)
      renderer.render(graph, new Set())
    }

    init()

    return () => {
      destroyed = true
      rendererRef.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render when selection changes
  useEffect(() => {
    requestRender()
  }, [selectedIds, requestRender])

  // Handle resize
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      requestRender()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [requestRender])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return

      const tool = TOOL_SHORTCUTS[e.key.toLowerCase()]
      if (tool) {
        setActiveTool(tool)
        return
      }

      // Undo/Redo
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          undoRef.current.undo()
          requestRender()
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault()
          undoRef.current.redo()
          requestRender()
        }
      }

      // Delete
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const graph = graphRef.current
        const undo = undoRef.current
        undo.beginBatch('Delete')
        for (const id of selectedIds) {
          const node = graph.getNode(id)
          if (!node) continue
          const snapshot = { ...node }
          const parentId = node.parentId ?? graphRef.current.rootId
          undo.apply({
            label: 'Delete',
            forward: () => graph.deleteNode(id),
            inverse: () => {
              const restored = graph.createNode(snapshot.type, parentId, snapshot)
              // ID won't match, but good enough for PoC
              void restored
            }
          })
        }
        undo.commitBatch()
        setSelectedIds(new Set())
        setNodeCount(graph.nodes.size - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, requestRender])

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const renderer = rendererRef.current
    const canvas = canvasRef.current
    if (!renderer || !canvas) return

    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const { x, y } = renderer.screenToCanvas(sx, sy)

    // Space + click = pan
    if (e.button === 1 || (activeTool === 'SELECT' && e.altKey)) {
      panningRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX: renderer.panX,
        panY: renderer.panY
      }
      return
    }

    if (activeTool === 'SELECT') {
      const hit = graphRef.current.hitTest(x, y)
      if (hit) {
        const newSelected = e.shiftKey
          ? (() => {
              const s = new Set(selectedIds)
              if (s.has(hit.id)) s.delete(hit.id)
              else s.add(hit.id)
              return s
            })()
          : new Set([hit.id])
        setSelectedIds(newSelected)

        // Start moving
        const originals = new Map<string, { x: number; y: number }>()
        for (const id of newSelected) {
          const n = graphRef.current.getNode(id)
          if (n) originals.set(id, { x: n.x, y: n.y })
        }
        movingRef.current = { startX: x, startY: y, originals }
      } else {
        setSelectedIds(new Set())
      }
      return
    }

    // Shape creation tools
    const typeMap: Record<string, NodeType> = {
      FRAME: 'FRAME',
      RECTANGLE: 'RECTANGLE',
      ELLIPSE: 'ELLIPSE',
      LINE: 'LINE'
    }
    const nodeType = typeMap[activeTool]
    if (!nodeType) return

    const fill: Fill = {
      type: 'SOLID',
      color: TOOL_COLORS[activeTool] ?? { r: 0.83, g: 0.83, b: 0.83, a: 1 },
      opacity: 1,
      visible: true
    }

    const node = graphRef.current.createNode(nodeType, graphRef.current.rootId, {
      x,
      y,
      width: 0,
      height: 0,
      fills: [fill]
    })

    drawingRef.current = { startX: x, startY: y, nodeId: node.id }
    setSelectedIds(new Set([node.id]))
    setNodeCount(graphRef.current.nodes.size - 1)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const renderer = rendererRef.current
    const canvas = canvasRef.current
    if (!renderer || !canvas) return

    // Pan
    if (panningRef.current) {
      const dx = e.clientX - panningRef.current.startX
      const dy = e.clientY - panningRef.current.startY
      renderer.panX = panningRef.current.panX + dx
      renderer.panY = panningRef.current.panY + dy
      requestRender()
      return
    }

    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const { x, y } = renderer.screenToCanvas(sx, sy)

    // Move selected nodes
    if (movingRef.current) {
      const dx = x - movingRef.current.startX
      const dy = y - movingRef.current.startY
      for (const [id, orig] of movingRef.current.originals) {
        graphRef.current.updateNode(id, { x: orig.x + dx, y: orig.y + dy })
      }
      requestRender()
      return
    }

    // Draw shape
    if (drawingRef.current) {
      const { startX, startY, nodeId } = drawingRef.current
      const w = x - startX
      const h = y - startY
      graphRef.current.updateNode(nodeId, {
        x: w < 0 ? x : startX,
        y: h < 0 ? y : startY,
        width: Math.abs(w),
        height: Math.abs(h)
      })
      requestRender()
    }
  }

  function handleMouseUp() {
    // Commit move to undo stack
    if (movingRef.current) {
      const graph = graphRef.current
      const undo = undoRef.current
      const originals = movingRef.current.originals
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
      movingRef.current = null
    }

    // Commit shape drawing
    if (drawingRef.current) {
      const { nodeId } = drawingRef.current
      const node = graphRef.current.getNode(nodeId)
      if (node && node.width < 2 && node.height < 2) {
        // Too small — set default size
        graphRef.current.updateNode(nodeId, { width: 100, height: 100 })
        requestRender()
      }
      drawingRef.current = null
      setActiveTool('SELECT')
    }

    panningRef.current = null
  }

  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    const renderer = rendererRef.current
    const canvas = canvasRef.current
    if (!renderer || !canvas) return
    e.preventDefault()

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const rect = canvas.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top

      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.max(0.1, Math.min(10, renderer.zoom * zoomFactor))

      // Zoom toward cursor
      renderer.panX = sx - (sx - renderer.panX) * (newZoom / renderer.zoom)
      renderer.panY = sy - (sy - renderer.panY) * (newZoom / renderer.zoom)
      renderer.zoom = newZoom
    } else {
      // Pan
      renderer.panX -= e.deltaX
      renderer.panY -= e.deltaY
    }
    requestRender()
  }

  const tools: { key: Tool; label: string; shortcut: string }[] = [
    { key: 'SELECT', label: '▶ Select', shortcut: 'V' },
    { key: 'FRAME', label: '# Frame', shortcut: 'F' },
    { key: 'RECTANGLE', label: '□ Rect', shortcut: 'R' },
    { key: 'ELLIPSE', label: '○ Ellipse', shortcut: 'O' },
    { key: 'LINE', label: '/ Line', shortcut: 'L' }
  ]

  const selectedNode =
    selectedIds.size === 1 ? graphRef.current.getNode([...selectedIds][0]) : undefined

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1e1e1e',
        color: '#e0e0e0',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 13,
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        {/* Left panel — Layers */}
        <div
          style={{
            width: 240,
            background: '#2a2a2a',
            borderRight: '1px solid #3a3a3a',
            overflowY: 'auto',
            padding: '8px 0'
          }}
        >
          <div
            style={{
              padding: '4px 12px',
              fontSize: 11,
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Layers
          </div>
          {graphRef.current.getChildren(graphRef.current.rootId).map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedIds(new Set([node.id]))}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                background: selectedIds.has(node.id) ? '#3b82f6' : 'transparent',
                borderRadius: 4,
                margin: '1px 4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: 12 }}>
                {node.type === 'ELLIPSE' ? '○' : node.type === 'FRAME' ? '🔲' : '□'} {node.name}
              </span>
              <span style={{ fontSize: 10, color: '#888' }}>{node.id}</span>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            flex: 1,
            display: 'block',
            cursor: activeTool === 'SELECT' ? 'default' : 'crosshair',
            minWidth: 0,
            minHeight: 0
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Right panel — Properties */}
        <div
          style={{
            width: 260,
            background: '#2a2a2a',
            borderLeft: '1px solid #3a3a3a',
            overflowY: 'auto',
            padding: '8px 0'
          }}
        >
          {selectedNode ? (
            <>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #3a3a3a' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedNode.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {selectedNode.type} · {selectedNode.id}
                </div>
              </div>
              <div style={{ padding: '8px 12px' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Appearance</div>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12 }}
                >
                  <label>
                    W:{' '}
                    <input
                      type="number"
                      value={Math.round(selectedNode.width)}
                      onChange={(e) => {
                        graphRef.current.updateNode(selectedNode.id, { width: +e.target.value })
                        requestRender()
                      }}
                      style={inputStyle}
                    />
                  </label>
                  <label>
                    H:{' '}
                    <input
                      type="number"
                      value={Math.round(selectedNode.height)}
                      onChange={(e) => {
                        graphRef.current.updateNode(selectedNode.id, { height: +e.target.value })
                        requestRender()
                      }}
                      style={inputStyle}
                    />
                  </label>
                  <label>
                    X:{' '}
                    <input
                      type="number"
                      value={Math.round(selectedNode.x)}
                      onChange={(e) => {
                        graphRef.current.updateNode(selectedNode.id, { x: +e.target.value })
                        requestRender()
                      }}
                      style={inputStyle}
                    />
                  </label>
                  <label>
                    Y:{' '}
                    <input
                      type="number"
                      value={Math.round(selectedNode.y)}
                      onChange={(e) => {
                        graphRef.current.updateNode(selectedNode.id, { y: +e.target.value })
                        requestRender()
                      }}
                      style={inputStyle}
                    />
                  </label>
                  <label>
                    R:{' '}
                    <input
                      type="number"
                      value={Math.round(selectedNode.rotation)}
                      onChange={(e) => {
                        graphRef.current.updateNode(selectedNode.id, { rotation: +e.target.value })
                        requestRender()
                      }}
                      style={inputStyle}
                    />
                    °
                  </label>
                  <label>
                    ↻:{' '}
                    <input
                      type="number"
                      value={selectedNode.cornerRadius}
                      onChange={(e) => {
                        graphRef.current.updateNode(selectedNode.id, {
                          cornerRadius: +e.target.value
                        })
                        requestRender()
                      }}
                      style={inputStyle}
                    />
                  </label>
                </div>
              </div>
              <div style={{ padding: '8px 12px', borderTop: '1px solid #3a3a3a' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Fill</div>
                {selectedNode.fills.map((fill, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        background: `rgba(${fill.color.r * 255}, ${fill.color.g * 255}, ${fill.color.b * 255}, ${fill.color.a})`,
                        border: '1px solid #555'
                      }}
                    />
                    <span style={{ fontSize: 12 }}>
                      #
                      {Math.round(fill.color.r * 255)
                        .toString(16)
                        .padStart(2, '0')}
                      {Math.round(fill.color.g * 255)
                        .toString(16)
                        .padStart(2, '0')}
                      {Math.round(fill.color.b * 255)
                        .toString(16)
                        .padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 12px', borderTop: '1px solid #3a3a3a' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Opacity</div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedNode.opacity * 100}
                  onChange={(e) => {
                    graphRef.current.updateNode(selectedNode.id, { opacity: +e.target.value / 100 })
                    requestRender()
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          ) : (
            <div style={{ padding: '12px', color: '#666' }}>No selection</div>
          )}
        </div>
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          height: 48,
          background: '#2a2a2a',
          borderTop: '1px solid #3a3a3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '0 16px'
        }}
      >
        {tools.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTool(t.key)}
            title={`${t.label} (${t.shortcut})`}
            style={{
              background: activeTool === t.key ? '#3b82f6' : 'transparent',
              color: activeTool === t.key ? '#fff' : '#ccc',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
              transition: 'background 0.1s'
            }}
          >
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#666' }}>
          {nodeCount} nodes · Zoom:{' '}
          {rendererRef.current ? `${Math.round(rendererRef.current.zoom * 100)}%` : '100%'}
        </span>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: 56,
  background: '#1e1e1e',
  border: '1px solid #444',
  borderRadius: 4,
  color: '#e0e0e0',
  padding: '2px 4px',
  fontSize: 12,
  marginLeft: 4
}

export default App
