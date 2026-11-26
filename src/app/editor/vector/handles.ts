import type { VectorSegment, VectorVertex } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { HandleInfo, NodeEditState } from './types'

function handleBaseVector(tangent: Vector, neighbor: Vector, origin: Vector): Vector {
  return Math.hypot(tangent.x, tangent.y) > 1e-6
    ? tangent
    : { x: neighbor.x - origin.x, y: neighbor.y - origin.y }
}

function findSisterHandle(
  es: NodeEditState,
  siblings: HandleInfo[],
  activeBase: Vector,
  vertexIndex: number
): HandleInfo {
  let sister = siblings[0]
  const activeBaseLen = Math.hypot(activeBase.x, activeBase.y)
  if (activeBaseLen <= 1e-6) return sister

  const activeDir = { x: activeBase.x / activeBaseLen, y: activeBase.y / activeBaseLen }
  let bestDot = Infinity
  for (const s of siblings) {
    const sSeg = es.segments[s.segmentIndex]
    const sVertex = es.vertices[vertexIndex]
    const sNeighbor = es.vertices[s.neighborIndex]
    const sBase = handleBaseVector(sSeg[s.tangentField], sNeighbor, sVertex)
    const sLen = Math.hypot(sBase.x, sBase.y)
    if (sLen < 1e-6) continue
    const sDir = { x: sBase.x / sLen, y: sBase.y / sLen }
    const dot = activeDir.x * sDir.x + activeDir.y * sDir.y
    if (dot < bestDot) {
      bestDot = dot
      sister = s
    }
  }
  return sister
}

export function constrainContinuousTangent(
  es: NodeEditState,
  newTangent: Vector,
  active: HandleInfo,
  all: HandleInfo[],
  seg: VectorSegment,
  tangentField: 'tangentStart' | 'tangentEnd',
  vertexIndex: number,
  vertex: VectorVertex
): Vector | null {
  const siblings = all.filter(
    (h) => !(h.segmentIndex === active.segmentIndex && h.tangentField === active.tangentField)
  )
  if (siblings.length === 0) return null

  const activeNeighbor = es.vertices[active.neighborIndex]
  const activeBase = handleBaseVector(seg[tangentField], activeNeighbor, vertex)
  const sister = findSisterHandle(es, siblings, activeBase, vertexIndex)

  const sisterSeg = es.segments[sister.segmentIndex]
  const sisterNeighbor = es.vertices[sister.neighborIndex]
  const sisterBase = handleBaseVector(sisterSeg[sister.tangentField], sisterNeighbor, vertex)
  const sisterLen = Math.hypot(sisterBase.x, sisterBase.y)
  if (sisterLen <= 1e-6) return null

  const desiredDir = { x: -sisterBase.x / sisterLen, y: -sisterBase.y / sisterLen }
  const len = Math.max(0, newTangent.x * desiredDir.x + newTangent.y * desiredDir.y)
  vertex.handleMirroring = 'ANGLE'
  return { x: desiredDir.x * len, y: desiredDir.y * len }
}

/** How far a new smooth handle reaches, as a share of the distance to its neighbours. */
const SMOOTH_HANDLE_SHARE = 1 / 3

/**
 * The tangents that make a sharp vertex smooth, as Figma does when a point is double-clicked: on
 * a vertex between two others both handles lie along the line joining its neighbours, mirrored
 * in angle and length; at an end of the path or a junction each handle points at its neighbour.
 */
export function smoothVertexTangents(
  vertices: readonly Vector[],
  vertexIndex: number,
  handles: readonly HandleInfo[]
): { tangents: Vector[]; mirroring: VectorVertex['handleMirroring'] } {
  const origin = vertices[vertexIndex]
  const toward = (neighborIndex: number) => ({
    x: vertices[neighborIndex].x - origin.x,
    y: vertices[neighborIndex].y - origin.y
  })
  const alongNeighbor = (handle: HandleInfo) => {
    const offset = toward(handle.neighborIndex)
    return { x: offset.x * SMOOTH_HANDLE_SHARE, y: offset.y * SMOOTH_HANDLE_SHARE }
  }
  if (handles.length !== 2) return { tangents: handles.map(alongNeighbor), mirroring: 'NONE' }

  const a = toward(handles[0].neighborIndex)
  const b = toward(handles[1].neighborIndex)
  const lengthA = Math.hypot(a.x, a.y)
  const lengthB = Math.hypot(b.x, b.y)
  // The direction from the first neighbour to the second; for a hairpin, square to the arm.
  let direction = { x: b.x - a.x, y: b.y - a.y }
  if (Math.hypot(direction.x, direction.y) < 1e-6) direction = { x: -a.y, y: a.x }
  const directionLength = Math.hypot(direction.x, direction.y)
  if (directionLength < 1e-6) return { tangents: handles.map(alongNeighbor), mirroring: 'NONE' }
  const length = ((lengthA + lengthB) / 2) * SMOOTH_HANDLE_SHARE
  const unit = { x: direction.x / directionLength, y: direction.y / directionLength }
  return {
    tangents: [
      { x: -unit.x * length, y: -unit.y * length },
      { x: unit.x * length, y: unit.y * length }
    ],
    mirroring: 'ANGLE_AND_LENGTH'
  }
}
