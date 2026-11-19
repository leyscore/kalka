import {
  resolvedValueBindings,
  variableText,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

/**
 * Resolve values once occurrence hierarchy and modes exist; later variable and mode changes
 * re-resolve them through the editor's binding reconcile. Visibility uses the shared
 * override-aware resolver. Figma stores a bound layer's resolved characters, but an instance
 * override carries the binding alone, and a literal override of a bound layer is retired rather
 * than applied, so the binding, not the claim, decides what a bound layer reads.
 */
export function applyDocumentValueBindings(
  graph: SceneGraph,
  materialized: readonly SceneNode[]
): void {
  for (const node of materialized) {
    if (node.boundVariables.visible) {
      const { visible } = resolvedValueBindings(graph, node)
      if (visible !== undefined) graph.updateNode(node.id, { visible })
    }
    if (node.type !== 'TEXT') continue
    const variableId = node.boundVariables.text
    if (!variableId) continue
    const text = variableText(graph.resolveVariableForNode(node.id, variableId))
    if (text === undefined || text === node.text) continue
    graph.updateNode(node.id, { text })
  }
}
