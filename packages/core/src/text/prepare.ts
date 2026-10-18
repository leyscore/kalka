import type { SceneGraph } from '@kalka/scene-graph'

import { fontManager, type FontManager } from '#core/text/fonts'
import { fontFamilyKey } from '#core/text/inter'
import { collectGraphFontRequirements, collectNodeFontFaces } from '#core/text/requirements'
import { missingGraphFontScripts } from '#core/text/resolved-requirements'

import { documentFontStatus, type DocumentFontStatus } from './font/status'

export async function prepareGraphFonts(
  graph: SceneGraph,
  nodeIds: readonly string[]
): Promise<DocumentFontStatus> {
  const requirements = collectGraphFontRequirements(graph, nodeIds)
  const faces = requirements.nodes.flatMap((node) => collectNodeFontFaces(node, graph.interVersion))
  await Promise.all(
    faces.map(({ family, style }) => fontManager.loadFont(family, style, requirements.characters))
  )
  await fontManager.ensureFallbackPack(
    missingGraphFontScripts(requirements),
    requirements.characters
  )
  return documentFontStatus(graph, nodeIds)
}

/**
 * Loads a face a document's text names, as its `Inter` is the document's: in a document keeping
 * Figma's Inter, Inter 3.19.
 */
export function loadDocumentFont(
  graph: SceneGraph,
  family: string,
  style = 'Regular',
  load: FontManager['loadFont'] = (...args) => fontManager.loadFont(...args)
): Promise<ArrayBuffer | null> {
  return load(fontFamilyKey(family, graph.interVersion), style)
}
