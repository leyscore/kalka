import { zipSync, deflateSync } from 'fflate'

import { IS_TAURI } from '@/constants'
import { initCodec, getCompiledSchema, getSchemaBytes } from '@/kiwi/codec'

import { encodeVectorNetworkBlob } from './vector'

import type { SkiaRenderer } from './renderer'
import type { SceneGraph, SceneNode } from './scene-graph'
import type { NodeChange, Paint } from '@/kiwi/codec'
import type { CanvasKit } from 'canvaskit-wasm'

const THUMBNAIL_1X1 = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  ),
  (c) => c.charCodeAt(0)
)

type KiwiNodeChange = NodeChange & Record<string, unknown>

function mapToFigmaType(type: SceneNode['type']): string {
  switch (type) {
    case 'FRAME':
      return 'FRAME'
    case 'RECTANGLE':
      return 'RECTANGLE'
    case 'ROUNDED_RECTANGLE':
      return 'ROUNDED_RECTANGLE'
    case 'ELLIPSE':
      return 'ELLIPSE'
    case 'TEXT':
      return 'TEXT'
    case 'LINE':
      return 'LINE'
    case 'STAR':
      return 'STAR'
    case 'POLYGON':
      return 'REGULAR_POLYGON'
    case 'VECTOR':
      return 'VECTOR'
    case 'GROUP':
      return 'FRAME'
    case 'SECTION':
      return 'SECTION'
    case 'COMPONENT':
      return 'COMPONENT'
    case 'COMPONENT_SET':
      return 'COMPONENT_SET'
    case 'INSTANCE':
      return 'INSTANCE'
    case 'CONNECTOR':
      return 'CONNECTOR'
    case 'SHAPE_WITH_TEXT':
      return 'SHAPE_WITH_TEXT'
    default:
      return 'RECTANGLE'
  }
}

function fractionalPosition(index: number): string {
  return String.fromCharCode('!'.charCodeAt(0) + index)
}

