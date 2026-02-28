import { inflateSync, deflateSync } from 'fflate'

import { initCodec, getCompiledSchema, getSchemaBytes } from '@/kiwi/codec'
import { decodeBinarySchema, compileSchema, ByteBuffer } from '@/kiwi/kiwi-schema'

import { decodeVectorNetworkBlob, encodeVectorNetworkBlob } from './vector'

import type {
  SceneGraph,
  SceneNode,
  Fill,
  Stroke,
  LayoutMode,
  LayoutSizing,
  LayoutAlign,
  LayoutCounterAlign,
  VectorNetwork
} from './scene-graph'
import type { NodeChange as KiwiNodeChange } from '@/kiwi/codec'

interface FigmaClipboardMeta {
  fileKey: string
  pasteID: number
  dataType: string
}

export async function prefetchFigmaSchema(): Promise<void> {
  await initCodec()
}

function parseFigKiwi(
  binary: Uint8Array
): { schemaDeflated: Uint8Array; dataRaw: Uint8Array } | null {
  const header = new TextDecoder().decode(binary.slice(0, 8))
  if (header !== 'fig-kiwi') return null

  const view = new DataView(binary.buffer, binary.byteOffset, binary.byteLength)
  let offset = 12

  const chunks: Uint8Array[] = []
  while (offset < binary.length) {
    const chunkLen = view.getUint32(offset, true)
    offset += 4
    chunks.push(binary.slice(offset, offset + chunkLen))
    offset += chunkLen
  }
  if (chunks.length < 2) return null

  const schemaDeflated = chunks[0]
  let dataRaw: Uint8Array
  try {
    dataRaw = inflateSync(chunks[1])
  } catch {
    // Zstd fallback (lazy import)
    return null
  }

  return { schemaDeflated, dataRaw }
}

async function parseFigKiwiWithZstd(
  binary: Uint8Array
): Promise<{ schemaDeflated: Uint8Array; dataRaw: Uint8Array } | null> {
  const header = new TextDecoder().decode(binary.slice(0, 8))
  if (header !== 'fig-kiwi') return null

  const view = new DataView(binary.buffer, binary.byteOffset, binary.byteLength)
  let offset = 12

  const chunks: Uint8Array[] = []
  while (offset < binary.length) {
    const chunkLen = view.getUint32(offset, true)
    offset += 4
    chunks.push(binary.slice(offset, offset + chunkLen))
    offset += chunkLen
  }
  if (chunks.length < 2) return null

  let dataRaw: Uint8Array
  try {
    dataRaw = inflateSync(chunks[1])
  } catch {
    const fzstd = await import('fzstd')
    dataRaw = fzstd.decompress(chunks[1])
  }

  return { schemaDeflated: chunks[0], dataRaw }
}

function buildFigKiwi(schemaDeflated: Uint8Array, dataRaw: Uint8Array): Uint8Array {
  const dataDeflated = deflateSync(dataRaw)
  const FIG_KIWI_VERSION = 106

  const total = 8 + 4 + 4 + schemaDeflated.length + 4 + dataDeflated.length
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

  view.setUint32(offset, dataDeflated.length, true)
  offset += 4
  out.set(dataDeflated, offset)

  return out
}

function binaryToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBinary(b64: string): Uint8Array {
  const raw = atob(b64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i)
  }
  return bytes
}

// --- Paste from Figma ---

