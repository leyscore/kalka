import type { CanvasKit } from 'canvaskit-wasm'

import type { SceneGraph } from '@kalka/scene-graph'
import type { RenderColorSpace } from '@kalka/scene-graph/color'

import type { SkiaRenderer } from '#core/canvas'

import type { RasterExportFormat } from './formats/raster'

export type IOFormatRole = 'native-document' | 'interchange-document' | 'derived-export'

export type IOFormatCategory = 'document' | 'raster' | 'vector' | 'code' | 'print'

export type IOTextEncoding = 'utf8'

export type IOBinaryData = Uint8Array
export type IOTextData = string
export type IOData = IOBinaryData | IOTextData

export interface ReadDocumentInput {
  name?: string
  mimeType?: string
  data: Uint8Array
}

export interface ReadDocumentResult {
  graph: SceneGraph
  sourceFormat: string
}

export interface ExportTargetDocument {
  scope: 'document'
}

export interface ExportTargetPage {
  scope: 'page'
  pageId: string
}

export interface ExportTargetSelection {
  scope: 'selection'
  nodeIds: string[]
}

export interface ExportTargetNode {
  scope: 'node'
  nodeId: string
}

export type ExportTarget =
  | ExportTargetDocument
  | ExportTargetPage
  | ExportTargetSelection
  | ExportTargetNode

export interface ExportRequest {
  graph: SceneGraph
  target: ExportTarget
  fileName?: string
}

/** What a raster export draws: layers of one page, at a scale, in a format. */
export interface NodeRasterRequest {
  graph: SceneGraph
  pageId: string
  nodeIds: string[]
  scale: number
  format: RasterExportFormat
  quality?: number
}

/**
 * Draws layers with the engine that draws the canvas. Returns null when it cannot, and the export
 * falls back to CanvasKit.
 */
export type NodeRasterizer = (request: NodeRasterRequest) => Promise<Uint8Array | null>

/** Prints layers to PDF with the engine that draws the canvas; null falls back to jsPDF. */
export type NodePrinter = (
  request: Pick<NodeRasterRequest, 'graph' | 'pageId' | 'nodeIds'>
) => Promise<Uint8Array | null>

export interface IOContext {
  canvasKit?: CanvasKit
  renderer?: SkiaRenderer
  rasterize?: NodeRasterizer
  printPDF?: NodePrinter
}

export interface FigWriteOptions {
  thumbnailPageId?: string
  renderThumbnail?: boolean
}

export interface RasterExportOptions {
  scale?: number
  quality?: number
  colorSpace?: RenderColorSpace
  format: RasterExportFormat
}

export interface SVGExportOptions {
  xmlDeclaration?: boolean
  colorSpace?: RenderColorSpace
}

/** A file written next to an export's main file, at a path relative to it. */
export interface ExportAsset {
  path: string
  content: IOData
}

export interface ExportResult {
  format: string
  mimeType: string
  extension: string
  data: IOData
  encoding?: IOTextEncoding
  /** Extra files the main file refers to, such as external images and fonts. */
  assets?: ExportAsset[]
  /** What the written file cannot carry, or its reader will not show, for the user to know. */
  warnings?: string[]
}

export interface HTMLExportOptions {
  html?: 'fragment' | 'standalone'
  style?: 'inline' | 'tailwind'
  assets?: 'inline' | 'external'
  /** `assets` ships web fonts with external assets. */
  fonts?: 'assets' | 'none'
  /** The base styles in the page, in a `reset.css` file of their own, or left out. */
  reset?: 'inline' | 'file' | 'none'
  /** Indented HTML and one CSS declaration per line; exported files default to it. */
  pretty?: boolean
  /**
   * Marks each element with the layer it came from, for tools that map the HTML back to the
   * document. Exported files leave it out: it is editor data, not part of the page.
   */
  sourceIds?: boolean
}

export interface IOFormatSupport {
  readDocument?: boolean
  writeDocument?: boolean
  exportDocument?: boolean
  exportPage?: boolean
  exportSelection?: boolean
  exportNode?: boolean
}

export interface IOFormatExportOptions {
  scale?: boolean
  quality?: boolean
  colorSpace?: boolean
}

export interface IOFormatAdapter<Id extends string = string> {
  id: Id
  label: string
  role: IOFormatRole
  category: IOFormatCategory
  extensions: string[]
  mimeTypes: string[]
  support: IOFormatSupport
  exportOptions?: IOFormatExportOptions

  matchesFile?(fileName: string, mimeType?: string): boolean

  readDocument?(input: ReadDocumentInput, context?: IOContext): Promise<ReadDocumentResult>
  writeDocument?(graph: SceneGraph, options?: unknown, context?: IOContext): Promise<ExportResult>
  exportContent?(
    request: ExportRequest,
    options?: unknown,
    context?: IOContext
  ): Promise<ExportResult>
}
