import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'

import { SkiaRenderer } from '@kalka/core/canvas'
import { BUILTIN_IO_FORMATS, IORegistry, initCanvasKit } from '@kalka/core/io'
import { populateAllFigPages, populateFigPage } from '@kalka/core/io/formats/fig'
import { readKalkaFolder, type KalkaFile } from '@kalka/core/io/formats/kalka'
import { computeAllLayouts, installTextMeasurer } from '@kalka/core/layout'
import type { SceneGraph } from '@kalka/scene-graph'

import { printError } from '#cli/format'
import { prepareBrowserLayout } from '#cli/render/layout'

export { initCanvasKit }

const io = new IORegistry(BUILTIN_IO_FORMATS)

/** Every file under a folder, by its `/`-separated path inside it. */
async function readFolderFiles(folder: string): Promise<Map<string, Uint8Array>> {
  const files = new Map<string, Uint8Array>()
  for (const entry of await readdir(folder, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue
    const path = join(entry.parentPath, entry.name)
    files.set(relative(folder, path).split(sep).join('/'), new Uint8Array(await readFile(path)))
  }
  return files
}

/** Writes a Kalka folder's files under `folder`, creating it and its subfolders. */
export async function writeFolderFiles(folder: string, files: readonly KalkaFile[]): Promise<void> {
  for (const file of files) {
    const path = join(folder, ...file.path.split('/'))
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, file.content)
  }
}

export async function loadDocument(filePath: string): Promise<SceneGraph> {
  let graph: SceneGraph
  if ((await stat(filePath)).isDirectory()) {
    graph = readKalkaFolder(await readFolderFiles(filePath))
  } else {
    const bytes = new Uint8Array(await readFile(filePath))
    graph = (await io.readDocument({ name: filePath, data: bytes })).graph
  }
  await layOutDocument(graph)
  return graph
}

/** Lays a document out, or one page of it, with its fonts when the browser lays it out. */
async function layOutDocument(graph: SceneGraph, scopeId?: string): Promise<void> {
  await prepareBrowserLayout(graph)
  computeAllLayouts(graph, scopeId)
}

let textMeasurer: Promise<void> | null = null

/**
 * Measure text a script or tool lays out with CanvasKit and the fonts it loads, as the app
 * does, instead of the estimate that knows neither line breaks nor wrapping. The document as
 * loaded keeps the layout its file gives it; only edits made afterwards are measured.
 */
export function measureTextHeadlessly(): Promise<void> {
  textMeasurer ??= (async () => {
    const ck = await initCanvasKit()
    const surface = ck.MakeSurface(1, 1)
    if (!surface) throw new Error('CanvasKit could not make a surface to measure text')
    const renderer = new SkiaRenderer(ck, surface)
    await renderer.loadFonts()
    installTextMeasurer((node, maxWidth) => renderer.measureTextNode(node, maxWidth))
  })().catch((error: unknown) => {
    textMeasurer = null
    throw error
  })
  return textMeasurer
}

/** `--write` and `--output` for commands that change a headless document. */
export const documentWriteOptions = {
  write: { type: 'boolean', alias: 'w', description: 'Write changes back to the input file' },
  output: { type: 'string', alias: 'o', description: 'Write to a different file', required: false }
} as const

/** Save a headless document as `.fig`, as `eval --write` and `diff apply --write` do. */
export async function writeFigDocument(graph: SceneGraph, filePath: string): Promise<void> {
  const result = await io.writeDocument('fig', graph)
  await writeFile(filePath, result.data as Uint8Array)
}

export async function populateDocumentPage(graph: SceneGraph, pageId: string): Promise<boolean> {
  const changed = populateFigPage(graph, pageId)
  if (changed) await layOutDocument(graph, pageId)
  return changed
}

export async function populateWholeDocument(graph: SceneGraph): Promise<boolean> {
  const changed = populateAllFigPages(graph)
  if (changed) await layOutDocument(graph)
  return changed
}

/** A string argument of an RPC command, such as its `page` or `format`. */
function stringArg(args: unknown, key: string): string | undefined {
  if (!args || typeof args !== 'object' || Array.isArray(args)) return undefined
  const value: unknown = Reflect.get(args, key)
  return typeof value === 'string' ? value : undefined
}

function populateRequestedPage(graph: SceneGraph, pageName?: string): void {
  const pages = graph.getPages()
  const page = pageName ? pages.find((candidate) => candidate.name === pageName) : pages[0]
  if (page && populateFigPage(graph, page.id)) computeAllLayouts(graph, page.id)
}

/** Every page of a `.fig`, for the read commands, which lay out with Yoga. */
function populateAllPages(graph: SceneGraph): void {
  if (populateAllFigPages(graph)) computeAllLayouts(graph)
}

export function prepareDocumentForRPC(graph: SceneGraph, command: string, args?: unknown): void {
  if (command === 'pages' || command === 'variables') return
  // A stylesheet holds only variables, which load with the document; pages can take minutes.
  if (command === 'tokens' && stringArg(args, 'format') !== 'dtcg') return
  if (command === 'tree') {
    populateRequestedPage(graph, stringArg(args, 'page'))
    return
  }
  if (command === 'find' || command === 'query') {
    const pageName = stringArg(args, 'page')
    if (pageName) populateRequestedPage(graph, pageName)
    else populateAllPages(graph)
    return
  }
  populateAllPages(graph)
}

export function requirePage(graph: SceneGraph, pageName?: string) {
  const pages = graph.getPages()
  const page = pageName ? pages.find((p) => p.name === pageName) : pages[0]
  if (!page) {
    const available = pages.map((p) => `"${p.name}"`).join(', ')
    printError(
      pageName
        ? `Page "${pageName}" not found. Available pages: ${available || 'none'}.`
        : 'Document has no pages.'
    )
    process.exit(1)
  }
  return page
}