export async function parseFigmaClipboard(
  html: string
): Promise<{ nodes: KiwiNodeChange[]; meta: FigmaClipboardMeta; blobs: Uint8Array[] } | null> {
  const metaMatch = html.match(/\(figmeta\)(.*?)\(\/figmeta\)/)
  const bufMatch = html.match(/\(figma\)(.*?)\(\/figma\)/s)
  if (!metaMatch || !bufMatch) return null

  const meta: FigmaClipboardMeta = JSON.parse(atob(metaMatch[1]))
  const binary = base64ToBinary(bufMatch[1])

  const parsed = parseFigKiwi(binary) ?? (await parseFigKiwiWithZstd(binary))
  if (!parsed) return null

  const schemaBytes = inflateSync(parsed.schemaDeflated)
  const schema = decodeBinarySchema(new ByteBuffer(schemaBytes))
  const compiled = compileSchema(schema)
  const msg = compiled.decodeMessage(parsed.dataRaw) as {
    nodeChanges?: KiwiNodeChange[]
    blobs?: Array<{ bytes: Uint8Array | Record<string, number> }>
  }

  const blobs: Uint8Array[] = (msg.blobs ?? []).map((b) =>
    b.bytes instanceof Uint8Array ? b.bytes : new Uint8Array(Object.values(b.bytes) as number[])
  )

  return { nodes: msg.nodeChanges ?? [], meta, blobs }
}

function decodeVectorData(nc: KiwiNodeChange, blobs: Uint8Array[]): VectorNetwork | null {
  const vectorData = nc.vectorData as
    | {
        vectorNetworkBlob?: number
        normalizedSize?: { x: number; y: number }
        styleOverrideTable?: Array<{ styleID: number; handleMirroring?: string }>
      }
    | undefined

  if (!vectorData || vectorData.vectorNetworkBlob === undefined) return null

  const blobIdx = vectorData.vectorNetworkBlob
  if (blobIdx < 0 || blobIdx >= blobs.length) return null

  try {
    return decodeVectorNetworkBlob(blobs[blobIdx], vectorData.styleOverrideTable)
  } catch {
    return null
  }
}

