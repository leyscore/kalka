import {
  PARENT_OUTLINE_ALPHA,
  PEN_CLOSE_RADIUS_BOOST,
  PEN_HANDLE_RADIUS,
  PEN_PATH_STROKE_WIDTH,
  PEN_VERTEX_RADIUS,
  SELECTION_COLOR
} from '@open-pencil/core/constants'
import { vectorHandleId, vectorHandleParts } from '@open-pencil/core/vector'
import type { Color, Vector } from '@open-pencil/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape, type Paint } from '#vue/canvas/svg-overlay/shapes'

type NodeEditState = NonNullable<OverlayContext['overlays']['nodeEditState']>
type PenState = NonNullable<OverlayContext['overlays']['penState']>
type Segment = PenState['segments'][number]
type TangentField = 'tangentStart' | 'tangentEnd'
type ToScreen = (x: number, y: number) => Vector

const rgb = (r: number, g: number, b: number): Color => ({ r, g, b, a: 1 })

const WHITE = css(rgb(1, 1, 1))
/** rgb(47,91,234), Kalka blue. */
const BLUE = css(rgb(0.184, 0.357, 0.918))
/** rgb(107,141,242), a hovered handle. */
const LIGHT_BLUE = css(rgb(0.42, 0.553, 0.949))
const HANDLE_LINE_GRAY = css(rgb(0.6, 0.6, 0.6))
/** rgb(178,178,178), the thin outline drawn over a path being edited or drawn. */
const TECH_GRAY = css(rgb(0.698, 0.698, 0.698))
const BLACK = css(rgb(0, 0, 0))

function screenMapper(context: OverlayContext): ToScreen {
  const { panX, panY, zoom } = context.view
  return (x, y) => ({ x: x * zoom + panX, y: y * zoom + panY })
}

const isZero = (v: Vector) => v.x === 0 && v.y === 0
const isLine = (seg: Segment) => isZero(seg.tangentStart) && isZero(seg.tangentEnd)

// ------------------------------------------------------------------ path data

/** Builds an SVG `d` in screen pixels from points in canvas space. */
class PathData {
  private parts: string[] = []
  constructor(private toScreen: ToScreen) {}

  moveTo(x: number, y: number) {
    const p = this.toScreen(x, y)
    this.parts.push(`M${p.x} ${p.y}`)
  }

  lineTo(x: number, y: number) {
    const p = this.toScreen(x, y)
    this.parts.push(`L${p.x} ${p.y}`)
  }

  cubicTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    const a = this.toScreen(x1, y1)
    const b = this.toScreen(x2, y2)
    const p = this.toScreen(x, y)
    this.parts.push(`C${a.x} ${a.y} ${b.x} ${b.y} ${p.x} ${p.y}`)
  }

  close() {
    this.parts.push('Z')
  }

  get d(): string {
    return this.parts.join('')
  }
}

function addSegmentDirected(path: PathData, seg: Segment, vertices: Vector[], forward: boolean) {
  const p0 = forward ? vertices[seg.start] : vertices[seg.end]
  const p3 = forward ? vertices[seg.end] : vertices[seg.start]
  const { tangentStart: ts, tangentEnd: te } = seg
  if (isLine(seg)) path.lineTo(p3.x, p3.y)
  else if (forward) path.cubicTo(p0.x + ts.x, p0.y + ts.y, p3.x + te.x, p3.y + te.y, p3.x, p3.y)
  else path.cubicTo(p0.x + te.x, p0.y + te.y, p3.x + ts.x, p3.y + ts.y, p3.x, p3.y)
}

function addLoop(path: PathData, loop: number[], segments: Segment[], vertices: Vector[]) {
  if (loop.length === 0) return
  const first = segments[loop[0]]
  let current = first.start
  if (loop.length > 1) {
    const second = segments[loop[1]]
    current = first.end === second.start || first.end === second.end ? first.start : first.end
  }
  path.moveTo(vertices[current].x, vertices[current].y)
  for (const index of loop) {
    const seg = segments[index]
    const forward = seg.start === current
    addSegmentDirected(path, seg, vertices, forward)
    current = forward ? seg.end : seg.start
  }
  path.close()
}

