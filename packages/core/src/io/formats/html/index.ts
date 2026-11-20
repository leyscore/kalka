import { omit } from 'es-toolkit'

import {
  exportHTMLBundle,
  sceneNodeToDesignDocument,
  withResponsiveStyles,
  type DesignDocument,
  type WebFontFaceResolver
} from '@kalka/dom-css/export'
import type { InterVersion, SceneGraph } from '@kalka/scene-graph'

import type { ExportAsset, HTMLExportOptions } from '#core/io/types'
import { fontManager } from '#core/text/fonts'
import { exportWebFontFaceAssets } from '#core/text/web-font/assets'

import { loadedFontFaceAssets } from './fonts'
import { vectorElement } from './vectors'

/** What places a layer inside its parent, which an exported page does not have. */
const PLACEMENT = ['position', 'left', 'top', 'right', 'bottom', 'inset']

/**
 * The exported layer drawn where the page starts, as a top-level frame is. A layer from inside a
 * section or frame keeps the offset its parent placed it at otherwise, so the page, and the image
 * or PDF drawn from it, show it moved by that much and cut off. It stays the containing block of
 * the layers placed inside it.
 */
function unplaced(document: DesignDocument): DesignDocument {
  for (const root of document.children) {
    if (root.type !== 'element') continue
    const style = root.inlineStyle ?? {}
    if (style.position !== 'absolute' && style.position !== 'fixed') continue
    root.inlineStyle = { ...omit(style, PLACEMENT), position: 'relative' }
  }
  return document
}

function designDocument(
  graph: SceneGraph,
  nodeIds: string[],
  includeSourceIds: boolean,
  fontFallbacks: readonly string[],
  hairlineScale?: number
): DesignDocument {
  const projected = nodeIds.map((id) =>
    unplaced(
      sceneNodeToDesignDocument(graph, id, {
        vectorElement,
        includeSourceIds,
        fontFallbacks,
        hairlineScale
      })
    )
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

function fontResolver(
  fonts: HTMLExportOptions['fonts'],
  interVersion: InterVersion
): WebFontFaceResolver | 'none' {
  if (fonts === 'loaded') return loadedFontFaceAssets(interVersion)
  if (fonts !== 'assets') return 'none'
  return async (requests, basePath) =>
    (await exportWebFontFaceAssets({ fonts: requests, assetBasePath: basePath, interVersion }))
      .assets
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
  const projected = designDocument(
    graph,
    nodeIds,
    !!options.sourceIds,
    fontFallbacks,
    options.hairlineScale
  )
  // A page's breakpoints become media rules, which only a stylesheet can hold.
  const exported =
    options.html === 'standalone' && options.style !== 'tailwind'
      ? withResponsiveStyles(
          graph,
          projected,
          (id) =>
            designDocument(graph, [id], !!options.sourceIds, fontFallbacks, options.hairlineScale)
              .children[0]
        )
      : projected
  const bundle = await exportHTMLBundle(exported, {
    html: options.html,
    style: options.style,
    assets: options.assets,
    fonts: fontResolver(options.fonts, graph.interVersion),
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
