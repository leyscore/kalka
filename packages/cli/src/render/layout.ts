import { fromUint8Array } from 'js-base64'
import * as v from 'valibot'

import { vectorElement } from '@kalka/core/io'
import {
  applyMeasuredLayout,
  computeAllLayouts,
  installLayoutEngine,
  type LayoutEngine
} from '@kalka/core/layout'
import {
  collectNodeFontFaces,
  fontManager,
  prepareGraphFonts,
  styleToWeight
} from '@kalka/core/text'
import {
  ARTBOARD_SANDBOX,
  LAYER_ID_ATTR,
  artboardMarkup,
  artboardSrcdoc,
  createPageLayout,
  measureLayerBoxes,
  sceneNodeToDesignDocument,
  type MeasuredGeometry,
  type PageArtboard,
  type PageFontFace,
  type PageLayoutRequest
} from '@kalka/dom-css/export'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import { renderHost, type RenderHost } from '#cli/render/host/session'

/** How long one layout request may take before the run falls back to Yoga. */
const LAYOUT_TIMEOUT = 60_000
/** Past this much HTML or this many artboards, a layout goes to the host in several requests. */
const BATCH_BYTES = 4_000_000
const BATCH_ARTBOARDS = 200

const ResultSchema = v.array(
  v.tuple([
    v.string(),
    v.object({
      x: v.optional(v.number()),
      y: v.optional(v.number()),
      width: v.number(),
      height: v.number()
    })
  ])
)

/** The page program, defined once in the host's page and kept there between requests. */
const PAGE_LAYOUT = `(globalThis.__kalkaLayout ??= (${createPageLayout.toString()})(${measureLayerBoxes.toString()}))`

function isPage(node: SceneNode | undefined): boolean {
  return node?.type === 'CANVAS'
}

/** The top-level layer drawing `id`: its ancestor, or itself, whose parent is a page. */
function artboardOf(graph: SceneGraph, id: string): string | null {
  let node = graph.getNode(id)
  while (node?.parentId) {
    const parent = graph.getNode(node.parentId)
    if (isPage(parent)) return node.id
    node = parent
  }
  return null
}

/** The artboards that draw `nodeId` and everything inside it, or null when no page holds it. */
function artboardsFor(graph: SceneGraph, nodeId: string): string[] | null {
  if (nodeId === graph.rootId) return graph.getPages(true).flatMap((page) => page.childIds)
  const node = graph.getNode(nodeId)
  if (isPage(node)) return node ? [...node.childIds] : null
  const artboard = artboardOf(graph, nodeId)
  return artboard ? [artboard] : null
}

/**
 * Which artboards are laid out as the graph stands: an edit inside one makes it stale. Layout's
 * own writes are its result, not edits.
 */
function trackFreshArtboards(graph: SceneGraph): Set<string> {
  const fresh = new Set<string>()
  const touch = (...ids: (string | null | undefined)[]) => {
    if (graph.isApplyingLayout) return
    for (const id of ids) {
      if (!id) continue
      const artboard = artboardOf(graph, id)
      if (artboard) fresh.delete(artboard)
      else if (!isPage(graph.getNode(id))) fresh.clear()
    }
  }
  graph.onNodeEvents({
    created: (node) => touch(node.id),
    updated: (id) => touch(id),
    deleted: (_id, parentId) => touch(parentId),
    reparented: (id, oldParentId) => touch(id, oldParentId),
    reordered: (id, _parentId, _index, previousParentId) => touch(id, previousParentId)
  })
  return fresh
}

/**
 * Layout by the browser for the CLI: each artboard is projected to the HTML and CSS the DOM
 * canvas builds, laid out by Chromium in the render host, and every box is read back into the
 * layers, as the app's DOM layout engine does. Artboards are sent in batches and laid out again
 * only once an edit touched them.
 *
 * Artboards the canvas does not draw, such as hidden ones, are left to Yoga, and so is every
 * layout once the host has failed.
 */
export class BrowserLayoutEngine implements LayoutEngine {
  readonly #fresh = new WeakMap<SceneGraph, Set<string>>()
  readonly #sentFonts = new Set<string>()
  #yoga = false
  /** Set once a layout failed: the rest of the run stays on one engine, Yoga. */
  #failed = false

  constructor(private readonly host: RenderHost) {}