/** Chains of connected segments, walked from loose ends, as the core path builder does. */
function buildChains(segments: Segment[]): number[][] {
  if (segments.length === 0) return []
  const adjacent = new Map<number, number[]>()
  segments.forEach((seg, i) => {
    adjacent.set(seg.start, [...(adjacent.get(seg.start) ?? []), i])
    adjacent.set(seg.end, [...(adjacent.get(seg.end) ?? []), i])
  })
  const visited = new Set<number>()
  const ends = [...adjacent.entries()].filter(([, list]) => list.length === 1).map(([v]) => v)
  const chains: number[][] = []
  for (const start of ends.length > 0 ? ends : [segments[0].start]) {
    let current = start
    const chain: number[] = []
    for (;;) {
      const next = adjacent.get(current)?.find((i) => !visited.has(i))
      if (next === undefined) break
      visited.add(next)
      chain.push(next)
      const seg = segments[next]
      current = seg.start === current ? seg.end : seg.start
    }
    if (chain.length > 0) chains.push(chain)
  }
  return chains
}

function chainStart(chain: number[], segments: Segment[]): number {
  const first = segments[chain[0]]
  if (chain.length < 2) return first.start
  const second = segments[chain[1]]
  return first.start === second.start || first.start === second.end ? first.end : first.start
}

function addOpenSegments(path: PathData, segments: Segment[], vertices: Vector[]) {
  const visited = new Set<number>()
  for (const chain of buildChains(segments)) {
    let current = chainStart(chain, segments)
    path.moveTo(vertices[current].x, vertices[current].y)
    for (const index of chain) {
      visited.add(index)
      const seg = segments[index]
      const forward = seg.start === current
      addSegmentDirected(path, seg, vertices, forward)
      current = forward ? seg.end : seg.start
    }
  }
  segments.forEach((seg, i) => {
    if (visited.has(i)) return
    path.moveTo(vertices[seg.start].x, vertices[seg.start].y)
    addSegmentDirected(path, seg, vertices, true)
  })
}

/** A vector network as SVG path data in screen pixels: region loops closed, the rest open. */
export function vectorNetworkPathData(
  state: Pick<NodeEditState, 'vertices' | 'segments' | 'regions'>,
  toScreen: ToScreen
): string {
  const { vertices, segments, regions } = state
  const path = new PathData(toScreen)
  if (regions.length === 0) {
    addOpenSegments(path, segments, vertices)
    return path.d
  }
  const inRegion = new Set<number>()
  for (const region of regions)
    for (const loop of region.loops) {
      for (const index of loop) inRegion.add(index)
      addLoop(path, loop, segments, vertices)
    }
  addOpenSegments(
    path,
    segments.filter((_, i) => !inRegion.has(i)),
    vertices
  )
  return path.d
}

// ------------------------------------------------------------------ node edit

/** Vertices whose tangent handles show: the selected ones, owners of selected handles, and their neighbours. */
export function handleVisibleVertices(
  selectedVertexIndices: ReadonlySet<number>,
  selectedHandles: ReadonlySet<number>,
  segments: readonly Segment[]
): Set<number> {
  const seed = new Set(selectedVertexIndices)
  for (const id of selectedHandles) {
    const handle = vectorHandleParts(id)
    if (!handle || handle.segmentIndex >= segments.length) continue
    const seg = segments[handle.segmentIndex]
    seed.add(handle.tangentField === 'tangentStart' ? seg.start : seg.end)
  }
  const visible = new Set(seed)
  for (const seg of segments) {
    if (seed.has(seg.start)) visible.add(seg.end)
    if (seed.has(seg.end)) visible.add(seg.start)
  }
  return visible
}

function circle(p: Vector, r: number, paint: Paint): OverlayShape {
  return { type: 'ellipse', cx: p.x, cy: p.y, rx: r, ry: r, ...paint }
}

/** A handle diamond; the outline goes under the fill so only its outer half shows, as in Skia. */
function diamond(p: Vector, fill: string, stroke: string, strokeWidth: number): OverlayShape[] {
  const s = PEN_HANDLE_RADIUS
  const points = [p.x, p.y - s, p.x + s, p.y, p.x, p.y + s, p.x - s, p.y]
  return [
    { type: 'polygon', points, stroke, strokeWidth },
    { type: 'polygon', points, fill }
  ]
}

