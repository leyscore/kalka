import { zipSync } from 'fflate'
import { decodeBinarySchema, compileSchema, ByteBuffer } from '../kiwi/kiwi-schema'
import { inflateSync } from 'fflate'
import { encodeVectorNetworkBlob } from './vector'

import type { SceneGraph, SceneNode, Color } from './scene-graph'

interface KiwiNodeChange {
  guid: { sessionID: number; localID: number }
  parentIndex?: { guid: { sessionID: number; localID: number }; position: string }
  type?: string
  name?: string
  visible?: boolean
  opacity?: number
  size?: { x: number; y: number }
  transform?: { m00: number; m01: number; m02: number; m10: number; m11: number; m12: number }
  fillPaints?: Array<{
    type: string
    color?: Color
    opacity?: number
    visible?: boolean
    blendMode?: string
  }>
  strokePaints?: Array<{
    type: string
    color?: Color
    opacity?: number
    visible?: boolean
    blendMode?: string
  }>
  strokeWeight?: number
  strokeAlign?: string
  cornerRadius?: number
  rectangleCornerRadiiIndependent?: boolean
  rectangleTopLeftCornerRadius?: number
  rectangleTopRightCornerRadius?: number
  rectangleBottomLeftCornerRadius?: number
  rectangleBottomRightCornerRadius?: number
  fontSize?: number
  fontName?: { family: string; style: string; postscript?: string }
  textData?: { characters: string; lines?: unknown[] }
  textAlignHorizontal?: string
  textAutoResize?: string
  phase?: string
  [key: string]: unknown
}

type CompiledSchema = ReturnType<typeof compileSchema>

let cachedSchema: CompiledSchema | null = null
let cachedSchemaDeflated: Uint8Array | null = null

async function getSchema(): Promise<{ compiled: CompiledSchema; deflated: Uint8Array }> {
  if (cachedSchema && cachedSchemaDeflated) {
    return { compiled: cachedSchema, deflated: cachedSchemaDeflated }
  }
  const resp = await fetch('/figma-schema.bin')
  const deflated = new Uint8Array(await resp.arrayBuffer())
  const schemaBytes = inflateSync(deflated)
  const schema = decodeBinarySchema(new ByteBuffer(schemaBytes))
  cachedSchema = compileSchema(schema)
  cachedSchemaDeflated = deflated
  return { compiled: cachedSchema, deflated }
}

function mapToFigmaType(type: SceneNode['type']): string {
  switch (type) {
    case 'FRAME': return 'FRAME'
    case 'RECTANGLE': return 'RECTANGLE'
    case 'ELLIPSE': return 'ELLIPSE'
    case 'TEXT': return 'TEXT'
    case 'LINE': return 'LINE'
    case 'STAR': return 'STAR'
    case 'POLYGON': return 'REGULAR_POLYGON'
    case 'VECTOR': return 'VECTOR'
    case 'GROUP': return 'FRAME'
    case 'SECTION': return 'SECTION'
    default: return 'RECTANGLE'
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

  const fillPaints = node.fills
    .filter((f) => f.type === 'SOLID')
    .map((f) => ({
      type: 'SOLID' as const,
      color: f.color,
      opacity: f.opacity,
      visible: f.visible,
      blendMode: 'NORMAL' as const
    }))

  const strokePaints = node.strokes
    .filter((s) => s.visible)
    .map((s) => ({
      type: 'SOLID' as const,
      color: s.color,
      opacity: s.opacity,
      visible: true,
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
    nc.rectangleTopLeftCornerRadius = node.independentCorners ? node.topLeftRadius : node.cornerRadius
    nc.rectangleTopRightCornerRadius = node.independentCorners ? node.topRightRadius : node.cornerRadius
    nc.rectangleBottomLeftCornerRadius = node.independentCorners ? node.bottomLeftRadius : node.cornerRadius
    nc.rectangleBottomRightCornerRadius = node.independentCorners ? node.bottomRightRadius : node.cornerRadius
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
    nc.fontName = { family: node.fontFamily, style: node.fontWeight >= 700 ? 'Bold' : 'Regular', postscript: '' }
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

async function buildFigKiwi(schemaDeflated: Uint8Array, dataRaw: Uint8Array): Promise<Uint8Array> {
  const { ZstdCodec } = await import('zstd-wasm')
  const zstd = await ZstdCodec.run()
  const dataCompressed = zstd.compress(dataRaw)
  const FIG_KIWI_VERSION = 106

  const total = 8 + 4 + 4 + schemaDeflated.length + 4 + dataCompressed.length
  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)

  const magic = new TextEncoder().encode('fig-kiwi')
  out.set(magic, 0)
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

export async function exportFigFile(graph: SceneGraph): Promise<Uint8Array> {
  const { compiled, deflated: schemaDeflated } = await getSchema()

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
      transform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }
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
      transform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }
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

  const dataRaw = compiled.encodeMessage(msg)
  const canvasData = await buildFigKiwi(schemaDeflated, dataRaw)

  const meta = JSON.stringify({
    version: 1,
    app: 'OpenPencil',
    createdAt: new Date().toISOString()
  })

  return zipSync({
    'canvas.fig': canvasData,
    'meta.json': new TextEncoder().encode(meta)
  })
}
