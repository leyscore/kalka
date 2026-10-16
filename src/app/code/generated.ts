import { renderNodesToHTML } from '@kalka/core/io'
import { selectionToJSXWithLayers } from '@kalka/design-jsx'
import { sceneNodesToTailwindJSXWithLayers } from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'

import { formatHTML } from '@/app/code/format-html'
import { starterSourceFor, type CodeSource } from '@/app/code/templates'

/** Generated code and the layer behind each of its elements, in pre-order. */
export interface GeneratedCode {
  code: string
  layerIds: ReadonlyArray<string | null>
}

/** Code shown for the selection: editable Design JSX, or read-only Tailwind JSX. */
export function generatedCodeFor(
  source: Exclude<CodeSource, 'html-css'>,
  graph: SceneGraph,
  nodeIds: string[]
): GeneratedCode {
  if (nodeIds.length === 0) return { code: starterSourceFor(source), layerIds: [] }
  return source === 'tailwind-jsx'
    ? sceneNodesToTailwindJSXWithLayers(graph, nodeIds)
    : selectionToJSXWithLayers(nodeIds, graph)
}

/**
 * The selection as the HTML and CSS Kalka exports, shown read-only. Images stay external so the
 * code is not buried under data URLs. Layer links follow JSX syntax only, so none are listed.
 */
export async function selectionHTMLCode(
  graph: SceneGraph,
  nodeIds: string[]
): Promise<GeneratedCode> {
  const { html } = await renderNodesToHTML(graph, nodeIds, { html: 'fragment', assets: 'external' })
  return { code: formatHTML(html), layerIds: [] }
}