function editHandle(
  state: NodeEditState,
  segmentIndex: number,
  field: TangentField,
  visible: ReadonlySet<number>,
  toScreen: ToScreen
): OverlayShape[] {
  const seg = state.segments[segmentIndex]
  const vertexIndex = field === 'tangentStart' ? seg.start : seg.end
  if (!visible.has(vertexIndex)) return []
  const tangent = seg[field]
  if (isZero(tangent)) return []
  const selected = state.selectedHandles?.has(vectorHandleId(segmentIndex, field)) ?? false
  const hovered = state.hoveredHandleInfo
  const isHovered =
    !selected && hovered?.segmentIndex === segmentIndex && hovered.tangentField === field
  const vertex = state.vertices[vertexIndex]
  const anchor = toScreen(vertex.x, vertex.y)
  const cp = toScreen(vertex.x + tangent.x, vertex.y + tangent.y)
  let lineColor = HANDLE_LINE_GRAY
  if (selected) lineColor = BLUE
  else if (isHovered) lineColor = LIGHT_BLUE
  const line: OverlayShape = {
    type: 'line',
    x1: anchor.x,
    y1: anchor.y,
    x2: cp.x,
    y2: cp.y,
    stroke: lineColor,
    strokeWidth: 1
  }
  if (selected) return [line, ...diamond(cp, BLUE, WHITE, 3)]
  if (isHovered) return [line, ...diamond(cp, LIGHT_BLUE, WHITE, 3)]
  return [line, ...diamond(cp, WHITE, BLUE, 1)]
}

/**
 * The vector edit overlay: the path's thin outline, tangent handles of the vertices in play, and
 * every vertex. The Skia pass also repaints the node with its live geometry under these; that is
 * the node's own rendering and stays on the canvas.
 */
export function nodeEditLayer(context: OverlayContext): OverlayShape[] {
  const state = context.overlays.nodeEditState
  if (!state || state.vertices.length === 0) return []
  if (!context.graph.getNode(state.nodeId)) return []
  const toScreen = screenMapper(context)
  const visible = handleVisibleVertices(
    state.selectedVertexIndices,
    state.selectedHandles ?? new Set(),
    state.segments
  )
  const shapes: OverlayShape[] = [
    { type: 'path', d: vectorNetworkPathData(state, toScreen), stroke: TECH_GRAY, strokeWidth: 1 }
  ]
  state.segments.forEach((_, i) => {
    shapes.push(...editHandle(state, i, 'tangentStart', visible, toScreen))
    shapes.push(...editHandle(state, i, 'tangentEnd', visible, toScreen))
  })
  state.vertices.forEach((vertex, i) => {
    const fill = state.selectedVertexIndices.has(i) ? BLUE : WHITE
    shapes.push(
      circle(toScreen(vertex.x, vertex.y), PEN_VERTEX_RADIUS, {
        fill,
        stroke: BLUE,
        strokeWidth: 1
      })
    )
  })
  return shapes
}

// ------------------------------------------------------------------ pen

function penSegmentsPath(state: PenState, toScreen: ToScreen): string {
  const path = new PathData(toScreen)
  const { vertices } = state
  for (const seg of state.segments) {
    const s = vertices[seg.start]
    const e = vertices[seg.end]
    path.moveTo(s.x, s.y)
    if (isLine(seg)) path.lineTo(e.x, e.y)
    else
      path.cubicTo(
        s.x + seg.tangentStart.x,
        s.y + seg.tangentStart.y,
        e.x + seg.tangentEnd.x,
        e.y + seg.tangentEnd.y,
        e.x,
        e.y
      )
  }
  return path.d
}

