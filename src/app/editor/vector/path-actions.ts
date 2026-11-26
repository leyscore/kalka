import type { Editor } from '@kalka/core/editor'
import {
  healVertices,
  joinVertices,
  reversePathDirection,
  simplifyVectorNetwork
} from '@kalka/core/vector'
import type { VectorNetwork } from '@kalka/scene-graph'

import { pushNodeEditHistory } from './history'
import { getLiveNetwork, setNodeEditNetwork } from './network'
import type { VectorEditState } from './types'

/**
 * Figma's Vector menu inside the path being edited: Join selection, Smooth join selection and
 * Delete and heal selection act on the chosen points; Simplify and Reverse path direction on the
 * whole path. Each is one step of the edit session's undo.
 */
export function createVectorEditPathActions(editor: Editor, state: VectorEditState) {
  function apply(next: VectorNetwork | null, selected: number[] = []): boolean {
    const es = state.nodeEditState
    if (!es || !next) return false
    pushNodeEditHistory(es)
    setNodeEditNetwork(es, next)
    es.selectedVertexIndices = new Set(selected)
    es.selectedHandles = new Set()
    editor.requestRender()
    return true
  }

  function nodeEditJoinSelected(smooth: boolean): boolean {
    const es = state.nodeEditState
    if (!es || es.selectedVertexIndices.size < 2) return false
    const joined = joinVertices(getLiveNetwork(es), [...es.selectedVertexIndices], { smooth })
    return apply(joined?.network ?? null, joined?.vertices)
  }

  function nodeEditHealSelected(): boolean {
    const es = state.nodeEditState
    if (!es || es.selectedVertexIndices.size === 0) return false
    return apply(healVertices(getLiveNetwork(es), [...es.selectedVertexIndices]))
  }

  function nodeEditSimplify(): boolean {
    const es = state.nodeEditState
    if (!es) return false
    const live = getLiveNetwork(es)
    const next = simplifyVectorNetwork(live)
    return next === live ? false : apply(next)
  }

  function nodeEditReversePath(): boolean {
    const es = state.nodeEditState
    if (!es) return false
    const selected = [...es.selectedVertexIndices]
    return apply(reversePathDirection(getLiveNetwork(es)), selected)
  }

  return { nodeEditJoinSelected, nodeEditHealSelected, nodeEditSimplify, nodeEditReversePath }
}
