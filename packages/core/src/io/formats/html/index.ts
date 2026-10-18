import {
  exportHTMLBundle,
  sceneNodeToDesignDocument,
  withResponsiveStyles,
  type DesignDocument,
  type WebFontFaceResolver
} from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'

import type { ExportAsset, HTMLExportOptions } from '#core/io/types'
import { fontManager } from '#core/text/fonts'
import { exportWebFontFaceAssets } from '#core/text/web-font/assets'

import { loadedFontFaceAssets } from './fonts'
import { vectorElement } from './vectors'

function designDocument(
  graph: SceneGraph,
  nodeIds: string[],
  includeSourceIds: boolean,
  fontFallbacks: readonly string[]
): DesignDocument {
  const projected = nodeIds.map((id) =>
    sceneNodeToDesignDocument(graph, id, { vectorElement, includeSourceIds, fontFallbacks })
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

function fontResolver(fonts: HTMLExportOptions['fonts']): WebFontFaceResolver | 'none' {
  if (fonts === 'loaded') return loadedFontFaceAssets
  if (fonts !== 'assets') return 'none'
  return async (requests, basePath) =>
    (await exportWebFontFaceAssets({ fonts: requests, assetBasePath: basePath })).assets
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
  const fontFallbacks = options.fonts === 'loaded' ? fontManager.fallbackFamilies() : []
  const projected = designDocument(graph, nodeIds, !!options.sourceIds, fontFallbacks)
  // A page's breakpoints become media rules, which only a stylesheet can hold.
  const exported =
    options.html === 'standalone' && options.style !== 'tailwind'
      ? withResponsiveStyles(
          graph,
          projected,
          (id) => designDocument(graph, [id], !!options.sourceIds, fontFallbacks).children[0]
        )
      : projected
  const bundle = await exportHTMLBundle(exported, {
    html: options.html,
    style: options.style,
    assets: options.assets,
    fonts: fontResolver(options.fonts),
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
