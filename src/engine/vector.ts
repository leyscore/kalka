import type { CanvasKit, Path } from 'canvaskit-wasm'

import type { VectorNetwork, VectorSegment, VectorVertex } from './scene-graph'

export function vectorNetworkToPath(ck: CanvasKit, network: VectorNetwork): Path {
  const path = new ck.Path()
  const { vertices, segments, regions } = network

  if (regions.length > 0) {
    for (const region of regions) {
      for (const loop of region.loops) {
        addLoopToPath(path, loop, segments, vertices)
      }
      path.setFillType(
        region.windingRule === 'EVENODD' ? ck.FillType.EvenOdd : ck.FillType.Winding
      )
    }
  } else {
    // No regions — draw all segments as open paths
    const visited = new Set<number>()
    const chains = buildChains(segments, vertices.length)

    for (const chain of chains) {
      if (chain.length === 0) continue
      const firstSeg = segments[chain[0]]
      path.moveTo(vertices[firstSeg.start].x, vertices[firstSeg.start].y)

      for (const segIdx of chain) {
        visited.add(segIdx)
        addSegmentToPath(path, segments[segIdx], vertices)
      }
    }

    // Any remaining disconnected segments
    for (let i = 0; i < segments.length; i++) {
      if (visited.has(i)) continue
      const seg = segments[i]
      path.moveTo(vertices[seg.start].x, vertices[seg.start].y)
      addSegmentToPath(path, seg, vertices)
    }
  }

  return path
}

function addLoopToPath(
  path: Path,
  loop: number[],
  segments: VectorSegment[],
  vertices: VectorVertex[]
): void {
  if (loop.length === 0) return

  const firstSeg = segments[loop[0]]
  path.moveTo(vertices[firstSeg.start].x, vertices[firstSeg.start].y)

  for (const segIdx of loop) {
    addSegmentToPath(path, segments[segIdx], vertices)
  }
  path.close()
}

function addSegmentToPath(
  path: Path,
  seg: VectorSegment,
  vertices: VectorVertex[]
): void {
  const start = vertices[seg.start]
  const end = vertices[seg.end]
  const ts = seg.tangentStart
  const te = seg.tangentEnd

  const isLine = ts.x === 0 && ts.y === 0 && te.x === 0 && te.y === 0
  if (isLine) {
    path.lineTo(end.x, end.y)
  } else {
    // Cubic bezier: control points are tangent offsets from start/end
    path.cubicTo(
      start.x + ts.x,
      start.y + ts.y,
      end.x + te.x,
      end.y + te.y,
      end.x,
      end.y
    )
  }
}

function buildChains(segments: VectorSegment[], _vertexCount: number): number[][] {
  if (segments.length === 0) return []

  // Build adjacency: for each vertex, which segments connect to it
  const adj = new Map<number, number[]>()
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    if (!adj.has(s.start)) adj.set(s.start, [])
    if (!adj.has(s.end)) adj.set(s.end, [])
    adj.get(s.start)!.push(i)
    adj.get(s.end)!.push(i)
  }

  const visited = new Set<number>()
  const chains: number[][] = []

  // Start from degree-1 vertices (endpoints) or any unvisited
  const degree1 = [...adj.entries()]
    .filter(([, segs]) => segs.length === 1)
    .map(([v]) => v)

  const startVertices = degree1.length > 0
    ? degree1
    : [segments[0].start]

  for (const startVertex of startVertices) {
    let current = startVertex
    const chain: number[] = []

    while (true) {
      const segs = adj.get(current)
      if (!segs) break

      const nextSeg = segs.find((s) => !visited.has(s))
      if (nextSeg === undefined) break

      visited.add(nextSeg)
      chain.push(nextSeg)

      const seg = segments[nextSeg]
      current = seg.start === current ? seg.end : seg.start
    }

    if (chain.length > 0) chains.push(chain)
  }

  return chains
}

export function computeVectorBounds(
  network: VectorNetwork
): { x: number; y: number; width: number; height: number } {
  if (network.vertices.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const v of network.vertices) {
    minX = Math.min(minX, v.x)
    minY = Math.min(minY, v.y)
    maxX = Math.max(maxX, v.x)
    maxY = Math.max(maxY, v.y)
  }

  // Also consider bezier control points for tighter bounds
  for (const seg of network.segments) {
    const start = network.vertices[seg.start]
    const end = network.vertices[seg.end]
    const cp1x = start.x + seg.tangentStart.x
    const cp1y = start.y + seg.tangentStart.y
    const cp2x = end.x + seg.tangentEnd.x
    const cp2y = end.y + seg.tangentEnd.y

    minX = Math.min(minX, cp1x, cp2x)
    minY = Math.min(minY, cp1y, cp2y)
    maxX = Math.max(maxX, cp1x, cp2x)
    maxY = Math.max(maxY, cp1y, cp2y)
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}