  layout(graph: SceneGraph, nodeId: string): boolean {
    if (this.#yoga || this.#failed || this.host.closed) return false
    const artboards = artboardsFor(graph, nodeId)
    if (!artboards) return false
    let fresh = this.#fresh.get(graph)
    if (!fresh) {
      fresh = trackFreshArtboards(graph)
      this.#fresh.set(graph, fresh)
    }
    const pending = artboards.filter((id) => !fresh.has(id))
    if (pending.length === 0) return true

    const projected: PageArtboard[] = []
    const yoga: string[] = []
    for (const id of pending) {
      const artboard = this.#project(graph, id)
      if (artboard) projected.push(artboard)
      else yoga.push(id)
    }
    const measured = this.#measure(graph, projected)
    if (!measured) {
      this.#failed = true
      return false
    }
    applyMeasuredLayout(graph, measured)
    for (const { id } of projected) fresh.add(id)
    if (yoga.length > 0) this.#withYoga(() => yoga.forEach((id) => computeAllLayouts(graph, id)))
    return true
  }

  #withYoga(run: () => void): void {
    this.#yoga = true
    try {
      run()
    } finally {
      this.#yoga = false
    }
  }

  /** An artboard as the canvas builds it, or null when the canvas would not draw it. */
  #project(graph: SceneGraph, id: string): PageArtboard | null {
    const node = graph.getNode(id)
    if (!node) return null
    const projected = sceneNodeToDesignDocument(graph, id, {
      includeSourceIds: false,
      tokens: false,
      vectorElement,
      derivedSizes: true
    }).children.at(0)
    if (projected?.type !== 'element') return null
    return { id, width: node.width, height: node.height, html: artboardMarkup(node, projected) }
  }

  /** The faces the artboards' text names that the page does not have yet, as loaded. */
  #fontsFor(graph: SceneGraph, artboards: readonly PageArtboard[]): PageFontFace[] {
    const named: Array<{ family: string; style: string }> = []
    const collect = (id: string) => {
      const node = graph.getNode(id)
      if (!node) return
      named.push(...collectNodeFontFaces(node))
      node.childIds.forEach(collect)
    }
    for (const { id } of artboards) collect(id)
    const faces: PageFontFace[] = []
    for (const { family, style } of named) {
      const key = `${family}\0${style}`
      if (this.#sentFonts.has(key)) continue
      const data = fontManager.loadedData(family, style)
      if (!data) continue
      this.#sentFonts.add(key)
      faces.push({
        family,
        weight: String(styleToWeight(style)),
        style: style.toLowerCase().includes('italic') ? 'italic' : 'normal',
        data: fromUint8Array(new Uint8Array(data))
      })
    }
    return faces
  }

  /** Every box of the artboards, laid out by the host; null when the host failed. */
  #measure(
    graph: SceneGraph,
    artboards: readonly PageArtboard[]
  ): Map<string, MeasuredGeometry> | null {
    const measured = new Map<string, MeasuredGeometry>()
    for (const batch of batches(artboards)) {
      const request: PageLayoutRequest = {
        srcdoc: artboardSrcdoc(),
        sandbox: ARTBOARD_SANDBOX,
        layerAttr: LAYER_ID_ATTR,
        fonts: this.#fontsFor(graph, batch),
        artboards: batch
      }
      const answer = this.host.request(
        { type: 'evaluate', script: `${PAGE_LAYOUT}(${JSON.stringify(request)})` },
        LAYOUT_TIMEOUT
      )
      const boxes = answer ? v.safeParse(ResultSchema, answer.result) : null
      if (!boxes?.success) return null
      for (const [id, geometry] of boxes.output) measured.set(id, geometry)
    }
    return measured
  }
}

function batches(artboards: readonly PageArtboard[]): PageArtboard[][] {
  const result: PageArtboard[][] = []
  let current: PageArtboard[] = []
  let bytes = 0
  for (const artboard of artboards) {
    if (
      current.length > 0 &&
      (bytes + artboard.html.length > BATCH_BYTES || current.length >= BATCH_ARTBOARDS)
    ) {
      result.push(current)
      current = []
      bytes = 0
    }
    current.push(artboard)
    bytes += artboard.html.length
  }
  if (current.length > 0) result.push(current)
  return result
}

let installed = false

/**
 * Lays out with the browser for the rest of the run when the render host is there, and says
 * whether it does; Yoga stays the layout engine otherwise, or with `KALKA_LAYOUT=yoga`. The host
 * starts on the first layout, not here.
 */
export function useBrowserLayout(): boolean {
  if (installed) return true
  if (process.env.KALKA_LAYOUT === 'yoga') return false
  const host = renderHost()
  if (!host) return false
  installLayoutEngine(new BrowserLayoutEngine(host))
  installed = true
  return true
}

/**
 * Loads the fonts a document's text names, so the browser lays it out with them. Layout is
 * synchronous and fonts load over the network, so this runs before it, when a document opens.
 */
export async function prepareBrowserLayout(graph: SceneGraph): Promise<void> {
  if (!installed) return
  await prepareGraphFonts(
    graph,
    graph.getPages(true).map((page) => page.id)
  )
}
