import * as v from 'valibot'

import { sharedStyleRefKey, type SceneGraph, type SharedStyleKind } from '@kalka/scene-graph'

import { figmaClientInputs, figmaNodeIdInput } from '#core/tools/input'
import { resolveFigmaToolTarget } from '#core/tools/read/target'
import { defineTool } from '#core/tools/schema'
import {
  documentStyles,
  formatVariableValue,
  variableValuesByMode,
  type ResolvedStyle
} from '#core/tools/variables/resolved'

const STYLE_REFERENCES: readonly SharedStyleKind[] = ['fill', 'stroke', 'text', 'effect', 'grid']

interface UsedVariable {
  id: string
  name: string
  type: string
  collection: string
  /** The mode the layers that use it are in, whose value `value` is. */
  mode: string
  value: string
  valuesByMode: Record<string, string>
}

/**
 * The variables these layers and their descendants bind, each with the first layer that binds
 * it, which decides the mode it reads in, and the style IDs they reference.
 */
function collectUsage(graph: SceneGraph, rootIds: readonly string[]) {
  const variables = new Map<string, string>()
  const styles = new Set<string>()
  const stack = [...rootIds]
  for (let id = stack.pop(); id !== undefined; id = stack.pop()) {
    const node = graph.getNode(id)
    if (!node) continue
    for (const variableId of Object.values(node.boundVariables)) {
      if (!variables.has(variableId)) variables.set(variableId, node.id)
    }
    for (const kind of STYLE_REFERENCES) {
      const styleId = node[sharedStyleRefKey(kind)]
      if (styleId) styles.add(styleId)
    }
    stack.push(...node.childIds)
  }
  return { variables, styles }
}

function usedVariable(graph: SceneGraph, variableId: string, nodeId: string): UsedVariable | null {
  const variable = graph.variables.get(variableId)
  if (!variable) return null
  const collection = graph.variableCollections.get(variable.collectionId)
  const modeId = graph.getNodeVariableModeId(nodeId, variable.collectionId)
  return {
    id: variable.id,
    name: variable.name,
    type: variable.type,
    collection: collection?.name ?? '',
    mode: collection?.modes.find((mode) => mode.modeId === modeId)?.name ?? '',
    value: formatVariableValue(graph.resolveVariable(variable.id, modeId)),
    valuesByMode: variableValuesByMode(graph, variable)
  }
}

export const getVariableDefs = defineTool({
  name: 'get_variable_defs',
  description:
    "Variables and styles a node or the selection uses, including its descendants, as Figma's get_variable_defs returns them. definitions maps each name to its value in the mode the layers use (colors as hex, aliases resolved); variables adds each variable's collection and its value in every mode; styles lists the shared styles with their values. With no nodeId and no selection it reads the current page.",
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({
    nodeId: v.optional(
      v.pipe(figmaNodeIdInput, v.description('Node to read. Default: the selection'))
    ),
    ...figmaClientInputs
  }),
  execute: (figma, { nodeId }) => {
    const target = resolveFigmaToolTarget(figma, nodeId)
    if (target.kind === 'missing') return { error: `Node "${target.nodeId}" not found` }
    const rootIds =
      target.kind === 'none' ? [figma.currentPage.id] : target.nodes.map((node) => node.id)
    const graph = figma.graph
    const usage = collectUsage(graph, rootIds)

    const variables: UsedVariable[] = []
    for (const [variableId, usedBy] of usage.variables) {
      const used = usedVariable(graph, variableId, usedBy)
      if (used) variables.push(used)
    }
    variables.sort((left, right) => left.name.localeCompare(right.name))

    const defined = documentStyles(graph)
    const styles: ResolvedStyle[] = []
    for (const styleId of usage.styles) {
      const style = defined.get(styleId)
      if (style) styles.push(style)
    }
    styles.sort((left, right) => left.name.localeCompare(right.name))

    const definitions: Record<string, string> = {}
    for (const style of styles) definitions[style.name] = style.value
    for (const variable of variables) definitions[variable.name] = variable.value
    return { definitions, variables, styles }
  }
})
