import { SceneGraph } from './scene-graph'
import { decodeVectorNetworkBlob } from './vector'

import type { NodeChange, Paint, Effect as KiwiEffect, GUID } from '../kiwi/codec'
import type { NodeType, Fill, Stroke, Effect, Color, LayoutMode, LayoutSizing, LayoutAlign, LayoutCounterAlign, VectorNetwork } from './scene-graph'

function ext(nc: NodeChange): Record<string, unknown> {
  return nc as unknown as Record<string, unknown>
}

function guidToString(guid: GUID): string {
  return `${guid.sessionID}:${guid.localID}`
}

function convertColor(color?: { r: number; g: number; b: number; a: number }): Color {
  if (!color) return { r: 0, g: 0, b: 0, a: 1 }
  return { r: color.r, g: color.g, b: color.b, a: color.a }
}

function convertFills(paints?: Paint[]): Fill[] {
  if (!paints) return []
  return paints
    .filter((p) => p.type === 'SOLID')
    .map((p) => ({
      type: 'SOLID' as const,
      color: convertColor(p.color),
      opacity: p.opacity ?? 1,
      visible: p.visible ?? true
    }))
}

function convertStrokes(paints?: Paint[], weight?: number, align?: string): Stroke[] {
  if (!paints) return []
  return paints
    .filter((p) => p.type === 'SOLID')
    .map((p) => ({
      color: convertColor(p.color),
      weight: weight ?? 1,
      opacity: p.opacity ?? 1,
      visible: p.visible ?? true,
      align: (align === 'INSIDE' ? 'INSIDE' : align === 'OUTSIDE' ? 'OUTSIDE' : 'CENTER') as
        | 'INSIDE'
        | 'CENTER'
        | 'OUTSIDE'
    }))
}

function convertEffects(effects?: KiwiEffect[]): Effect[] {
  if (!effects) return []
  return effects.map((e) => ({
    type: e.type as Effect['type'],
    color: convertColor(e.color),
    offset: e.offset ?? { x: 0, y: 0 },
    radius: e.radius ?? 0,
    spread: e.spread ?? 0,
    visible: e.visible ?? true
  }))
}

function mapNodeType(type?: string): NodeType {
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
    case 'REGULAR_POLYGON':
      return 'POLYGON'
    case 'VECTOR':
      return 'VECTOR'
    case 'GROUP':
      return 'GROUP'
    case 'SECTION':
      return 'SECTION'
    case 'COMPONENT':
    case 'COMPONENT_SET':
    case 'INSTANCE':
      return 'FRAME'
    default:
      return 'RECTANGLE'
  }
}

function mapStackMode(mode?: string): LayoutMode {
  switch (mode) {
    case 'HORIZONTAL': return 'HORIZONTAL'
    case 'VERTICAL': return 'VERTICAL'
    default: return 'NONE'
  }
}

function mapStackSizing(sizing?: string): LayoutSizing {
  switch (sizing) {
    case 'RESIZE_TO_FIT':
    case 'RESIZE_TO_FIT_WITH_IMPLICIT_SIZE':
      return 'HUG'
    case 'FILL':
      return 'FILL'
    default:
      return 'FIXED'
  }
}

function mapStackJustify(justify?: string): LayoutAlign {
  switch (justify) {
    case 'CENTER': return 'CENTER'
    case 'MAX': return 'MAX'
    case 'SPACE_BETWEEN':
    case 'SPACE_EVENLY': return 'SPACE_BETWEEN'
    default: return 'MIN'
  }
}

function mapStackCounterAlign(align?: string): LayoutCounterAlign {
  switch (align) {
    case 'CENTER': return 'CENTER'
    case 'MAX': return 'MAX'
    case 'STRETCH': return 'STRETCH'
    case 'BASELINE': return 'BASELINE'
    default: return 'MIN'
  }
}

function resolveVectorNetwork(nc: NodeChange, blobs: Uint8Array[]): VectorNetwork | null {
  const vectorData = (nc as unknown as Record<string, unknown>).vectorData as {
    vectorNetworkBlob?: number
    styleOverrideTable?: Array<{ styleID: number; handleMirroring?: string }>
  } | undefined

  if (!vectorData || vectorData.vectorNetworkBlob === undefined) return null
  const idx = vectorData.vectorNetworkBlob
  if (idx < 0 || idx >= blobs.length) return null

  try {
    return decodeVectorNetworkBlob(blobs[idx], vectorData.styleOverrideTable)
  } catch {
    return null
  }
}

