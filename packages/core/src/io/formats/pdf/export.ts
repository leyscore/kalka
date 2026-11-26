import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import { computeContentBounds } from '#core/io/formats/raster'
import { renderNodesToSVG } from '#core/io/formats/svg'

export interface PDFExportOptions {
  title?: string
}

export async function renderNodesToPDF(
  graph: SceneGraph,
  pageId: string,
  nodeIds: string[],
  options: PDFExportOptions = {}
): Promise<Uint8Array | null> {
  const svg = renderNodesToSVG(graph, pageId, nodeIds, { xmlDeclaration: false })
  if (!svg) return null

  const bounds = computeContentBounds(graph, nodeIds)
  if (!bounds) return null

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  if (width <= 0 || height <= 0) return null

  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')])

  const doc = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [width, height],
    compress: true
  })

  if (options.title) {
    doc.setProperties({ title: options.title })
  }

  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svg, 'image/svg+xml')
  const svgElement = svgDoc.documentElement

  const parseError = svgDoc.querySelector('parsererror')
  if (parseError) return null

  await svg2pdf(svgElement, doc, { x: 0, y: 0, width, height })

  const buffer = doc.output('arraybuffer')
  return new Uint8Array(buffer)
}

/** Top-level layers Figma's Export frames to PDF prints, one to a page. */
const PRINTED_FRAME_TYPES: ReadonlySet<SceneNode['type']> = new Set([
  'FRAME',
  'COMPONENT',
  'COMPONENT_SET',
  'INSTANCE',
  'SECTION'
])

/** A frame of the document and the page it is on. */
export interface DocumentFrame {
  pageId: string
  nodeId: string
}

/** Every visible top-level frame of the document, page by page, in the layers panel's order. */
export function documentFrames(graph: SceneGraph): DocumentFrame[] {
  return graph.getPages().flatMap((page) =>
    graph
      .getChildren(page.id)
      .filter((node) => node.visible && PRINTED_FRAME_TYPES.has(node.type))
      .toReversed()
      .map((node) => ({ pageId: page.id, nodeId: node.id }))
  )
}

/**
 * One PDF with a page per frame, each the size of its frame, as Figma's File › Export frames to
 * PDF; null when no frame has a size.
 */
export async function renderFramesToPDF(
  graph: SceneGraph,
  frames: readonly DocumentFrame[],
  options: PDFExportOptions = {}
): Promise<Uint8Array | null> {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')])
  const parser = new DOMParser()
  let doc: InstanceType<typeof jsPDF> | null = null
  for (const frame of frames) {
    const bounds = computeContentBounds(graph, [frame.nodeId])
    if (!bounds) continue
    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY
    if (width <= 0 || height <= 0) continue
    const svg = renderNodesToSVG(graph, frame.pageId, [frame.nodeId], { xmlDeclaration: false })
    if (!svg) continue
    const svgDoc = parser.parseFromString(svg, 'image/svg+xml')
    if (svgDoc.querySelector('parsererror')) continue
    const orientation = width > height ? 'landscape' : 'portrait'
    if (doc) doc.addPage([width, height], orientation)
    else doc = new jsPDF({ orientation, unit: 'pt', format: [width, height], compress: true })
    await svg2pdf(svgDoc.documentElement, doc, { x: 0, y: 0, width, height })
  }
  if (!doc) return null
  if (options.title) doc.setProperties({ title: options.title })
  return new Uint8Array(doc.output('arraybuffer'))
}
