import type { SkiaRenderer } from './renderer'
import type { SceneGraph } from './scene-graph'
import type { CanvasKit } from 'canvaskit-wasm'

export type ExportFormat = 'PNG' | 'JPG' | 'WEBP'

interface RenderOptions {
  scale: number
  format: ExportFormat
  quality?: number
}

function computeContentBounds(
  graph: SceneGraph,
  nodeIds: string[]
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  for (const id of nodeIds) {
    const node = graph.getNode(id)
    if (!node || !node.visible) continue
    const abs = graph.getAbsolutePosition(id)
    minX = Math.min(minX, abs.x)
    minY = Math.min(minY, abs.y)
    maxX = Math.max(maxX, abs.x + node.width)
    maxY = Math.max(maxY, abs.y + node.height)
  }

  if (!isFinite(minX)) return null
  return { minX, minY, maxX, maxY }
}

function renderToSurface(
  ck: CanvasKit,
  renderer: SkiaRenderer,
  graph: SceneGraph,
  pageId: string,
  width: number,
  height: number,
  setup: (canvas: import('canvaskit-wasm').Canvas) => void
): Uint8Array | null {
  const surface = ck.MakeSurface(width, height)
  if (!surface) return null

  try {
    const canvas = surface.getCanvas()
    setup(canvas)
    renderer.renderSceneToCanvas(canvas, graph, pageId)
    surface.flush()
    const image = surface.makeImageSnapshot()
    const encoded = image.encodeToBytes(ck.ImageFormat.PNG, 100)
    image.delete()
    return encoded ? new Uint8Array(encoded) : null
  } finally {
    surface.delete()
  }
}

function mimeForFormat(format: ExportFormat): string {
  switch (format) {
    case 'JPG':
      return 'image/jpeg'
    case 'WEBP':
      return 'image/webp'
    default:
      return 'image/png'
  }
}

async function reencodeImage(
  pngBytes: Uint8Array,
  format: ExportFormat,
  quality: number
): Promise<Uint8Array> {
  if (format === 'PNG') return pngBytes

  const blob = new Blob([new Uint8Array(pngBytes)], { type: 'image/png' })
  const bitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) return pngBytes

  if (format === 'JPG') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, bitmap.width, bitmap.height)
  }

  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const outBlob = await canvas.convertToBlob({
    type: mimeForFormat(format),
    quality: quality / 100
  })
  return new Uint8Array(await outBlob.arrayBuffer())
}

export async function renderNodesToImage(
  ck: CanvasKit,
  renderer: SkiaRenderer,
  graph: SceneGraph,
  pageId: string,
  nodeIds: string[],
  options: RenderOptions
): Promise<Uint8Array | null> {
  const bounds = computeContentBounds(graph, nodeIds)
  if (!bounds) return null

  const contentW = bounds.maxX - bounds.minX
  const contentH = bounds.maxY - bounds.minY
  if (contentW <= 0 || contentH <= 0) return null

  const pixelW = Math.ceil(contentW * options.scale)
  const pixelH = Math.ceil(contentH * options.scale)
  if (pixelW <= 0 || pixelH <= 0) return null

  const png = renderToSurface(ck, renderer, graph, pageId, pixelW, pixelH, (canvas) => {
    canvas.clear(ck.TRANSPARENT)
    canvas.scale(options.scale, options.scale)
    canvas.translate(-bounds.minX, -bounds.minY)
  })
  if (!png) return null

  const quality = options.quality ?? (options.format === 'PNG' ? 100 : 90)
  return reencodeImage(png, options.format, quality)
}

export function renderThumbnail(
  ck: CanvasKit,
  renderer: SkiaRenderer,
  graph: SceneGraph,
  pageId: string,
  width: number,
  height: number
): Uint8Array | null {
  const page = graph.getNode(pageId)
  if (!page || page.childIds.length === 0) return null

  const bounds = computeContentBounds(graph, page.childIds)
  if (!bounds) return null

  const contentW = bounds.maxX - bounds.minX
  const contentH = bounds.maxY - bounds.minY
  if (contentW <= 0 || contentH <= 0) return null

  const scale = Math.min(width / contentW, height / contentH, 2)

  return renderToSurface(ck, renderer, graph, pageId, width, height, (canvas) => {
    canvas.clear(ck.Color4f(renderer.pageColor.r, renderer.pageColor.g, renderer.pageColor.b, 1))
    const offsetX = (width - contentW * scale) / 2 - bounds.minX * scale
    const offsetY = (height - contentH * scale) / 2 - bounds.minY * scale
    canvas.translate(offsetX, offsetY)
    canvas.scale(scale, scale)
  })
}
