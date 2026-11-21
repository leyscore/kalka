import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

import {
  FigmaAPI,
  type FigmaComponentNode,
  type FigmaComponentSetNode,
  type FigmaNodeProxy,
  type FigmaTextNode
} from '#core/figma-api'
import { copyLibraryTree } from '#core/library/materialize'
import { createLibraryRevision } from '#core/library/revision'
import type { ComponentLibraryRevision } from '#core/library/types'

import {
  FRESH_COMPONENTS,
  FRESH_LIBRARY_DESCRIPTION,
  FRESH_LIBRARY_ID,
  FRESH_LIBRARY_NAME,
  FRESH_LIBRARY_PUBLISHED_AT,
  FRESH_LIBRARY_REVISION,
  freshCredit,
  freshVariants
} from './catalog'
import type { FreshComponent, VariantValues } from './types'

function variantName(values: VariantValues): string {
  return Object.entries(values)
    .map(([property, value]) => `${property}=${value}`)
    .join(', ')
}

/** Writes one variant's HTML into the page as layers, as write_html does, and returns its root. */
async function importVariant(graph: SceneGraph, pageId: string, html: string): Promise<SceneNode> {
  const { htmlToSceneGraph } = await import('@kalka/dom-css')
  const imported = await htmlToSceneGraph(html, { pageName: 'HTML' })
  const root = imported
    .getPages()
    .flatMap((page) => imported.getChildren(page.id))
    .at(0)
  if (!root) throw new Error('A Fresh component variant has no visible element')
  const mapped = new Map<string, string>()
  copyLibraryTree(imported, graph, root.id, pageId, mapped)
  for (const [hash, bytes] of imported.images) graph.images.set(hash, bytes)
  const created = graph.getNode(mapped.get(root.id) ?? '')
  if (!created) throw new Error('A Fresh component variant could not be copied')
  return created
}

function textNodes(graph: SceneGraph, rootId: string, text: string): SceneNode[] {
  return graph
    .flattenTree(rootId)
    .map((entry) => entry.node)
    .filter((node) => node.type === 'TEXT' && node.text.trim() === text)
}

/** Adds the text properties and points every text that shows the default at its property. */
function isComponent(node: FigmaNodeProxy): node is FigmaComponentNode {
  return node.type === 'COMPONENT'
}

function isText(node: FigmaNodeProxy): node is FigmaTextNode {
  return node.type === 'TEXT'
}

function addTextProperties(
  figma: FigmaAPI,
  asset: FigmaComponentNode | FigmaComponentSetNode,
  component: FreshComponent
) {
  for (const [name, text] of Object.entries(component.texts)) {
    const key = asset.addComponentProperty(name, 'TEXT', text)
    for (const node of textNodes(figma.graph, asset.id, text)) {
      const layer = figma.wrapNode(node.id)
      if (!isText(layer)) continue
      layer.componentPropertyReferences = { characters: key }
      layer.name = name
    }
  }
}

async function buildComponent(figma: FigmaAPI, pageId: string, component: FreshComponent) {
  const variants = freshVariants(component)
  const made: FigmaComponentNode[] = []
  for (const values of variants) {
    const root = await importVariant(figma.graph, pageId, component.html(values))
    const created = figma.createComponentFromNode(figma.wrapNode(root.id))
    if (!isComponent(created)) throw new Error(`${component.name} did not become a component`)
    created.name = variants.length > 1 ? variantName(values) : component.name
    made.push(created)
  }
  const only = made.length === 1 ? made.at(0) : undefined
  const asset = only ?? figma.combineAsVariants(made, figma.wrapNode(pageId))
  asset.name = component.name
  figma.graph.updateNode(asset.id, {
    componentKey: component.key,
    symbolDescription: `${component.description} ${component.use} ${freshCredit(component)}`,
    symbolLinks: [{ uri: component.source.url, displayName: component.source.library }]
  })
  addTextProperties(figma, asset, component)
}

/** The library's components as a document graph, one component or set per component. */
export async function buildFreshLibraryGraph(
  components: readonly FreshComponent[] = FRESH_COMPONENTS
): Promise<SceneGraph> {
  const graph = new SceneGraph()
  const page = graph.getPages().at(0)
  if (!page) throw new Error('A new document has no page')
  const figma = new FigmaAPI(graph)
  for (const component of components) await buildComponent(figma, page.id, component)
  return graph
}

let built: Promise<ComponentLibraryRevision> | null = null

/**
 * The built-in library as a published revision. It is built from the component definitions once
 * per process and keeps one fixed revision, so every document that uses it names the same one.
 */
export function freshLibraryRevision(): Promise<ComponentLibraryRevision> {
  built ??= buildFreshLibraryGraph()
    .then((graph) =>
      createLibraryRevision({
        libraryId: FRESH_LIBRARY_ID,
        name: FRESH_LIBRARY_NAME,
        description: FRESH_LIBRARY_DESCRIPTION,
        graph,
        publishedAt: FRESH_LIBRARY_PUBLISHED_AT
      })
    )
    .then((revision) => ({
      ...revision,
      manifest: { ...revision.manifest, revisionId: FRESH_LIBRARY_REVISION }
    }))
    .catch((error: unknown) => {
      built = null
      throw error
    })
  return built
}