function sceneNodeToKiwi(
  node: SceneNode,
  parentGuid: { sessionID: number; localID: number },
  childIndex: number,
  localIdCounter: { value: number },
  graph: SceneGraph,
  blobs: Uint8Array[]
): KiwiNodeChange[] {
  const localID = localIdCounter.value++
  const guid = { sessionID: 1, localID }
  const cos = Math.cos((node.rotation * Math.PI) / 180)
  const sin = Math.sin((node.rotation * Math.PI) / 180)

  const fillPaints = node.fills.map((f) => {
    const paint: Paint = {
      type: f.type,
      color: f.color,
      opacity: f.opacity,
      visible: f.visible,
      blendMode: f.blendMode ?? 'NORMAL'
    }
    if (f.gradientStops) {
      paint.stops = f.gradientStops.map((s) => ({ color: s.color, position: s.position }))
    }
    if (f.gradientTransform) paint.transform = f.gradientTransform
    if (f.imageHash) paint.image = { hash: f.imageHash }
    if (f.imageScaleMode) paint.imageScaleMode = f.imageScaleMode
    if (f.imageTransform) paint.transform = f.imageTransform
    return paint
  })

  const strokePaints = node.strokes.map((s) => ({
    type: 'SOLID' as const,
    color: s.color,
    opacity: s.opacity,
    visible: s.visible,
    blendMode: 'NORMAL' as const
  }))

  const nc: KiwiNodeChange = {
    guid,
    parentIndex: { guid: parentGuid, position: fractionalPosition(childIndex) },
    type: mapToFigmaType(node.type),
    name: node.name,
    visible: node.visible,
    opacity: node.opacity,
    phase: 'CREATED',
    size: { x: node.width, y: node.height },
    transform: { m00: cos, m01: -sin, m02: node.x, m10: sin, m11: cos, m12: node.y },
    strokeWeight: node.strokes.length > 0 ? node.strokes[0].weight : 1,
    strokeAlign: 'INSIDE'
  }

  if (fillPaints.length > 0) nc.fillPaints = fillPaints
  if (strokePaints.length > 0) nc.strokePaints = strokePaints

  if (node.cornerRadius > 0 || node.independentCorners) {
    nc.cornerRadius = node.cornerRadius
    nc.rectangleCornerRadiiIndependent = node.independentCorners
    nc.rectangleTopLeftCornerRadius = node.independentCorners
      ? node.topLeftRadius
      : node.cornerRadius
    nc.rectangleTopRightCornerRadius = node.independentCorners
      ? node.topRightRadius
      : node.cornerRadius
    nc.rectangleBottomLeftCornerRadius = node.independentCorners
      ? node.bottomLeftRadius
      : node.cornerRadius
    nc.rectangleBottomRightCornerRadius = node.independentCorners
      ? node.bottomRightRadius
      : node.cornerRadius
  }

  if (node.cornerSmoothing > 0) {
    nc.cornerSmoothing = node.cornerSmoothing
  }

  if (node.effects.length > 0) {
    nc.effects = node.effects.map((e) => ({
      type: e.type,
      color: e.color,
      offset: e.offset,
      radius: e.radius,
      spread: e.spread,
      visible: e.visible
    }))
  }

  if (node.type === 'TEXT') {
    nc.fontSize = node.fontSize
    nc.fontName = {
      family: node.fontFamily,
      style: node.fontWeight >= 700 ? 'Bold' : 'Regular',
      postscript: ''
    }
    nc.textData = { characters: node.text }
    nc.textAutoResize = 'WIDTH_AND_HEIGHT'
    nc.textAlignHorizontal = node.textAlignHorizontal
    if (node.lineHeight != null) nc.lineHeight = { value: node.lineHeight, units: 'PIXELS' }
    if (node.letterSpacing !== 0) nc.letterSpacing = { value: node.letterSpacing, units: 'PIXELS' }
  }

  if (node.type === 'FRAME' || node.type === 'GROUP') {
    nc.frameMaskDisabled = node.type === 'GROUP'
    if (node.clipsContent) nc.clipsContent = true
  }

  if (node.layoutMode !== 'NONE') {
    nc.stackMode = node.layoutMode
    nc.stackSpacing = node.itemSpacing
    nc.stackVerticalPadding = node.paddingTop
    nc.stackHorizontalPadding = node.paddingLeft
    nc.stackPaddingBottom = node.paddingBottom
    nc.stackPaddingRight = node.paddingRight
    nc.stackPrimarySizing = node.primaryAxisSizing === 'HUG' ? 'RESIZE_TO_FIT' : 'FIXED'
    nc.stackCounterSizing = node.counterAxisSizing === 'HUG' ? 'RESIZE_TO_FIT' : 'FIXED'
    nc.stackPrimaryAlignItems = node.primaryAxisAlign
    nc.stackCounterAlignItems = node.counterAxisAlign
    if (node.layoutWrap === 'WRAP') nc.stackWrap = 'WRAP'
    if (node.counterAxisSpacing > 0) nc.stackCounterSpacing = node.counterAxisSpacing
  }

  if (node.layoutPositioning === 'ABSOLUTE') nc.stackPositioning = 'ABSOLUTE'
  if (node.layoutGrow > 0) nc.stackChildPrimaryGrow = node.layoutGrow

  if (node.vectorNetwork && node.type === 'VECTOR') {
    const blobIdx = blobs.length
    blobs.push(encodeVectorNetworkBlob(node.vectorNetwork))
    nc.vectorData = {
      vectorNetworkBlob: blobIdx,
      normalizedSize: { x: node.width, y: node.height }
    }
  }

  const result: KiwiNodeChange[] = [nc]
  const children = graph.getChildren(node.id)
  for (let i = 0; i < children.length; i++) {
    result.push(...sceneNodeToKiwi(children[i], guid, i, localIdCounter, graph, blobs))
  }

  return result
}

function buildFigKiwi(schemaDeflated: Uint8Array, dataCompressed: Uint8Array): Uint8Array {
  const FIG_KIWI_VERSION = 106
  const total = 8 + 4 + 4 + schemaDeflated.length + 4 + dataCompressed.length
  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)

  out.set(new TextEncoder().encode('fig-kiwi'), 0)
  view.setUint32(8, FIG_KIWI_VERSION, true)

  let offset = 12
  view.setUint32(offset, schemaDeflated.length, true)
  offset += 4
  out.set(schemaDeflated, offset)
  offset += schemaDeflated.length

  view.setUint32(offset, dataCompressed.length, true)
  offset += 4
  out.set(dataCompressed, offset)

  return out
}

const THUMBNAIL_WIDTH = 400
const THUMBNAIL_HEIGHT = 225

