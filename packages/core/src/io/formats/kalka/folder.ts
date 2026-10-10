import { omit } from 'es-toolkit/object'

import { HTML_TAG_RESET_CSS, tokenStylesheet } from '@open-pencil/dom-css/export'
import {
  createDefaultNode,
  generateId,
  SceneGraph,
  type EnabledLibraryBinding,
  type SceneNode
} from '@open-pencil/scene-graph'

import { imageFilePath, imageHashFromPath, imageSourceResolver } from './assets'
import {
  ATTR,
  KALKA_FORMAT_ID,
  KALKA_FORMAT_VERSION,
  PAGES_DIR,
  PROJECT_FILE,
  STYLES_FILE,
  TOKENS_CSS_FILE,
  TOKENS_FILE
} from './constants'
import { readPageLayers } from './layers-read'
import { artboardPositions, pageWriteContext, writePageHTML } from './layers-write'
import { parseProject, type Project, type SavedPage } from './project'
import { decodeResidual, layerResidual, parseResidualAttribute } from './residual'
import { readTokensFile, tokensDocument } from './tokens-file'
import { decodeValue, encodeValue } from './values'
import { readVariables, savedCollections } from './variables'

/** A file of a Kalka folder: its path inside the folder, `/`-separated, and its content. */
export interface KalkaFile {
  path: string
  content: Uint8Array
}

const STYLES_CSS = `/*
 * Styles every page of this Kalka document shares. Kalka writes layer styles inline and keeps
 * the rules below; classes and @media rules for shared styles land here in a later version.
 */
[hidden] {
  display: none !important;
}

/* Layers written as an h1, a list or a button draw as their own CSS says. */
${HTML_TAG_RESET_CSS}
`

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

/** A page name as a file name: lowercase ASCII words joined by `-`. */
function slug(name: string): string {
  return (
    name
      .normalize('NFKD')
      .replaceAll(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/^-+|-+$/g, '') || 'page'
  )
}

function pageFiles(pages: readonly SceneNode[]): string[] {
  const taken = new Set<string>()
  return pages.map((page) => {
    const base = slug(page.name)
    let name = base
    for (let count = 2; taken.has(name); count++) name = `${base}-${count}`
    taken.add(name)
    return `${PAGES_DIR}/${name}.html`
  })
}

/** A page as `project.json` makes it before its props: what reading and writing both start from. */
function pageNode(id: string, name: string, internal: boolean): SceneNode {
  return createDefaultNode(() => id, 'CANVAS', {
    name,
    internalOnly: internal,
    width: 0,
    height: 0
  })
}

/** The document root as a new graph makes it. */
function rootNode(id: string): SceneNode {
  return createDefaultNode(() => id, 'FRAME', { name: 'Document', width: 0, height: 0 })
}

const PAGE_FLAGS = ['visible', 'locked'] as const

function pageResidual(page: SceneNode) {
  const read = pageNode(page.id, page.name, page.internalOnly)
  const residual = layerResidual(page, read) ?? {}
  for (const flag of PAGE_FLAGS) if (page[flag] !== read[flag]) residual[flag] = page[flag]
  return Object.keys(residual).length > 0 ? residual : null
}

function propsOf(residual: Record<string, unknown> | null) {
  const encoded = residual && encodeValue(residual)
  return encoded && typeof encoded === 'object' && !Array.isArray(encoded) ? encoded : undefined
}

function settings(graph: SceneGraph): NonNullable<Project['settings']> {
  const saved: NonNullable<Project['settings']> = {
    colorSpace: graph.documentColorSpace,
    activeModes: Object.fromEntries(graph.activeMode)
  }
  if (graph.enabledLibraries.size > 0) saved.libraries = encodeValue(graph.enabledLibraries)
  return saved
}

/**
 * The document as a Kalka folder: a page of HTML per page, `styles.css`, the variables as W3C
 * design tokens and the CSS variables they make, the images, and `project.json` tying them
 * together. Files come sorted by path, and saving an unchanged document writes the same bytes.
 */
