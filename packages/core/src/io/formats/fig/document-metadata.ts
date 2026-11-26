import { exportAnnotationCategories, mergePluginData } from '@kalka/fig/node-change'
import type { KiwiNodeChange } from '@kalka/fig/node-change'
import {
  FIGMA_INTER_VERSION,
  isPluginDataEntry,
  KALKA_PLUGIN_DATA,
  withoutPluginData,
  withPluginData,
  type SceneGraph
} from '@kalka/scene-graph'

const {
  annotationCategories,
  comments,
  cssClasses,
  documentId,
  enabledLibraries,
  frameReviews,
  interVersion
} = KALKA_PLUGIN_DATA

/**
 * The document record's plugin data: its CSS classes, comments, frame reviews and annotation
 * categories, the libraries it
 * has enabled, Inter 4 when its text uses it rather than Figma's Inter 3.19, and the root's id,
 * which a reopen restores since Figma saves the record itself as `0:0`. The annotation categories
 * also go on the record in Figma's own field, so Figma shows them.
 */
export function applyDocumentPluginData(
  documentNodeChange: KiwiNodeChange,
  graph: SceneGraph
): void {
  const root = graph.getNode(graph.rootId)
  const classes = root?.cssClasses ?? []
  const threads = root?.comments ?? []
  const reviews = root?.frameReviews ?? []
  let rootPluginData = withPluginData(
    root?.pluginData ?? [],
    cssClasses,
    classes.length > 0 ? classes : undefined
  )
  rootPluginData = withPluginData(
    rootPluginData,
    comments,
    threads.length > 0 ? threads : undefined
  )
  rootPluginData = withPluginData(
    rootPluginData,
    frameReviews,
    reviews.length > 0 ? reviews : undefined
  )
  const categories = root?.annotationCategories ?? []
  rootPluginData = withPluginData(
    rootPluginData,
    annotationCategories,
    categories.length > 0 ? categories : undefined
  )
  rootPluginData = withPluginData(
    rootPluginData,
    interVersion,
    graph.interVersion === FIGMA_INTER_VERSION ? undefined : graph.interVersion
  )
  const bindings = [...graph.enabledLibraries.values()]
  // With no libraries enabled, the entry the document was opened with is kept as it was.
  const opened = rootPluginData.find((entry) => isPluginDataEntry(entry, enabledLibraries))
  const withLibraries =
    bindings.length > 0
      ? withPluginData(rootPluginData, enabledLibraries, bindings)
      : [...withoutPluginData(rootPluginData, [enabledLibraries]), ...(opened ? [opened] : [])]
  documentNodeChange.pluginData = mergePluginData(
    withPluginData(withLibraries, documentId, graph.rootId)
  )
  exportAnnotationCategories(documentNodeChange, graph)
}
