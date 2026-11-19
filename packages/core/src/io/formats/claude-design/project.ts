import { unzipSync } from 'fflate'
import * as v from 'valibot'

import type { DesignTokenSourceFile } from '#core/io/formats/design-tokens/read'
import type { KalkaFile } from '#core/io/formats/kalka/folder'

import { parseDesignComponent, type DesignComponent } from './component'

/** A file of an exported Claude Design project: its path in the folder or archive, and its bytes. */
export type ClaudeDesignFile = KalkaFile

/** One artboard of the canvas, back to front in `ClaudeDesignProject.boards`. */
export interface ClaudeDesignBoard {
  /** The component file, relative to the project folder (`Main.dc.html`). */
  file: string
  /** The component's name, as `<dc-import name>` calls it. */
  component: string
  title: string
  x: number
  y: number
  width: number
  height: number
  /** The canvas page it sits on; null for the first. */
  pageId: string | null
  /** A page that fills the window (`"expand": "fill"`): its height follows its content. */
  fill: boolean
  radius: number | null
}

/** A title or sticky note on the canvas. */
export interface ClaudeDesignNote {
  id: string
  x: number
  y: number
  text: string
  /** `title1` is a heading over several artboards; anything else is a sticky note. */
  title: boolean
  width: number | null
  pageId: string | null
  fill: string | null
}

export type ClaudeDesignPage = v.InferOutput<typeof PageSchema>

export interface ClaudeDesignProject {
  title: string
  pages: ClaudeDesignPage[]
  boards: ClaudeDesignBoard[]
  notes: ClaudeDesignNote[]
  /** Every component of the project by name, artboards and imported children alike. */
  components: Map<string, DesignComponent>
  /** Stylesheets and other text files of the project, by path relative to the project folder. */
  texts: Map<string, string>
  /** Uploaded images and fonts by their `/_blob/<id>` id. */
  blobs: Map<string, Uint8Array>
  /** The design systems' `tokens.json` files. */
  tokenFiles: DesignTokenSourceFile[]
  /** Whether the export carries its own runtime (`support.js`). */
  hasRuntime: boolean
}

const COMPONENT_SUFFIX = '.dc.html'
/** Gap between artboards placed in a row when the index does not say where they go. */
const BOARD_GAP = 80
const DEFAULT_BOARD = { width: 1440, height: 900 }

const NumberSchema = v.pipe(v.number(), v.finite())

const BoardSchema = v.object({
  x: NumberSchema,
  y: NumberSchema,
  w: v.pipe(NumberSchema, v.minValue(1)),
  h: v.pipe(NumberSchema, v.minValue(1)),
  title: v.optional(v.string()),
  page: v.optional(v.string()),
  expand: v.optional(v.string()),
  radius: v.optional(NumberSchema)
})

const PageSchema = v.object({ id: v.string(), name: v.string() })

const NoteSchema = v.object({
  x: NumberSchema,
  y: NumberSchema,
  text: v.string(),
  kind: v.optional(v.string()),
  w: v.optional(NumberSchema),
  maxW: v.optional(NumberSchema),
  page: v.optional(v.string()),
  fill: v.optional(v.string())
})

/**
 * The index, `project/canvas.json`. Each entry is checked on its own below, so one the reader
 * does not understand is skipped rather than failing the whole project.
 */
const CanvasSchema = v.pipe(
  v.string(),
  v.parseJson(),
  v.object({
    title: v.optional(v.string()),
    pages: v.optional(v.array(v.unknown()), []),
    boards: v.optional(v.record(v.string(), v.unknown()), {}),
    order: v.optional(v.array(v.string()), []),
    notes: v.optional(v.record(v.string(), v.unknown()), {})
  })
)

type Canvas = v.InferOutput<typeof CanvasSchema>

const decoder = new TextDecoder()

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.?\/+/, '')
}

function baseName(path: string): string {
  return path.split('/').pop() ?? path
}

/** An archive's files, without folders and the resource forks macOS adds to zips. */
export function claudeDesignFilesFromZip(data: Uint8Array): ClaudeDesignFile[] {
  return Object.entries(unzipSync(data))
    .filter(([path]) => !path.endsWith('/') && !path.split('/').includes('__MACOSX'))
    .map(([path, content]) => ({ path: normalizePath(path), content }))
}

/**
 * The project folder: the one holding `canvas.json`, preferably named `project`; else the
 * shallowest folder holding a component. Null when the files hold no Claude Design project.
 */
function projectRoot(paths: readonly string[]): string | null {
  const depth = (path: string) => path.split('/').length
  const indexes = paths
    .filter((path) => baseName(path) === 'canvas.json')
    .sort((a, b) => {
      const named =
        Number(!a.endsWith('project/canvas.json')) - Number(!b.endsWith('project/canvas.json'))
      return named || depth(a) - depth(b)
    })
  const index = indexes.at(0)
  if (index !== undefined) return index.slice(0, -'canvas.json'.length)
  const component = paths
    .filter((path) => path.endsWith(COMPONENT_SUFFIX))
    .sort((a, b) => depth(a) - depth(b))
    .at(0)
  if (component === undefined) return null
  return component.slice(0, component.length - baseName(component).length)
}

/** Whether these files hold a Claude Design project: an index or at least one component. */
export function isClaudeDesignProject(paths: Iterable<string>): boolean {
  return projectRoot([...paths].map(normalizePath)) !== null
}

