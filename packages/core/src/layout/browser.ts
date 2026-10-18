import { uniqBy } from 'es-toolkit'
import { fromUint8Array } from 'js-base64'
import * as v from 'valibot'

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
  type PageLayoutRequest,
  type PageLayoutResult
} from '@kalka/dom-css/export'
import { styleToWeight, type SceneGraph, type SceneNode } from '@kalka/scene-graph'

import { vectorElement } from '#core/io/formats/html/vectors'
import { fontManager } from '#core/text/fonts'
import { collectNodeFontFaces } from '#core/text/requirements'

import { applyMeasuredLayout, type LayoutEngine } from './engine'

/** Past this much HTML or this many artboards, a layout goes to the page in several requests. */
const BATCH_BYTES = 4_000_000
const BATCH_ARTBOARDS = 200

/**
 * A browser page that lays artboards out: every layer's box for the request's artboards, or null
 * when the page could not answer. It answers synchronously, as layout runs.
 */
export type LayoutPage = (request: PageLayoutRequest) => PageLayoutResult | null

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

/** The page program, defined once in the page and kept there between requests. */
const PAGE_LAYOUT = `(globalThis.__kalkaLayout ??= (${createPageLayout.toString()})(${measureLayerBoxes.toString()}))`

/**
 * A page in another process, such as the CLI's render host, reached by evaluating a script there
 * and waiting for its result: `evaluate` returns the script's value, or null when it failed.
 */
export function scriptLayoutPage(
  evaluate: (script: string) => { result: unknown } | null
): LayoutPage {
  return (request) => {
    const answer = evaluate(`${PAGE_LAYOUT}(${JSON.stringify(request)})`)
    const boxes = answer ? v.safeParse(ResultSchema, answer.result) : null
    return boxes?.success ? boxes.output : null
  }
}

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
    previewUpdated: (id) => touch(id),
    deleted: (_id, parentId) => touch(parentId),
    reparented: (id, oldParentId) => touch(id, oldParentId),
    reordered: (id, _parentId, _index, previousParentId) => touch(id, previousParentId)
  })
  return fresh
}

/**
 * Layout by a browser page the canvas does not show: each artboard is projected to the HTML and
 * CSS the DOM canvas builds, laid out by the page, and every box is read back into the layers, as
 * the canvas's own layout does. Artboards are sent in batches and laid out again only once an
 * edit touched them, or the file of a face their text names changed since. A hidden
 * artboard is laid out as if shown, so it is ready when it is.
 *
 * Once the page fails to answer, the engine stops asking it: layers keep the geometry they have.
 */
export class BrowserLayoutEngine implements LayoutEngine {
  readonly #fresh = new WeakMap<SceneGraph, Set<string>>()
  /**
   * Per graph, the faces an artboard's text names, each with the file it had when the artboard
   * was laid out: none when it had not loaded, or one covering fewer characters than it has now.
   */
  readonly #laidOutFaces = new WeakMap<SceneGraph, Map<string, LaidOutFace[]>>()
  /** The file the page was last given for each face. */
  readonly #sentFonts = new Map<string, ArrayBuffer>()
  #failed = false

  constructor(private readonly page: LayoutPage) {}

  /** Whether the page stopped answering, so layout no longer happens. */
  get failed(): boolean {
    return this.#failed
  }

