import {
  exportHTMLBundle,
  sceneNodeToDesignDocument,
  withResponsiveStyles,
  type DesignDocument
} from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'

import type { ExportAsset, HTMLExportOptions } from '#core/io/types'
import { exportWebFontFaceAssets } from '#core/text/web-font/assets'

import { vectorElement } from './vectors'

function designDocument(
  graph: SceneGraph,
  nodeIds: string[],
  includeSourceIds: boolean
): DesignDocument {
  const projected = nodeIds.map((id) =>
    sceneNodeToDesignDocument(graph, id, { vectorElement, includeSourceIds })
  )
  // Each layer records the variables it references; the page defines all of them once.
  const tokens = projected.find((layer) => layer.tokens)?.tokens
  for (const layer of projected) {
    for (const id of layer.tokens?.used ?? []) tokens?.used.add(id)
  }
  return {
    type: 'document',
    sourceGraph: graph,
    tokens,
    children: projected.flatMap((layer) => layer.children)
  }
}

/** `card.html` keeps its external files in `card.assets/` next to it, whatever the path style. */
function assetBasePath(fileName: string | undefined): string {
  const name = fileName
    ?.split(/[\\/]/)
    .pop()
    ?.replace(/\.[^.]*$/, '')
  return `${name || 'export'}.assets`
}

export async function renderNodesToHTML(
  graph: SceneGraph,
  nodeIds: string[],
  options: HTMLExportOptions = {},
  fileName?: string
): Promise<{ html: string; assets: ExportAsset[] }> {
  const projected = designDocument(graph, nodeIds, !!options.sourceIds)
  // A page's breakpoints become media rules, which only a stylesheet can hold.
  const exported =
    options.html === 'standalone' && options.style !== 'tailwind'
      ? withResponsiveStyles(
          graph,
          projected,
          (id) => designDocument(graph, [id], !!options.sourceIds).children[0]
        )
      : projected
  const bundle = await exportHTMLBundle(exported, {
    html: options.html,
    style: options.style,
    assets: options.assets,
    fonts:
      options.fonts === 'assets'
        ? async (fonts, basePath) =>
            (await exportWebFontFaceAssets({ fonts, assetBasePath: basePath })).assets
        : 'none',
    assetBasePath: assetBasePath(fileName),
    reset: options.reset,
    pretty: options.pretty,
    // Tools that map elements back to layers read every declaration on its element.
    shareStyles: !options.sourceIds
  })
  const page = bundle.files.find((file) => file.path === bundle.entrypoint)
  if (typeof page?.content !== 'string') throw new Error('HTML export produced no page')
  return { html: page.content, assets: bundle.files.filter((file) => file !== page) }
}
