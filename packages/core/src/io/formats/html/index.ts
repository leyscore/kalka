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
  return {
    type: 'document',
    sourceGraph: graph,
    children: nodeIds.flatMap(
      (id) => sceneNodeToDesignDocument(graph, id, { vectorElement, includeSourceIds }).children
    )
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
    assetBasePath: assetBasePath(fileName)
  })
  const page = bundle.files.find((file) => file.path === bundle.entrypoint)
  if (typeof page?.content !== 'string') throw new Error('HTML export produced no page')
  return { html: page.content, assets: bundle.files.filter((file) => file !== page) }
}