function generateThumbnail(
  ck: CanvasKit,
  renderer: SkiaRenderer,
  graph: SceneGraph,
  pageId: string
): Uint8Array | null {
  const page = graph.getNode(pageId)
  if (!page || page.childIds.length === 0) return null

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (const childId of page.childIds) {
    const node = graph.getNode(childId)
    if (!node || !node.visible) continue
    const abs = graph.getAbsolutePosition(childId)
    minX = Math.min(minX, abs.x)
    minY = Math.min(minY, abs.y)
    maxX = Math.max(maxX, abs.x + node.width)
    maxY = Math.max(maxY, abs.y + node.height)
  }
  if (!isFinite(minX)) return null

  const contentW = maxX - minX
  const contentH = maxY - minY
  if (contentW <= 0 || contentH <= 0) return null

  const scale = Math.min(THUMBNAIL_WIDTH / contentW, THUMBNAIL_HEIGHT / contentH, 2)
  const surface = ck.MakeSurface(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
  if (!surface) return null

  try {
    const canvas = surface.getCanvas()
    canvas.clear(ck.Color4f(renderer.pageColor.r, renderer.pageColor.g, renderer.pageColor.b, 1))

    const offsetX = (THUMBNAIL_WIDTH - contentW * scale) / 2 - minX * scale
    const offsetY = (THUMBNAIL_HEIGHT - contentH * scale) / 2 - minY * scale
    canvas.translate(offsetX, offsetY)
    canvas.scale(scale, scale)

    renderer.renderSceneToCanvas(canvas, graph, pageId)

    surface.flush()
    const image = surface.makeImageSnapshot()
    const encoded = image.encodeToBytes(ck.ImageFormat.PNG, 90)
    image.delete()
    return encoded ? new Uint8Array(encoded) : null
  } finally {
    surface.delete()
  }
}

export async function exportFigFile(
  graph: SceneGraph,
  ck?: CanvasKit,
  renderer?: SkiaRenderer,
  pageId?: string
): Promise<Uint8Array> {
  await initCodec()
  const compiled = getCompiledSchema()
  const schemaDeflated = deflateSync(getSchemaBytes())

  const docGuid = { sessionID: 0, localID: 0 }
  const localIdCounter = { value: 2 }

  const nodeChanges: KiwiNodeChange[] = [
    {
      guid: docGuid,
      type: 'DOCUMENT',
      name: 'Document',
      visible: true,
      opacity: 1,
      phase: 'CREATED',
      transform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 },
      strokeWeight: 1,
      strokeAlign: 'CENTER',
      strokeJoin: 'MITER',
      documentColorProfile: 'SRGB'
    }
  ]

  const blobs: Uint8Array[] = []
  const pages = graph.getPages()

  for (let p = 0; p < pages.length; p++) {
    const page = pages[p]
    const canvasLocalID = localIdCounter.value++
    const canvasGuid = { sessionID: 0, localID: canvasLocalID }

    nodeChanges.push({
      guid: canvasGuid,
      parentIndex: { guid: docGuid, position: fractionalPosition(p) },
      type: 'CANVAS',
      name: page.name,
      visible: true,
      opacity: 1,
      phase: 'CREATED',
      transform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 },
      strokeWeight: 1,
      strokeAlign: 'CENTER',
      strokeJoin: 'MITER',
      backgroundOpacity: 1,
      backgroundColor: { r: 0.96, g: 0.96, b: 0.96, a: 1 },
      backgroundEnabled: true
    })

    const children = graph.getChildren(page.id)
    for (let i = 0; i < children.length; i++) {
      nodeChanges.push(...sceneNodeToKiwi(children[i], canvasGuid, i, localIdCounter, graph, blobs))
    }
  }

  const msg: Record<string, unknown> = {
    type: 'NODE_CHANGES',
    sessionID: 0,
    ackID: 0,
    nodeChanges
  }

  if (blobs.length > 0) {
    msg.blobs = blobs.map((bytes) => ({ bytes }))
  }

  const kiwiData = compiled.encodeMessage(msg)

  const currentPageId = pageId ?? pages[0]?.id
  const thumbnailPng =
    (ck && renderer && currentPageId
      ? generateThumbnail(ck, renderer, graph, currentPageId)
      : null) ?? THUMBNAIL_1X1

  const metaJson = JSON.stringify({
    version: 1,
    app: 'OpenPencil',
    createdAt: new Date().toISOString()
  })

  if (IS_TAURI) {
    const { invoke } = await import('@tauri-apps/api/core')
    return new Uint8Array(
      await invoke<number[]>('build_fig_file', {
        schemaDeflated: Array.from(schemaDeflated),
        kiwiData: Array.from(kiwiData),
        thumbnailPng: Array.from(thumbnailPng),
        metaJson
      })
    )
  }

  const canvasData = buildFigKiwi(schemaDeflated, deflateSync(kiwiData))
  return zipSync({
    'canvas.fig': [canvasData, { level: 0 }],
    'thumbnail.png': [thumbnailPng, { level: 0 }],
    'meta.json': new TextEncoder().encode(metaJson)
  })
}
