import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { exportFigFile, parseFigFile } from '@kalka/core/io'
import { SceneGraph, type Effect, type Fill } from '@kalka/scene-graph'

/** How a generated document is shaped. */
export interface GeneratedDocumentSpec {
  name: string
  /** Leaf layers (text, rectangles, ellipses); cards and artboards come on top. */
  leaves: number
  /**
   * Top-level layers on the page. The DOM canvas draws each in an iframe of its own, so this is
   * the number of iframes the document costs.
   */
  artboards: number
}

export const GENERATED_DOCUMENTS = {
  'layers-2k': { name: 'layers-2k', leaves: 2_000, artboards: 20 },
  'layers-20k': { name: 'layers-20k', leaves: 20_000, artboards: 20 },
  /** 500 top-level layers with nothing inside: what each artboard iframe costs on its own. */
  'flat-500': { name: 'flat-500', leaves: 0, artboards: 500 }
} satisfies Record<string, GeneratedDocumentSpec>

export type GeneratedDocumentName = keyof typeof GENERATED_DOCUMENTS

/** Artboard counts the iframe-cost scenario steps through. */
export const ARTBOARD_STEPS = [1, 5, 10, 30, 50]
/** Each step's artboards hold ten cards of ten layers, as a typical screen design does. */
export const LEAVES_PER_ARTBOARD = 100

export function artboardStep(count: number): GeneratedDocumentSpec {
  return { name: `artboards-${count}`, leaves: count * LEAVES_PER_ARTBOARD, artboards: count }
}

const CARD_CHILDREN = 10
const CARD_COLUMNS = 4
const CARD = { width: 320, height: 236, gap: 24 }
const ARTBOARD_WIDTH = CARD_COLUMNS * (CARD.width + CARD.gap) + CARD.gap
const ARTBOARD_GAP = 200
const LEAF_KINDS = ['TEXT', 'RECTANGLE', 'ELLIPSE'] as const

const solid = (r: number, g: number, b: number): Fill[] => [
  { type: 'SOLID', color: { r, g, b, a: 1 }, opacity: 1, visible: true }
]
const SHADOW: Effect[] = [
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.12 },
    offset: { x: 0, y: 3 },
    radius: 8,
    spread: 0,
    visible: true
  }
]

/**
 * Builds a deterministic document: artboards in a row, each holding a grid of cards of ten
 * layers (a third text, the rest rectangles and ellipses), every fourth card with a shadow.
 */
export function buildGeneratedGraph(spec: GeneratedDocumentSpec): SceneGraph {
  const graph = new SceneGraph()
  const [page] = graph.getPages()
  graph.updateNode(page.id, { name: spec.name })
  const cards = Math.ceil(spec.leaves / CARD_CHILDREN)
  const cardsPerArtboard = Math.ceil(cards / spec.artboards)
  const rows = Math.max(1, Math.ceil(cardsPerArtboard / CARD_COLUMNS))
  const artboardHeight = spec.leaves ? rows * (CARD.height + CARD.gap) + CARD.gap : 400
  const artboardWidth = spec.leaves ? ARTBOARD_WIDTH : 400
  const perRow = Math.ceil(Math.sqrt(spec.artboards))
  let leaves = 0
  let card = 0
  for (let index = 0; index < spec.artboards; index++) {
    const artboard = graph.createNode('FRAME', page.id, {
      name: `Artboard ${index + 1}`,
      x: (index % perRow) * (artboardWidth + ARTBOARD_GAP),
      y: Math.floor(index / perRow) * (artboardHeight + ARTBOARD_GAP),
      width: artboardWidth,
      height: artboardHeight,
      clipsContent: true,
      fills: solid(1, 1, 1)
    })
    for (let slot = 0; slot < cardsPerArtboard && leaves < spec.leaves; slot++, card++) {
      const frame = graph.createNode('FRAME', artboard.id, {
        name: `Card ${card}`,
        x: CARD.gap + (slot % CARD_COLUMNS) * (CARD.width + CARD.gap),
        y: CARD.gap + Math.floor(slot / CARD_COLUMNS) * (CARD.height + CARD.gap),
        width: CARD.width,
        height: CARD.height,
        cornerRadius: 12,
        clipsContent: true,
        fills: solid(0.96, 0.97, 0.99),
        effects: card % 4 === 0 ? SHADOW : []
      })
      for (let child = 0; child < CARD_CHILDREN && leaves < spec.leaves; child++, leaves++) {
        const kind = LEAF_KINDS[child % 3]
        const node = graph.createNode(kind, frame.id, {
          name: `${kind.toLowerCase()} ${card}-${child}`,
          x: 12 + (child % 2) * 150,
          y: 12 + Math.floor(child / 2) * 44,
          width: kind === 'ELLIPSE' ? 32 : 140,
          height: kind === 'ELLIPSE' ? 32 : 20,
          cornerRadius: kind === 'RECTANGLE' ? 4 : 0,
          fills:
            kind === 'TEXT'
              ? solid(0.12, 0.14, 0.18)
              : solid(0.25 + (card % 5) * 0.1, 0.48, 0.92 - (child % 4) * 0.1)
        })
        if (kind === 'TEXT')
          graph.updateNode(node.id, { text: `Item ${card}-${child}`, fontSize: 14 })
      }
    }
  }
  return graph
}

/** Writes the generated `.fig` under `dir` unless it is already there; returns its path. */
export async function ensureGeneratedDocument(
  dir: string,
  spec: GeneratedDocumentSpec
): Promise<string> {
  const path = join(dir, `${spec.name}.fig`)
  if (existsSync(path)) return path
  await mkdir(dir, { recursive: true })
  await writeFile(path, await exportFigFile(buildGeneratedGraph(spec), { documentName: spec.name }))
  return path
}

/** Layers in a generated document by type, as the report states them. */
export function countLayers(spec: GeneratedDocumentSpec) {
  const cards = Math.ceil(spec.leaves / CARD_CHILDREN)
  return {
    leaves: spec.leaves,
    cards,
    artboards: spec.artboards,
    total: spec.leaves + cards + spec.artboards
  }
}

/**
 * Parses a `.fig` outside the app, in Bun's main thread: a reference for what import alone costs,
 * with no canvas behind it. Bun runs JavaScriptCore, not V8, so times and heap compare in trend.
 */
export async function measureHeadlessImport(
  path: string
): Promise<{ parseMs: number; heapMiB: number; nodes: number }> {
  const bytes = await Bun.file(path).arrayBuffer()
  Bun.gc(true)
  const heapBefore = process.memoryUsage().heapUsed
  const started = performance.now()
  const graph = await parseFigFile(bytes)
  const parseMs = performance.now() - started
  Bun.gc(true)
  const heapMiB = (process.memoryUsage().heapUsed - heapBefore) / (1024 * 1024)
  return {
    parseMs: Math.round(parseMs),
    heapMiB: Math.round(heapMiB * 10) / 10,
    nodes: graph.nodes.size
  }
}
