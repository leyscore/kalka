import type { SceneNode, VectorNetwork, VectorSegment, VectorVertex } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import { BLACK } from '#core/constants'
import type { EditorContext } from '#core/editor/types'
import { computeAccurateBounds, fitCubics } from '#core/vector'

/** How far, in screen pixels, the smoothed stroke may stray from the pointer's path. */
const PENCIL_TOLERANCE_PX = 1.5

const PENCIL_DEFAULT_STROKE: SceneNode['strokes'][number] = {
  type: 'SOLID',
  color: BLACK,
  weight: 2,
  opacity: 1,
  visible: true,
  align: 'CENTER',
  cap: 'ROUND',
  join: 'ROUND'
}

type CreateShape = (
  type: 'VECTOR',
  x: number,
  y: number,
  w: number,
  h: number,
  parentId?: string,
  name?: string,
  extra?: Partial<SceneNode>
) => string

/** The pointer's path as a smooth open vector network, page-absolute. */
export function pencilNetwork(points: readonly Vector[], tolerance: number): VectorNetwork | null {
  const curves = fitCubics(points, { tolerance })
  if (curves.length === 0) return null
  const vertices: VectorVertex[] = [{ x: curves[0].p0.x, y: curves[0].p0.y }]
  const segments: VectorSegment[] = curves.map((curve, i) => {
    vertices.push(
      i < curves.length - 1
        ? { x: curve.p3.x, y: curve.p3.y, handleMirroring: 'ANGLE' }
        : { x: curve.p3.x, y: curve.p3.y }
    )
    return {
      start: i,
      end: i + 1,
      tangentStart: { x: curve.cp1.x - curve.p0.x, y: curve.cp1.y - curve.p0.y },
      tangentEnd: { x: curve.cp2.x - curve.p3.x, y: curve.cp2.y - curve.p3.y }
    }
  })
  return { vertices, segments, regions: [] }
}

/**
 * Figma Draw's Pencil (Shift+P): a freehand stroke, smoothed into a few curves when the pointer
 * lifts. The points live in the editor state while drawing so every canvas can show them.
 */
export function createPencilActions(ctx: EditorContext, createShape: CreateShape) {
  function pencilBegin(x: number, y: number) {
    ctx.state.pencilStroke = [{ x, y }]
    ctx.requestRepaint()
  }

  function pencilExtend(x: number, y: number) {
    const stroke = ctx.state.pencilStroke
    if (!stroke) return
    const last = stroke[stroke.length - 1]
    // Below a screen pixel the pointer adds nothing but noise.
    if (Math.hypot(x - last.x, y - last.y) * ctx.state.zoom < 1) return
    ctx.state.pencilStroke = [...stroke, { x, y }]
    ctx.requestRepaint()
  }

  function pencilCancel() {
    ctx.state.pencilStroke = null
    ctx.requestRepaint()
  }

  /** Turns the stroke into a vector layer and selects it; null for a click without a stroke. */
  function pencilCommit(): string | null {
    const stroke = ctx.state.pencilStroke
    ctx.state.pencilStroke = null
    const network = stroke ? pencilNetwork(stroke, PENCIL_TOLERANCE_PX / ctx.state.zoom) : null
    if (!network) {
      ctx.requestRepaint()
      return null
    }
    const bounds = computeAccurateBounds(network)
    const vectorNetwork: VectorNetwork = {
      ...network,
      vertices: network.vertices.map((v) => ({ ...v, x: v.x - bounds.x, y: v.y - bounds.y }))
    }
    const id = createShape(
      'VECTOR',
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      undefined,
      undefined,
      { vectorNetwork, fills: [], strokes: [{ ...PENCIL_DEFAULT_STROKE }] }
    )
    ctx.setSelectedIds(new Set([id]))
    ctx.requestRender()
    return id
  }

  return { pencilBegin, pencilExtend, pencilCancel, pencilCommit }
}