export function importClipboardNodes(
  nodeChanges: KiwiNodeChange[],
  graph: SceneGraph,
  targetParentId: string,
  offsetX = 0,
  offsetY = 0,
  blobs: Uint8Array[] = []
): string[] {
  const guidMap = new Map<string, KiwiNodeChange>()
  const parentMap = new Map<string, string>()
  for (const nc of nodeChanges) {
    if (!nc.guid) continue
    const id = `${nc.guid.sessionID}:${nc.guid.localID}`
    guidMap.set(id, nc)
    if (nc.parentIndex?.guid) {
      parentMap.set(id, `${nc.parentIndex.guid.sessionID}:${nc.parentIndex.guid.localID}`)
    }
  }

  const skipTypes = new Set(['DOCUMENT', 'CANVAS'])
  const topLevel: string[] = []
  for (const [id, nc] of guidMap) {
    if (skipTypes.has(nc.type ?? '')) continue
    const parentId = parentMap.get(id)
    if (!parentId || !guidMap.has(parentId) || skipTypes.has(guidMap.get(parentId)?.type ?? '')) {
      topLevel.push(id)
    }
  }

  const created = new Map<string, string>()
  const createdIds: string[] = []

  function createNode(figmaId: string, ourParentId: string) {
    if (created.has(figmaId)) return
    const nc = guidMap.get(figmaId)
    if (!nc) return

    const x = (nc.transform?.m02 ?? 0) + (ourParentId === targetParentId ? offsetX : 0)
    const y = (nc.transform?.m12 ?? 0) + (ourParentId === targetParentId ? offsetY : 0)

    let rotation = 0
    if (nc.transform) {
      rotation = Math.atan2(nc.transform.m10, nc.transform.m00) * (180 / Math.PI)
    }

    const fills: Fill[] = (nc.fillPaints ?? [])
      .filter((p) => p.type === 'SOLID' && p.color)
      .map((p) => ({
        type: 'SOLID' as const,
        color: p.color ?? { r: 0, g: 0, b: 0, a: 1 },
        opacity: p.opacity ?? 1,
        visible: p.visible ?? true
      }))

    const strokes: Stroke[] = (nc.strokePaints ?? [])
      .filter((p) => p.type === 'SOLID' && p.color)
      .map((p) => ({
        color: p.color ?? { r: 0, g: 0, b: 0, a: 1 },
        weight: nc.strokeWeight ?? 1,
        opacity: p.opacity ?? 1,
        visible: p.visible ?? true,
        align: 'CENTER' as const
      }))

    const nodeType = mapNodeType(nc.type)
    const node = graph.createNode(nodeType, ourParentId, {
      name: nc.name ?? nodeType,
      x,
      y,
      width: nc.size?.x ?? 100,
      height: nc.size?.y ?? 100,
      rotation,
      opacity: nc.opacity ?? 1,
      visible: nc.visible ?? true,
      fills,
      strokes,
      cornerRadius: nc.cornerRadius ?? 0,
      independentCorners: nc.rectangleCornerRadiiIndependent ?? false,
      topLeftRadius: nc.rectangleTopLeftCornerRadius ?? 0,
      topRightRadius: nc.rectangleTopRightCornerRadius ?? 0,
      bottomLeftRadius: nc.rectangleBottomLeftCornerRadius ?? 0,
      bottomRightRadius: nc.rectangleBottomRightCornerRadius ?? 0,
      text: nc.textData?.characters ?? '',
      fontSize: nc.fontSize ?? 14,
      fontFamily: nc.fontName?.family ?? 'Inter',
      textAlignHorizontal:
        (nc.textAlignHorizontal as 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED') ?? 'LEFT',
      layoutMode: mapLayoutMode(nc.stackMode as string),
      itemSpacing: (nc.stackSpacing as number) ?? 0,
      paddingTop: (nc.stackVerticalPadding as number) ?? (nc.stackPadding as number) ?? 0,
      paddingBottom:
        (nc.stackPaddingBottom as number) ??
        (nc.stackVerticalPadding as number) ??
        (nc.stackPadding as number) ??
        0,
      paddingLeft: (nc.stackHorizontalPadding as number) ?? (nc.stackPadding as number) ?? 0,
      paddingRight:
        (nc.stackPaddingRight as number) ??
        (nc.stackHorizontalPadding as number) ??
        (nc.stackPadding as number) ??
        0,
      primaryAxisSizing: mapSizing(nc.stackPrimarySizing as string),
      counterAxisSizing: mapSizing(nc.stackCounterSizing as string),
      primaryAxisAlign: mapPrimaryAlign(
        (nc.stackPrimaryAlignItems as string) ?? (nc.stackJustify as string)
      ),
      counterAxisAlign: mapCounterAlign(
        (nc.stackCounterAlignItems as string) ?? (nc.stackCounterAlign as string)
      ),
      layoutWrap: (nc.stackWrap as string) === 'WRAP' ? ('WRAP' as const) : ('NO_WRAP' as const),
      counterAxisSpacing: (nc.stackCounterSpacing as number) ?? 0,
      layoutPositioning:
        (nc.stackPositioning as string) === 'ABSOLUTE' ? ('ABSOLUTE' as const) : ('AUTO' as const),
      layoutGrow: (nc.stackChildPrimaryGrow as number) ?? 0,
      vectorNetwork: decodeVectorData(nc, blobs)
    })

    created.set(figmaId, node.id)
    if (ourParentId === targetParentId) createdIds.push(node.id)

    const children: string[] = []
    for (const [childId, pid] of parentMap) {
      if (pid === figmaId && !skipTypes.has(guidMap.get(childId)?.type ?? '')) {
        children.push(childId)
      }
    }
    children.sort((a, b) => {
      const aPos = guidMap.get(a)?.parentIndex?.position ?? ''
      const bPos = guidMap.get(b)?.parentIndex?.position ?? ''
      return aPos.localeCompare(bPos)
    })
    for (const childId of children) {
      createNode(childId, node.id)
    }
  }

  for (const id of topLevel) {
    createNode(id, targetParentId)
  }

  return createdIds
}

function mapLayoutMode(mode?: string): LayoutMode {
  if (mode === 'HORIZONTAL') return 'HORIZONTAL'
  if (mode === 'VERTICAL') return 'VERTICAL'
  return 'NONE'
}

function mapSizing(sizing?: string): LayoutSizing {
  if (sizing === 'RESIZE_TO_FIT' || sizing === 'RESIZE_TO_FIT_WITH_IMPLICIT_SIZE') return 'HUG'
  if (sizing === 'FILL') return 'FILL'
  return 'FIXED'
}

function mapPrimaryAlign(align?: string): LayoutAlign {
  if (align === 'CENTER') return 'CENTER'
  if (align === 'MAX') return 'MAX'
  if (align === 'SPACE_BETWEEN' || align === 'SPACE_EVENLY') return 'SPACE_BETWEEN'
  return 'MIN'
}

function mapCounterAlign(align?: string): LayoutCounterAlign {
  if (align === 'CENTER') return 'CENTER'
  if (align === 'MAX') return 'MAX'
  if (align === 'STRETCH') return 'STRETCH'
  if (align === 'BASELINE') return 'BASELINE'
  return 'MIN'
}

function mapNodeType(type?: string): SceneNode['type'] {
  switch (type) {
    case 'FRAME':
      return 'FRAME'
    case 'COMPONENT':
      return 'COMPONENT'
    case 'COMPONENT_SET':
      return 'COMPONENT_SET'
    case 'INSTANCE':
      return 'INSTANCE'
    case 'RECTANGLE':
    case 'ROUNDED_RECTANGLE':
      return 'RECTANGLE'
    case 'ELLIPSE':
      return 'ELLIPSE'
    case 'TEXT':
      return 'TEXT'
    case 'LINE':
      return 'LINE'
    case 'STAR':
      return 'STAR'
    case 'REGULAR_POLYGON':
      return 'POLYGON'
    case 'VECTOR':
    case 'BOOLEAN_OPERATION':
      return 'VECTOR'
    case 'GROUP':
      return 'GROUP'
    case 'SECTION':
      return 'SECTION'
    default:
      return 'RECTANGLE'
  }
}

// --- Copy to Figma-compatible fig-kiwi ---

function mapToFigmaType(type: SceneNode['type']): string {
  switch (type) {
    case 'FRAME':
      return 'FRAME'
    case 'RECTANGLE':
      return 'RECTANGLE'
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
    default:
      return 'RECTANGLE'
  }
}

function fractionalPosition(index: number): string {
  const base = '!'
  return String.fromCharCode(base.charCodeAt(0) + index)
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

  if (node.cornerRadius > 0) {
    nc.cornerRadius = node.cornerRadius
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

  if (node.type === 'TEXT') {
    nc.fontSize = node.fontSize
    nc.fontName = { family: node.fontFamily, style: 'Regular', postscript: '' }
    nc.textData = {
      characters: node.text,
      lines: [
        {
          lineType: 'PLAIN',
          styleId: 0,
          indentationLevel: 0,
          sourceDirectionality: 'AUTO',
          listStartOffset: 0,
          isFirstLineOfList: false
        }
      ]
    }
    nc.textAutoResize = 'WIDTH_AND_HEIGHT'
    nc.textAlignHorizontal = node.textAlignHorizontal
  }

  if (node.type === 'FRAME' || node.type === 'GROUP') {
    nc.frameMaskDisabled = node.type === 'GROUP'
  }

  if (node.layoutMode !== 'NONE') {
    nc.stackMode = node.layoutMode
    nc.stackSpacing = node.itemSpacing
    nc.stackVerticalPadding = node.paddingTop
    nc.stackHorizontalPadding = node.paddingLeft
    nc.stackPaddingBottom = node.paddingBottom
    nc.stackPaddingRight = node.paddingRight
    nc.stackPrimarySizing = node.primaryAxisSizing === 'HUG' ? 'RESIZE_TO_FIT' : 'FIXED'
    nc.stackCounterSizing =
      node.counterAxisSizing === 'HUG' ? 'RESIZE_TO_FIT_WITH_IMPLICIT_SIZE' : undefined
  }

  if (node.layoutPositioning === 'ABSOLUTE') {
    nc.stackPositioning = 'ABSOLUTE'
  }
  if (node.layoutGrow > 0) {
    nc.stackChildPrimaryGrow = node.layoutGrow
  }

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

export function buildFigmaClipboardHTML(nodes: SceneNode[], graph: SceneGraph): string | null {
  const compiled = getCompiledSchema()
  const schemaDeflated = deflateSync(getSchemaBytes())

  const docGuid = { sessionID: 0, localID: 0 }
  const canvasGuid = { sessionID: 0, localID: 1 }
  const localIdCounter = { value: 100 }

  const nodeChanges: KiwiNodeChange[] = [
    {
      guid: docGuid,
      type: 'DOCUMENT',
      name: 'Document',
      visible: true,
      opacity: 1,
      phase: 'CREATED',
      transform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }
    },
    {
      guid: canvasGuid,
      parentIndex: { guid: docGuid, position: '!' },
      type: 'CANVAS',
      name: 'Page 1',
      visible: true,
      opacity: 1,
      phase: 'CREATED',
      transform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }
    }
  ]

  const blobs: Uint8Array[] = []
  for (let i = 0; i < nodes.length; i++) {
    nodeChanges.push(...sceneNodeToKiwi(nodes[i], canvasGuid, i, localIdCounter, graph, blobs))
  }

  const msg: Record<string, unknown> = {
    type: 'NODE_CHANGES',
    sessionID: 0,
    ackID: 0,
    pasteID: Math.floor(Math.random() * 2147483647),
    pasteFileKey: 'openpencil',
    nodeChanges
  }

  if (blobs.length > 0) {
    msg.blobs = blobs.map((bytes) => ({ bytes }))
  }

  const dataRaw = compiled.encodeMessage(msg)
  const figKiwiBinary = buildFigKiwi(schemaDeflated, dataRaw)
  const bufferB64 = binaryToBase64(figKiwiBinary)

  const meta: FigmaClipboardMeta = {
    fileKey: 'openpencil',
    pasteID: msg.pasteID as number,
    dataType: 'scene'
  }
  const metaB64 = btoa(JSON.stringify(meta))

  return (
    `<meta charset='utf-8'>` +
    `<span data-metadata="<!--(figmeta)${metaB64}(/figmeta)-->"></span>` +
    `<span data-buffer="<!--(figma)${bufferB64}(/figma)-->"></span>`
  )
}

// --- Internal copy/paste (OpenPencil ↔ OpenPencil) ---

export function parseOpenPencilClipboard(
  html: string
): Array<SceneNode & { children?: SceneNode[] }> | null {
  const match = html.match(/<!--\(openpencil\)(.*?)\(\/openpencil\)-->/s)
  if (!match) return null

  try {
    const decoded = JSON.parse(atob(match[1]))
    if (decoded.format === 'openpencil/v1' && Array.isArray(decoded.nodes)) {
      return decoded.nodes
    }
  } catch {
    // Not our format
  }
  return null
}

export function buildOpenPencilClipboardHTML(nodes: SceneNode[], graph: SceneGraph): string {
  const data = {
    format: 'openpencil/v1',
    nodes: collectNodeTree(nodes, graph)
  }
  return `<!--(openpencil)${btoa(JSON.stringify(data))}(/openpencil)-->`
}

function collectNodeTree(
  nodes: SceneNode[],
  graph: SceneGraph
): Array<SceneNode & { children?: SceneNode[] }> {
  return nodes.map((node) => {
    const children = graph.getChildren(node.id)
    return {
      ...node,
      children: children.length > 0 ? collectNodeTree(children, graph) : undefined
    }
  })
}