  layout(graph: SceneGraph, nodeId: string): boolean {
    if (this.#failed) return false
    const artboards = artboardsFor(graph, nodeId)
    if (!artboards) return false
    let fresh = this.#fresh.get(graph)
    if (!fresh) {
      fresh = trackFreshArtboards(graph)
      this.#fresh.set(graph, fresh)
    }
    let laidOutFaces = this.#laidOutFaces.get(graph)
    if (!laidOutFaces) {
      laidOutFaces = new Map()
      this.#laidOutFaces.set(graph, laidOutFaces)
    }
    // Text laid out before its face loaded took a fallback's size, and text laid out with a file
    // holding only some of its characters took a fallback's for the rest: once the face's file
    // changes, the artboard is laid out again, as the canvas does when a font arrives in its iframe.
    const pending = artboards.filter(
      (id) => !fresh.has(id) || (laidOutFaces.get(id)?.some(faceChanged) ?? false)
    )
    if (pending.length === 0) return true

    const projected = pending.flatMap((id) => projectArtboard(graph, id) ?? [])
    const measured = this.#measure(graph, projected)
    if (!measured) {
      this.#failed = true
      return false
    }
    applyMeasuredLayout(graph, measured)
    for (const { id } of projected) {
      fresh.add(id)
      laidOutFaces.set(
        id,
        namedFaces(graph, id).map((face) => ({ ...face, data: loadedFace(face) }))
      )
    }
    return true
  }

  /** The faces the artboards' text names whose file the page does not have yet, as loaded. */
  #fontsFor(graph: SceneGraph, artboards: readonly PageArtboard[]): PageFontFace[] {
    const named = artboards.flatMap(({ id }) => namedFaces(graph, id))
    const faces: PageFontFace[] = []
    for (const face of named) {
      const { family, style } = face
      const key = `${family}\0${style}`
      const data = loadedFace(face)
      if (!data || this.#sentFonts.get(key) === data) continue
      // A later face with the same descriptors takes precedence in the page's font set.
      this.#sentFonts.set(key, data)
      faces.push({
        family,
        weight: String(styleToWeight(style)),
        style: style.toLowerCase().includes('italic') ? 'italic' : 'normal',
        data: fromUint8Array(new Uint8Array(data))
      })
    }
    return faces
  }

  /** Every box of the artboards, laid out by the page; null when the page failed. */
  #measure(
    graph: SceneGraph,
    artboards: readonly PageArtboard[]
  ): Map<string, MeasuredGeometry> | null {
    const measured = new Map<string, MeasuredGeometry>()
    for (const batch of batches(artboards)) {
      const boxes = this.page({
        srcdoc: artboardSrcdoc(),
        sandbox: ARTBOARD_SANDBOX,
        layerAttr: LAYER_ID_ATTR,
        fonts: this.#fontsFor(graph, batch),
        artboards: batch
      })
      if (!boxes) return null
      for (const [id, geometry] of boxes) measured.set(id, keepThinSize(graph, id, geometry))
    }
    return measured
  }
}

interface FontFaceName {
  family: string
  style: string
}

interface LaidOutFace extends FontFaceName {
  data: ArrayBuffer | null
}

/**
 * The faces the text in `id` and everything inside it names, each once, and the fallback faces
 * the projection lists after them.
 */
function namedFaces(graph: SceneGraph, id: string): FontFaceName[] {
  const named: FontFaceName[] = []
  const collect = (nodeId: string) => {
    const node = graph.getNode(nodeId)
    if (!node) return
    named.push(...collectNodeFontFaces(node))
    node.childIds.forEach(collect)
  }
  collect(id)
  // An installed fallback the page finds by its name; a downloaded one it is sent.
  if (named.length > 0)
    for (const family of fontManager.fallbackFamilies())
      if (fontManager.loadedFontSource(family, 'Regular') !== 'fallback')
        named.push({ family, style: 'Regular' })
  return uniqBy(named, ({ family, style }) => `${family}\0${style}`)
}

function loadedFace({ family, style }: FontFaceName): ArrayBuffer | null {
  return fontManager.loadedData(family, style)
}

/** Whether the face's file is not the one the artboard was laid out with. */
function faceChanged(face: LaidOutFace): boolean {
  return loadedFace(face) !== face.data
}

/** An artboard as the canvas builds it, shown even when hidden. */
function projectArtboard(graph: SceneGraph, id: string): PageArtboard | null {
  const node = graph.getNode(id)
  if (!node) return null
  const projected = sceneNodeToDesignDocument(graph, id, {
    includeSourceIds: false,
    tokens: false,
    vectorElement,
    derivedSizes: true,
    shown: new Set([id]),
    fontFallbacks: fontManager.fallbackFamilies()
  }).children.at(0)
  if (projected?.type !== 'element') return null
  return { id, width: node.width, height: node.height, html: artboardMarkup(node, projected) }
}

/**
 * A shape thinner than a pixel, such as a line, keeps its own size: the SVG that draws it is at
 * least a pixel on each side, as the canvas's projector also corrects. A layer that lays out
 * content, or text, takes the size the browser gave it.
 */
function keepThinSize(graph: SceneGraph, id: string, geometry: MeasuredGeometry): MeasuredGeometry {
  const node = graph.getNode(id)
  if (!node || (node.width >= 1 && node.height >= 1)) return geometry
  if (node.childIds.length > 0 || node.layoutMode !== 'NONE' || node.type === 'TEXT') {
    return geometry
  }
  return {
    ...geometry,
    width: node.width < 1 ? node.width : geometry.width,
    height: node.height < 1 ? node.height : geometry.height
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
