import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { canonicalPluginId, KALKA_PLUGIN_DATA, type SceneGraph } from '@kalka/scene-graph'

import { readNodeChangePluginData } from '../node-change/plugin-data'

export function applyDocumentMetadata(graph: SceneGraph, document: NodeChange | undefined): void {
  const root = graph.getNode(graph.rootId)
  if (!root || !document) return
  root.source.format = 'fig'
  root.pluginData =
    document.pluginData?.map((entry) => ({
      pluginId: canonicalPluginId(entry.pluginID),
      key: entry.key,
      value: entry.value
    })) ?? []
  root.source.fig.rawNodeFields.strokeJoin = document.strokeJoin
  root.source.fig.rawNodeFields.strokeWeight = document.strokeWeight
  root.cssClasses = readNodeChangePluginData(document, KALKA_PLUGIN_DATA.cssClasses) ?? []
  const bindings = readNodeChangePluginData(document, KALKA_PLUGIN_DATA.enabledLibraries)
  for (const binding of bindings ?? []) graph.enabledLibraries.set(binding.libraryId, binding)
}
