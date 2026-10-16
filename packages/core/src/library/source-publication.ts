import {
  KALKA_PLUGIN_DATA,
  readPluginData,
  withPluginData,
  type SceneGraph,
  type SourceLibraryPublication
} from '@kalka/scene-graph'

export function readSourceLibraryPublication(graph: SceneGraph): SourceLibraryPublication | null {
  const root = graph.getNode(graph.rootId)
  return readPluginData(root?.pluginData, KALKA_PLUGIN_DATA.sourceLibraryPublication) ?? null
}

export function writeSourceLibraryPublication(
  graph: SceneGraph,
  publication: SourceLibraryPublication
): void {
  const root = graph.getNode(graph.rootId)
  if (!root) return
  graph.updateNode(root.id, {
    pluginData: withPluginData(
      root.pluginData,
      KALKA_PLUGIN_DATA.sourceLibraryPublication,
      publication
    )
  })
}
