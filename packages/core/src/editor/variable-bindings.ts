import {
  cloneInstanceOverrideState,
  findInstanceAncestor,
  variableBindingOwner,
  isNumericVariableBindingField,
  type SceneNode
} from '@kalka/scene-graph'

import { reconcileVariableLayouts } from '#core/layout/variables'

import type { EditorContext } from './types'
import { loadBoundFontFamilies } from './variable-fonts'

/**
 * The values a binding at `path` writes into, which undo gives back: the field it resolves into,
 * such as `fills` for `fills/0/color`, and a numeric field bound whole.
 */
function boundFieldValues(node: SceneNode, path: string): Partial<SceneNode> {
  const values: Record<string, unknown> = {}
  const field = path.split('/')[0]
  if (field in node) values[field] = structuredClone(node[field as keyof SceneNode])
  if (isNumericVariableBindingField(path)) values[path] = node[path as keyof SceneNode]
  return values
}

export function createVariableBindingActions(ctx: EditorContext) {
  /** A binding change reaches only the layer it is on and the layers inside it. */
  function refreshBindings(nodeId: string) {
    loadBoundFontFamilies(ctx, reconcileVariableLayouts(ctx.graph, { subtrees: [nodeId] }))
    ctx.requestRender()
  }

  function changeBinding(nodeId: string, path: string, variableId?: string) {
    const node = ctx.graph.getNode(nodeId)
    if (!node || (variableId === undefined && !(path in node.boundVariables))) return
    const previous = {
      ...boundFieldValues(node, path),
      boundVariables: { ...node.boundVariables },
      variableBindingScales: { ...node.variableBindingScales }
    }
    const owner = variableBindingOwner(ctx.graph, node)
    const nearest = findInstanceAncestor(ctx.graph, nodeId)
    const owners = new Map(
      [owner, ...(nearest ? [nearest] : [])].map(
        (item) => [item.id, cloneInstanceOverrideState(item.instanceOverrides)] as const
      )
    )
    const apply = () => {
      if (variableId === undefined) ctx.graph.unbindVariable(nodeId, path)
      else ctx.graph.bindVariable(nodeId, path, variableId)
      refreshBindings(nodeId)
    }
    apply()
    ctx.undo.push({
      label: variableId === undefined ? 'Unbind variable' : 'Bind variable',
      forward: () => {
        try {
          apply()
        } catch (error) {
          console.warn(
            'Redo variable binding failed:',
            error instanceof Error ? error.message : String(error)
          )
        }
      },
      inverse: () => {
        for (const [id, state] of owners) {
          ctx.graph.updateNode(id, { instanceOverrides: cloneInstanceOverrideState(state) })
        }
        const restored = structuredClone(previous)
        restored.boundVariables = Object.fromEntries(
          Object.entries(restored.boundVariables).filter(([, id]) => ctx.graph.variables.has(id))
        )
        restored.variableBindingScales = Object.fromEntries(
          Object.entries(restored.variableBindingScales).filter(
            ([field]) => field in restored.boundVariables
          )
        )
        ctx.graph.updateNode(nodeId, restored)
        refreshBindings(nodeId)
      }
    })
  }

  return {
    bindVariable: (nodeId: string, path: string, variableId: string) =>
      changeBinding(nodeId, path, variableId),
    unbindVariable: (nodeId: string, path: string) => changeBinding(nodeId, path)
  }
}
