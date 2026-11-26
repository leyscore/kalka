import { computed, type ComputedRef } from 'vue'

import type { Editor } from '@kalka/core/editor'
import { cloneVectorNetwork } from '@kalka/scene-graph'
import type { SceneNode, StrokeCap } from '@kalka/scene-graph'
import {
  isArrowCap,
  lineEndCaps,
  lineEndNetwork,
  openPathEnds,
  type LineEndCaps
} from '@kalka/scene-graph/arrow-caps'

import { MIXED, type MixedValue } from '#vue/controls/node-props/use'

/** What a line or an open path can end with on one side, as Figma's Start point and End point. */
export type EndPointCap = 'NONE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL'
export type EndPointSide = keyof LineEndCaps

export const END_POINT_CAPS: EndPointCap[] = ['NONE', 'ARROW_LINES', 'ARROW_EQUILATERAL']

export function isEndPointCap(value: string): value is EndPointCap {
  return (END_POINT_CAPS as string[]).includes(value)
}

type EndNode = Pick<
  SceneNode,
  'type' | 'width' | 'height' | 'strokeCap' | 'strokes' | 'vectorNetwork'
>

/** A line, or a vector drawn as one open run, has a start and an end to cap. */
export function hasEndPoints(node: EndNode): boolean {
  if (node.type === 'LINE') return true
  return node.type === 'VECTOR' && !!node.vectorNetwork && openPathEnds(node.vectorNetwork) !== null
}

/** The cap the shaft of a line keeps: round or square ends apply where no arrow sits. */
function shaftCap(node: EndNode): StrokeCap {
  const cap = node.strokes.find((stroke) => stroke.visible)?.cap ?? node.strokeCap
  return isArrowCap(cap) ? 'NONE' : cap
}

/** What each end of a layer shows in the Start point and End point pickers. */
export function endPointCaps(node: EndNode): Record<EndPointSide, EndPointCap> {
  const cap = node.strokes.find((stroke) => stroke.visible)?.cap ?? node.strokeCap
  const { start, end } = lineEndCaps(cap, node.vectorNetwork)
  return { start: isArrowCap(start) ? start : 'NONE', end: isArrowCap(end) ? end : 'NONE' }
}

/**
 * The fields that give a line or an open path these caps at its ends, over a shaft that ends
 * `shaft` (butt, round or square) where no arrow sits. The same arrow at both ends of a butt
 * shaft is the layer's own cap; other arrows are kept on the network's end vertices, as Figma
 * keeps an arrow with one head.
 */
export function endPointChanges(
  node: EndNode,
  caps: Record<EndPointSide, EndPointCap>,
  shaft: StrokeCap = shaftCap(node)
): Partial<SceneNode> | null {
  const network = node.vectorNetwork
  const ends = network ? openPathEnds(network) : null
  if (node.type !== 'LINE' && !ends) return null
  const cap: StrokeCap =
    caps.start === caps.end && isArrowCap(caps.start) && shaft === 'NONE' ? caps.start : shaft
  const vertexCap = (value: EndPointCap) => (isArrowCap(value) && value !== cap ? value : undefined)
  const changes: Partial<SceneNode> = {
    strokeCap: cap,
    strokes: node.strokes.map((stroke) => ({ ...stroke, cap }))
  }
  const start = vertexCap(caps.start)
  const end = vertexCap(caps.end)
  if (node.type === 'LINE') {
    changes.vectorNetwork =
      start || end ? lineEndNetwork(node.width, node.height, { start, end }) : null
    return changes
  }
  if (!network || !ends) return null
  const next = cloneVectorNetwork(network)
  ends.forEach((index, order) => {
    const value = order === 0 ? start : end
    if (value) next.vertices[index].strokeCap = value
    else delete next.vertices[index].strokeCap
  })
  changes.vectorNetwork = next
  return changes
}

/** Start point and End point for the selection, and the action that sets one of them. */
export function createEndPointControls(editor: Editor, nodes: ComputedRef<SceneNode[]>) {
  const hasEnds = computed(() => nodes.value.length > 0 && nodes.value.every(hasEndPoints))

  function merged(side: EndPointSide): MixedValue<EndPointCap> {
    const values = nodes.value.map((node) => endPointCaps(node)[side])
    const first = values.at(0) ?? 'NONE'
    return values.every((value) => value === first) ? first : MIXED
  }

  const startCap = computed(() => merged('start'))
  const endCap = computed(() => merged('end'))

  function setEndPoint(side: EndPointSide, value: EndPointCap) {
    const label = side === 'start' ? 'Change start point' : 'Change end point'
    editor.undo.runBatch(label, () => {
      for (const node of nodes.value) {
        const caps = { ...endPointCaps(node), [side]: value }
        const changes = endPointChanges(node, caps)
        if (changes) editor.updateNodeWithUndo(node.id, changes, label)
      }
    })
  }

  const shaft = computed<MixedValue<StrokeCap>>(() => {
    const values = nodes.value.map(shaftCap)
    const first = values.at(0) ?? 'NONE'
    return values.every((value) => value === first) ? first : MIXED
  })

  /** Butt, round or square ends where no arrow sits, keeping the arrows. */
  function setShaftCap(value: StrokeCap) {
    editor.undo.runBatch('Change stroke cap', () => {
      for (const node of nodes.value) {
        const changes = endPointChanges(node, endPointCaps(node), value)
        if (changes) editor.updateNodeWithUndo(node.id, changes, 'Change stroke cap')
      }
    })
  }

  return { hasEndPoints: hasEnds, startCap, endCap, shaftCap: shaft, setEndPoint, setShaftCap }
}
