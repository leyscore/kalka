import { mergePluginData } from '@kalka/fig/node-change'
import type { KiwiNodeChange } from '@kalka/fig/node-change'
import {
  FIGMA_INTER_VERSION,
  isPluginDataEntry,
  KALKA_PLUGIN_DATA,
  withoutPluginData,
  withPluginData,
  type SceneGraph
} from '@kalka/scene-graph'

const { cssClasses, enabledLibraries, interVersion } = KALKA_PLUGIN_DATA

/**
 * The document record's plugin data: its CSS classes, the libraries it has enabled, and Inter 4
 * when its text uses it rather than Figma's Inter 3.19.
 */
export function applyDocumentPluginData(
  documentNodeChange: KiwiNodeChange,
  graph: SceneGraph
): void {
  const root = graph.getNode(graph.rootId)
  const classes = root?.cssClasses ?? []
  const rootPluginData = withPluginData(
    withPluginData(root?.pluginData ?? [], cssClasses, classes.length > 0 ? classes : undefined),
    interVersion,
    graph.interVersion === FIGMA_INTER_VERSION ? undefined : graph.interVersion
  )
  const bindings = [...graph.enabledLibraries.values()]
  // With no libraries enabled, the entry the document was opened with is kept as it was.
  const opened = rootPluginData.find((entry) => isPluginDataEntry(entry, enabledLibraries))
  documentNodeChange.pluginData = mergePluginData(
    bindings.length > 0
      ? withPluginData(rootPluginData, enabledLibraries, bindings)
      : [...withoutPluginData(rootPluginData, [enabledLibraries]), ...(opened ? [opened] : [])]
  )
}