export async function writeKalkaFolder(graph: SceneGraph): Promise<KalkaFile[]> {
  const files: KalkaFile[] = []
  const text = (path: string, content: string) =>
    files.push({ path, content: encoder.encode(content) })

  const context = pageWriteContext(graph)
  const pages = graph.getPages(true)
  const paths = pageFiles(pages)
  const savedPages: SavedPage[] = pages.map((page, index) => {
    text(paths[index], writePageHTML(graph, page, context))
    const artboards = [...artboardPositions(graph, page)].map(([id, { x, y }]) => ({ id, x, y }))
    const saved: SavedPage = { id: page.id, name: page.name, file: paths[index] }
    if (page.internalOnly) saved.internal = true
    if (artboards.length > 0) saved.artboards = artboards
    const props = propsOf(pageResidual(page))
    if (props) saved.props = props
    return saved
  })

  const tokens = json(tokensDocument(graph))
  text(TOKENS_FILE, tokens)
  text(TOKENS_CSS_FILE, (await tokenStylesheet(graph, { format: 'css' })).css)
  text(STYLES_FILE, STYLES_CSS)

  for (const [hash, bytes] of graph.images)
    files.push({ path: imageFilePath(hash, bytes), content: bytes })

  const root = graph.getNode(graph.rootId)
  const variables = savedCollections(graph, readTokensFile(tokens), new SceneGraph())
  const project: Project = {
    format: KALKA_FORMAT_ID,
    version: KALKA_FORMAT_VERSION,
    root: { id: graph.rootId },
    pages: savedPages,
    settings: settings(graph)
  }
  const rootProps = propsOf(root ? layerResidual(root, rootNode(root.id)) : null)
  if (rootProps) project.root.props = rootProps
  if (variables.length > 0) project.variables = variables
  text(PROJECT_FILE, json(project))
  return files.sort((a, b) => a.path.localeCompare(b.path, 'en'))
}

function applySettings(graph: SceneGraph, saved: Project['settings']): void {
  if (!saved) return
  if (saved.colorSpace) graph.documentColorSpace = saved.colorSpace
  for (const [collectionId, modeId] of Object.entries(saved.activeModes ?? {}))
    if (graph.variableCollections.has(collectionId)) graph.activeMode.set(collectionId, modeId)
  const libraries = saved.libraries === undefined ? undefined : decodeValue(saved.libraries)
  if (libraries instanceof Map)
    for (const [key, binding] of libraries)
      if (typeof key === 'string') graph.enabledLibraries.set(key, binding as EnabledLibraryBinding)
}

/** Pages a folder holds that `project.json` does not list, such as one written by hand. */
function unlistedPages(files: ReadonlyMap<string, Uint8Array>, project: Project): SavedPage[] {
  const listed = new Set(project.pages.map((page) => page.file))
  return [...files.keys()]
    .filter((path) => /^pages\/[^/]+\.html$/i.test(path) && !listed.has(path))
    .sort()
    .map((file) => ({ id: '', name: file.slice(PAGES_DIR.length + 1, -'.html'.length), file }))
}

function addPage(graph: SceneGraph, saved: SavedPage): SceneNode {
  const node = pageNode(saved.id, saved.name, saved.internal ?? false)
  if (saved.props) {
    Object.assign(node, decodeResidual(saved.props, node))
    // A page has no element to carry these flags, so its props hold them.
    for (const flag of PAGE_FLAGS) {
      const value = saved.props[flag]
      if (typeof value === 'boolean') node[flag] = value
    }
  }
  const fields = omit(node, ['id', 'childIds', 'parentId'])
  if (saved.id && !graph.getNode(saved.id))
    return graph.createNodeWithId(saved.id, 'CANVAS', graph.rootId, fields)
  return graph.createNode('CANVAS', graph.rootId, fields)
}

/**
 * Opens a Kalka folder from its files, by path relative to the folder. Pages are read from their
 * HTML, so edits made to it outside Kalka, and pages added by hand, open too.
 */
export function readKalkaFolder(files: ReadonlyMap<string, Uint8Array>): SceneGraph {
  const textOf = (path: string): string | undefined => {
    const bytes = files.get(path)
    return bytes && decoder.decode(bytes)
  }
  const projectText = textOf(PROJECT_FILE)
  if (projectText === undefined) throw new Error('Not a Kalka folder: project.json is missing')
  const project = parseProject(projectText)

  let rootPending = true
  const graph = new SceneGraph(() => {
    if (!rootPending) return generateId()
    rootPending = false
    return project.root.id
  })
  for (const page of graph.getPages(true)) graph.deleteNode(page.id)
  const root = graph.getNode(graph.rootId)
  if (root && project.root.props) Object.assign(root, decodeResidual(project.root.props, root))

  for (const [path, bytes] of files) {
    const hash = imageHashFromPath(path)
    if (hash !== null) graph.images.set(hash, bytes)
  }

  readVariables(graph, readTokensFile(textOf(TOKENS_FILE) ?? '{}'), project.variables ?? [])
  applySettings(graph, project.settings)

  const resolveImage = imageSourceResolver(graph.images)
  for (const saved of [...project.pages, ...unlistedPages(files, project)]) {
    const html = textOf(saved.file)
    if (html === undefined) throw new Error(`A page is missing: ${saved.file}`)
    const page = addPage(graph, saved)
    readPageLayers(graph, page, html, {
      artboards: new Map((saved.artboards ?? []).map(({ id, x, y }) => [id, { x, y }])),
      resolveImage,
      residual: (node, attrs) => {
        return ATTR.props in attrs ? parseResidualAttribute(attrs[ATTR.props], node) : null
      }
    })
  }
  return graph
}