/** The rubber band from the last vertex to the cursor, or back to the first when closing. */
function penCursorPath(state: PenState, toScreen: ToScreen): string | null {
  const { vertices, dragTangent, cursorX, cursorY } = state
  const last = vertices[vertices.length - 1]
  const path = new PathData(toScreen)
  if (state.pendingClose && vertices.length > 2) {
    const first = vertices[0]
    path.moveTo(last.x, last.y)
    if (dragTangent)
      path.cubicTo(
        last.x,
        last.y,
        first.x + dragTangent.x,
        first.y + dragTangent.y,
        first.x,
        first.y
      )
    else path.lineTo(first.x, first.y)
    return path.d
  }
  if (cursorX == null || cursorY == null) return null
  path.moveTo(last.x, last.y)
  if (dragTangent)
    path.cubicTo(last.x + dragTangent.x, last.y + dragTangent.y, cursorX, cursorY, cursorX, cursorY)
  else path.lineTo(cursorX, cursorY)
  return path.d
}

function penHandles(state: PenState, toScreen: ToScreen): OverlayShape[] {
  const stroke = css(SELECTION_COLOR, PARENT_OUTLINE_ALPHA)
  const shapes: OverlayShape[] = []
  const arm = (anchor: Vector, tangent: Vector) => {
    const a = toScreen(anchor.x, anchor.y)
    const cp = toScreen(anchor.x + tangent.x, anchor.y + tangent.y)
    shapes.push({ type: 'line', x1: a.x, y1: a.y, x2: cp.x, y2: cp.y, stroke, strokeWidth: 1 })
    shapes.push(circle(cp, PEN_HANDLE_RADIUS, { fill: WHITE, stroke, strokeWidth: 1 }))
  }
  const { vertices, dragTangent } = state
  for (const seg of state.segments) {
    if (!isZero(seg.tangentStart)) arm(vertices[seg.start], seg.tangentStart)
    if (!isZero(seg.tangentEnd)) arm(vertices[seg.end], seg.tangentEnd)
  }
  if (dragTangent) {
    // While closing, the handles belong to the first vertex; otherwise to the last.
    const anchor = state.pendingClose ? vertices[0] : vertices[vertices.length - 1]
    const opposite = state.oppositeDragTangent ?? { x: -dragTangent.x, y: -dragTangent.y }
    const a = toScreen(anchor.x, anchor.y)
    const cp1 = toScreen(anchor.x + dragTangent.x, anchor.y + dragTangent.y)
    const cp2 = toScreen(anchor.x + opposite.x, anchor.y + opposite.y)
    shapes.push({ type: 'line', x1: a.x, y1: a.y, x2: cp1.x, y2: cp1.y, stroke, strokeWidth: 1 })
    if (!isZero(opposite))
      shapes.push({ type: 'line', x1: a.x, y1: a.y, x2: cp2.x, y2: cp2.y, stroke, strokeWidth: 1 })
    shapes.push(circle(cp1, PEN_HANDLE_RADIUS, { fill: WHITE, stroke, strokeWidth: 1 }))
    shapes.push(circle(cp2, PEN_HANDLE_RADIUS, { fill: WHITE, stroke, strokeWidth: 1 }))
  }
  return shapes
}

/**
 * The pen tool: committed segments in the live 2px black stroke with the thin outline over them,
 * the rubber band to the cursor, tangent handles, and vertices, the first one enlarged when the
 * next click closes the path.
 */
export function penLayer(context: OverlayContext): OverlayShape[] {
  const state = context.overlays.penState
  if (!state || state.vertices.length === 0) return []
  const toScreen = screenMapper(context)
  const segments = penSegmentsPath(state, toScreen)
  const shapes: OverlayShape[] = []
  if (segments) {
    shapes.push({ type: 'path', d: segments, stroke: BLACK, strokeWidth: PEN_PATH_STROKE_WIDTH })
    shapes.push({ type: 'path', d: segments, stroke: TECH_GRAY, strokeWidth: 1 })
  }
  const cursor = penCursorPath(state, toScreen)
  if (cursor) shapes.push({ type: 'path', d: cursor, stroke: TECH_GRAY, strokeWidth: 1 })
  shapes.push(...penHandles(state, toScreen))
  const stroke = css(SELECTION_COLOR)
  state.vertices.forEach((vertex, i) => {
    const radius =
      i === 0 && state.closingToFirst
        ? PEN_VERTEX_RADIUS + PEN_CLOSE_RADIUS_BOOST
        : PEN_VERTEX_RADIUS
    shapes.push(
      circle(toScreen(vertex.x, vertex.y), radius, { fill: WHITE, stroke, strokeWidth: 1 })
    )
  })
  return shapes
}