function componentName(file: string): string {
  return file.slice(0, -COMPONENT_SUFFIX.length)
}

function readBoards(canvas: Canvas | null, components: Map<string, DesignComponent>) {
  const entries = new Map<string, v.InferOutput<typeof BoardSchema>>()
  for (const [file, value] of Object.entries(canvas?.boards ?? {})) {
    const parsed = v.safeParse(BoardSchema, value)
    if (parsed.success && components.has(componentName(normalizePath(file))))
      entries.set(normalizePath(file), parsed.output)
  }
  // `order` lists the boards back to front; any it leaves out come after, in index order.
  const ordered = [
    ...(canvas?.order ?? []).map(normalizePath).filter((file) => entries.has(file)),
    ...entries.keys()
  ]
  const boards: ClaudeDesignBoard[] = [...new Set(ordered)].flatMap((file) => {
    const entry = entries.get(file)
    if (!entry) return []
    return [
      {
        file,
        component: componentName(file),
        title: entry.title?.trim() || componentName(baseName(file)),
        x: entry.x,
        y: entry.y,
        width: entry.w,
        height: entry.h,
        pageId: entry.page ?? null,
        fill: entry.expand === 'fill',
        radius: entry.radius ?? null
      }
    ]
  })

  // Every component shows on the canvas, listed or not: the rest go in a row under the others.
  let x = 0
  const y = boards.length > 0 ? Math.max(...boards.map((board) => board.y + board.height)) + 120 : 0
  for (const [name, component] of components) {
    const file = `${name}${COMPONENT_SUFFIX}`
    if (entries.has(file) || name.startsWith('ds/')) continue
    const size = component.preview ?? DEFAULT_BOARD
    boards.push({
      file,
      component: name,
      title: component.title || baseName(name),
      x,
      y,
      width: size.width,
      height: size.height,
      pageId: null,
      fill: false,
      radius: null
    })
    x += size.width + BOARD_GAP
  }
  return boards
}

function readNotes(canvas: Canvas | null): ClaudeDesignNote[] {
  return Object.entries(canvas?.notes ?? {}).flatMap(([id, value]) => {
    const parsed = v.safeParse(NoteSchema, value)
    if (!parsed.success || !parsed.output.text.trim()) return []
    const note = parsed.output
    // Shapes, pen strokes and images drawn on the canvas are not notes.
    if (note.kind && note.kind !== 'title1') return []
    return [
      {
        id,
        x: note.x,
        y: note.y,
        text: note.text,
        title: note.kind === 'title1',
        width: note.maxW ?? note.w ?? null,
        pageId: note.page ?? null,
        fill: note.fill ?? null
      }
    ]
  })
}

function readPages(canvas: Canvas | null): ClaudeDesignPage[] {
  return (canvas?.pages ?? []).flatMap((value) => {
    const parsed = v.safeParse(PageSchema, value)
    return parsed.success ? [parsed.output] : []
  })
}

/** The id an uploaded file has in `/_blob/<id>`, from its path in the export. */
function blobId(path: string): string | null {
  const parts = path.split('/')
  const folder = parts.at(-2)
  if (folder !== '_blob') return null
  return baseName(path).replace(/\.[^.]+$/, '') || null
}

/**
 * Reads an exported Claude Design project (`project/canvas.json`, a `.dc.html` per artboard,
 * design systems under `project/ds/`, uploads under `_blob/`). Throws when the files hold none.
 */
export function readClaudeDesignProject(files: readonly ClaudeDesignFile[]): ClaudeDesignProject {
  const normalized = files.map((file) => ({ ...file, path: normalizePath(file.path) }))
  const root = projectRoot(normalized.map((file) => file.path))
  if (root === null)
    throw new Error('No Claude Design project found: no canvas.json or .dc.html file')

  const texts = new Map<string, string>()
  const components = new Map<string, DesignComponent>()
  const blobs = new Map<string, Uint8Array>()
  const tokenFiles: DesignTokenSourceFile[] = []
  let canvasText: string | null = null
  let hasRuntime = false

  for (const file of normalized) {
    const id = blobId(file.path)
    if (id) {
      blobs.set(id, file.content)
      continue
    }
    if (!file.path.startsWith(root)) continue
    const path = file.path.slice(root.length)
    if (path === 'canvas.json') canvasText = decoder.decode(file.content)
    else if (path === 'support.js') hasRuntime = true
    else if (path.endsWith(COMPONENT_SUFFIX))
      components.set(componentName(path), parseDesignComponent(decoder.decode(file.content)))
    else if (/^ds\/[^/]+\/tokens\.json$/.test(path))
      tokenFiles.push({ path, text: decoder.decode(file.content) })
    else if (/\.(css|json|svg)$/i.test(path)) texts.set(path, decoder.decode(file.content))
  }

  let canvas: Canvas | null = null
  if (canvasText !== null) {
    const parsed = v.safeParse(CanvasSchema, canvasText)
    if (!parsed.success) throw new Error('canvas.json is not a Claude Design canvas index')
    canvas = parsed.output
  }

  const folder = root
    .replace(/\/$/, '')
    .split('/')
    .findLast((part) => part !== 'project')
  return {
    title: canvas?.title?.trim() || folder || 'Claude Design',
    pages: readPages(canvas),
    boards: readBoards(canvas, components),
    notes: readNotes(canvas),
    components,
    texts,
    blobs,
    tokenFiles,
    hasRuntime
  }
}