export function importNodeChanges(nodeChanges: NodeChange[], blobs: Uint8Array[] = []): SceneGraph {
  const graph = new SceneGraph()

  // Build guid→nodeChange map and parent relationships
  const changeMap = new Map<string, NodeChange>()
  const parentMap = new Map<string, string>()

  for (const nc of nodeChanges) {
    if (!nc.guid) continue
    if (nc.phase === 'REMOVED') continue
    const id = guidToString(nc.guid)
    changeMap.set(id, nc)

    if (nc.parentIndex?.guid) {
      parentMap.set(id, guidToString(nc.parentIndex.guid))
    }
  }

  // Find root nodes (those whose parent is 0:0 or not in the set)
  const roots: string[] = []
  for (const [id] of changeMap) {
    const parentId = parentMap.get(id)
    if (!parentId || parentId === '0:0' || !changeMap.has(parentId)) {
      roots.push(id)
    }
  }

  // Recursively create nodes
  const created = new Set<string>()

  function createNode(ncId: string, graphParentId: string) {
    if (created.has(ncId)) return
    created.add(ncId)

    const nc = changeMap.get(ncId)
    if (!nc) return

    const nodeType = mapNodeType(nc.type)
    const x = nc.transform?.m02 ?? 0
    const y = nc.transform?.m12 ?? 0
    const width = nc.size?.x ?? 100
    const height = nc.size?.y ?? 100

    // Extract rotation from transform matrix
    let rotation = 0
    if (nc.transform) {
      rotation = Math.atan2(nc.transform.m10, nc.transform.m00) * (180 / Math.PI)
    }

    const node = graph.createNode(nodeType, graphParentId, {
      name: nc.name ?? nodeType,
      x,
      y,
      width,
      height,
      rotation,
      opacity: nc.opacity ?? 1,
      visible: nc.visible ?? true,
      locked: nc.locked ?? false,
      fills: convertFills(nc.fillPaints),
      strokes: convertStrokes(nc.strokePaints, nc.strokeWeight, nc.strokeAlign),
      effects: convertEffects(nc.effects),
      cornerRadius: nc.cornerRadius ?? 0,
      topLeftRadius: nc.rectangleTopLeftCornerRadius ?? nc.cornerRadius ?? 0,
      topRightRadius: nc.rectangleTopRightCornerRadius ?? nc.cornerRadius ?? 0,
      bottomRightRadius: nc.rectangleBottomRightCornerRadius ?? nc.cornerRadius ?? 0,
      bottomLeftRadius: nc.rectangleBottomLeftCornerRadius ?? nc.cornerRadius ?? 0,
      independentCorners: nc.rectangleCornerRadiiIndependent ?? false,
      cornerSmoothing: nc.cornerSmoothing ?? 0,
      text: nc.textData?.characters ?? '',
      fontSize: nc.fontSize ?? 14,
      fontFamily: nc.fontName?.family ?? 'Inter',
      fontWeight: nc.fontName?.style?.includes('Bold') ? 700 : 400,
      textAlignHorizontal:
        (nc.textAlignHorizontal as 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED') ?? 'LEFT',
      lineHeight: nc.lineHeight?.value ?? null,
      letterSpacing: nc.letterSpacing?.value ?? 0,
      layoutMode: mapStackMode(nc.stackMode),
      itemSpacing: nc.stackSpacing ?? 0,
      paddingTop: nc.stackVerticalPadding ?? nc.stackPadding ?? 0,
      paddingBottom: nc.stackPaddingBottom ?? nc.stackVerticalPadding ?? nc.stackPadding ?? 0,
      paddingLeft: nc.stackHorizontalPadding ?? nc.stackPadding ?? 0,
      paddingRight: nc.stackPaddingRight ?? nc.stackHorizontalPadding ?? nc.stackPadding ?? 0,
      primaryAxisSizing: mapStackSizing(nc.stackPrimarySizing),
      counterAxisSizing: mapStackSizing(nc.stackCounterSizing),
      primaryAxisAlign: mapStackJustify(nc.stackPrimaryAlignItems ?? nc.stackJustify),
      counterAxisAlign: mapStackCounterAlign(nc.stackCounterAlignItems ?? nc.stackCounterAlign),
      layoutWrap: ext(nc).stackWrap === 'WRAP' ? 'WRAP' : 'NO_WRAP',
      counterAxisSpacing: (ext(nc).stackCounterSpacing as number) ?? 0,
      layoutPositioning: ext(nc).stackPositioning === 'ABSOLUTE' ? 'ABSOLUTE' : 'AUTO',
      layoutGrow: (ext(nc).stackChildPrimaryGrow as number) ?? 0,
      vectorNetwork: resolveVectorNetwork(nc, blobs)
    })

    // Create children (find all nodes whose parent is this node)
    const children: string[] = []
    for (const [childId, pid] of parentMap) {
      if (pid === ncId) children.push(childId)
    }

    // Sort children by parentIndex position if available
    children.sort((a, b) => {
      const aPos = changeMap.get(a)?.parentIndex?.position ?? ''
      const bPos = changeMap.get(b)?.parentIndex?.position ?? ''
      return aPos.localeCompare(bPos)
    })

    for (const childId of children) {
      createNode(childId, node.id)
    }
  }

  for (const rootId of roots) {
    createNode(rootId, graph.rootId)
  }

  return graph
}
