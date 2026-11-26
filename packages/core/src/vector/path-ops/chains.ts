import type { VectorNetwork } from '@kalka/scene-graph'

import type { CubicPoints } from '../curve-math'

/** A segment as a chain walks it: forward from its start to its end, or backwards. */
export interface ChainStep {
  segment: number
  forward: boolean
}

/**
 * A run of segments whose inner points each join exactly two segments: an open path between two
 * ends or junctions, or a closed loop. `vertices` has one more entry than `steps` (for a loop the
 * last repeats the first).
 */
export interface PathChain {
  steps: ChainStep[]
  vertices: number[]
  closed: boolean
}

export function vertexDegrees(network: VectorNetwork): number[] {
  const degrees = network.vertices.map(() => 0)
  for (const segment of network.segments) {
    degrees[segment.start]++
    degrees[segment.end]++
  }
  return degrees
}

function incidentSegments(network: VectorNetwork): number[][] {
  const incident: number[][] = network.vertices.map(() => [])
  network.segments.forEach((segment, index) => {
    incident[segment.start].push(index)
    if (segment.end !== segment.start) incident[segment.end].push(index)
  })
  return incident
}

/** Every segment of the network, once, grouped into chains. */
export function findChains(network: VectorNetwork): PathChain[] {
  const degrees = vertexDegrees(network)
  const incident = incidentSegments(network)
  const visited = new Set<number>()
  const chains: PathChain[] = []

  const walk = (startVertex: number, firstSegment: number): PathChain => {
    const steps: ChainStep[] = []
    const vertices = [startVertex]
    let vertex = startVertex
    let segmentIndex: number | undefined = firstSegment
    while (segmentIndex !== undefined && !visited.has(segmentIndex)) {
      visited.add(segmentIndex)
      const segment = network.segments[segmentIndex]
      const forward = segment.start === vertex
      steps.push({ segment: segmentIndex, forward })
      vertex = forward ? segment.end : segment.start
      vertices.push(vertex)
      if (degrees[vertex] !== 2 || vertex === startVertex) break
      const current: number = segmentIndex
      segmentIndex = incident[vertex].find((candidate) => candidate !== current)
    }
    return { steps, vertices, closed: vertex === startVertex && steps.length > 0 }
  }

  network.vertices.forEach((_, vertex) => {
    if (degrees[vertex] === 2) return
    for (const segment of incident[vertex]) {
      if (!visited.has(segment)) chains.push(walk(vertex, segment))
    }
  })
  // What is left are loops whose every point joins two segments.
  network.segments.forEach((segment, index) => {
    if (!visited.has(index)) chains.push(walk(segment.start, index))
  })
  return chains
}

/** A chain step's curve in absolute points, oriented the way the chain walks it. */
export function stepCurve(network: VectorNetwork, step: ChainStep): CubicPoints {
  const segment = network.segments[step.segment]
  const start = network.vertices[segment.start]
  const end = network.vertices[segment.end]
  const curve: CubicPoints = {
    p0: { x: start.x, y: start.y },
    cp1: { x: start.x + segment.tangentStart.x, y: start.y + segment.tangentStart.y },
    cp2: { x: end.x + segment.tangentEnd.x, y: end.y + segment.tangentEnd.y },
    p3: { x: end.x, y: end.y }
  }
  return step.forward ? curve : { p0: curve.p3, cp1: curve.cp2, cp2: curve.cp1, p3: curve.p0 }
}
