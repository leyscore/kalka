import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'
import { canonicalPluginId, KALKA_PLUGIN_DATA, type SceneGraph } from '@kalka/scene-graph'

import { customAnnotationCategoriesOf } from '../node-change/handoff-categories'
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
  root.comments = readNodeChangePluginData(document, KALKA_PLUGIN_DATA.comments) ?? []
  root.frameReviews = readNodeChangePluginData(document, KALKA_PLUGIN_DATA.frameReviews) ?? []
  // A file Figma wrote lists its own categories next to the presets on the record itself.
  root.annotationCategories =
    readNodeChangePluginData(document, KALKA_PLUGIN_DATA.annotationCategories) ??
    customAnnotationCategoriesOf(document)
  // A file Kalka wrote says when its text uses Inter 4; Figma's files keep Figma's Inter.
  const interVersion = readNodeChangePluginData(document, KALKA_PLUGIN_DATA.interVersion)
  if (interVersion) graph.interVersion = interVersion
  // Figma's Set as thumbnail; the layer keeps its record's GUID as its id.
  const thumbnail = document.thumbnailInfo?.nodeID
  if (thumbnail) graph.thumbnailNodeId = guidToString(thumbnail)
  const bindings = readNodeChangePluginData(document, KALKA_PLUGIN_DATA.enabledLibraries)
  for (const binding of bindings ?? []) graph.enabledLibraries.set(binding.libraryId, binding)
}
