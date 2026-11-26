import { deflateSync, inflateSync } from 'fflate'
import { fromUint8Array, isValid, toUint8Array } from 'js-base64'
import * as v from 'valibot'

import {
  commentThreadsSchema,
  createInstanceOverrideState,
  deserializeInstanceOverrideState,
  handoffThreadsOn,
  serializeInstanceOverrideState,
  setInstanceOverride,
  type InstanceOverrideState,
  type GeometryPath,
  type NodeType,
  type SceneGraph,
  type SceneNode,
  type WindingRule
} from '@kalka/scene-graph'
import type { JSONObject } from '@kalka/scene-graph/primitives'

import type { ClipboardSnapshot } from '#core/editor/clipboard/copy'

const NODE_TYPES: Record<NodeType, true> = {
  CANVAS: true,
  FRAME: true,
  RECTANGLE: true,
  ROUNDED_RECTANGLE: true,
  ELLIPSE: true,
  TEXT: true,
  LINE: true,
  STAR: true,
  POLYGON: true,
  VECTOR: true,
  BOOLEAN_OPERATION: true,
  GROUP: true,
  SECTION: true,
  COMPONENT: true,
  COMPONENT_SET: true,
  INSTANCE: true,
  CONNECTOR: true,
  SHAPE_WITH_TEXT: true
}

interface SerializedGeometryPath {
  windingRule: WindingRule
  commandsBlob: Record<string, number>
  [key: string]: unknown
}

/** The node fields paste dereferences; the remaining SceneNode fields pass through. */
interface SerializedClipboardNode {
  id: string
  type: NodeType
  x: number
  y: number
  overrides?: Record<string, unknown>
  instanceOverrides?: unknown
  textPicture?: string | null
  fillGeometry?: SerializedGeometryPath[]
  strokeGeometry?: SerializedGeometryPath[]
  children?: SerializedClipboardNode[]
  [key: string]: unknown
}

const finiteNumber = v.pipe(v.number(), v.finite())
const byte = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(255))

const SerializedGeometry = v.optional(
  v.array(
    v.looseObject({
      windingRule: v.picklist(['NONZERO', 'EVENODD']),
      commandsBlob: v.record(v.string(), byte)
    })
  )
)

const SerializedClipboardNodeSchema: v.GenericSchema<unknown, SerializedClipboardNode> =
  v.looseObject({
    id: v.string(),
    type: v.custom<NodeType>(
      (value) => typeof value === 'string' && Object.hasOwn(NODE_TYPES, value)
    ),
    // Older clipboard payloads may omit a position; paste offsets from the origin then.
    x: v.optional(finiteNumber, 0),
    y: v.optional(finiteNumber, 0),
    overrides: v.optional(v.record(v.string(), v.unknown())),
    instanceOverrides: v.optional(v.unknown()),
    textPicture: v.optional(v.nullable(v.string())),
    fillGeometry: SerializedGeometry,
    strokeGeometry: SerializedGeometry,
    children: v.optional(v.array(v.lazy(() => SerializedClipboardNodeSchema)))
  })

/** Clipboard HTML is writable by any application, so the payload is validated before paste. */
const KalkaClipboardJSON = v.pipe(
  v.string(),
  v.parseJson(),
  v.object({
    // `openpencil/v1` is the same format, copied before the app was renamed Kalka.
    format: v.picklist(['kalka/v1', 'openpencil/v1']),
    nodes: v.array(SerializedClipboardNodeSchema),
    images: v.optional(v.record(v.string(), v.unknown())),
    // The copied layers' annotations and measurements; a malformed list is dropped, not the paste.
    handoff: v.optional(v.fallback(commentThreadsSchema, []))
  })
)

type ClipboardNode = SceneNode & { children?: ClipboardNode[] }

export type KalkaClipboardData = Pick<ClipboardSnapshot, 'nodes' | 'images' | 'handoff'>

export function parseKalkaClipboard(html: string): KalkaClipboardData | null {
  const match = html.match(/<!--\((kalka|openpencil)\)(.*?)\(\/\1\)-->/s)
  if (!match) return null

  try {
    const raw = clipboardBytes(match[2])
    let bytes: Uint8Array
    try {
      bytes = inflateSync(raw)
    } catch {
      bytes = raw
    }
    const decoded = v.safeParse(KalkaClipboardJSON, new TextDecoder().decode(bytes))
    if (!decoded.success) {
      console.warn('Ignoring malformed Kalka clipboard data:', v.summarize(decoded.issues))
      return null
    }
    const nodes = restoreNodeData(decoded.output.nodes)
    const images = new Map<string, Uint8Array>()
    for (const [hash, b64] of Object.entries(decoded.output.images ?? {})) {
      if (typeof b64 === 'string') images.set(hash, clipboardBytes(b64))
    }
    const handoff = decoded.output.handoff
    return handoff?.length ? { nodes, images, handoff } : { nodes, images }
  } catch (e) {
    console.warn('Failed to parse Kalka clipboard data:', e)
  }
  return null
}

function legacyInstanceOverrides(
  nodeId: string,
  overrides: Record<string, unknown> | undefined
): InstanceOverrideState {
  const state = createInstanceOverrideState()
  for (const [key, value] of Object.entries(overrides ?? {})) {
    const separator = key.lastIndexOf(':')
    if (separator === -1) {
      setInstanceOverride(state, nodeId, nodeId, key, value)
    } else {
      setInstanceOverride(state, nodeId, key.slice(0, separator), key.slice(separator + 1), value)
    }
  }
  return state
}

function restoreGeometry(paths: SerializedGeometryPath[] | undefined): GeometryPath[] {
  return (paths ?? []).map((path) => ({
    ...path,
    commandsBlob: Uint8Array.from(Object.values(path.commandsBlob))
  }))
}

/** Clipboard HTML comes from other applications, so its Base64 is checked before decoding. */
function clipboardBytes(value: string): Uint8Array {
  if (!isValid(value)) throw new TypeError('Invalid Base64 string')
  return toUint8Array(value)
}

function restoreNodeData(nodes: SerializedClipboardNode[]): ClipboardNode[] {
  return nodes.map((node) => {
    const { children, instanceOverrides, overrides, textPicture, ...rest } = node
    const overrideState = instanceOverrides
      ? deserializeInstanceOverrideState(instanceOverrides)
      : legacyInstanceOverrides(rest.id, overrides)
    return {
      ...rest,
      fillGeometry: restoreGeometry(rest.fillGeometry),
      strokeGeometry: restoreGeometry(rest.strokeGeometry),
      instanceOverrides: overrideState,
      textPicture: typeof textPicture === 'string' ? clipboardBytes(textPicture) : textPicture,
      ...(children ? { children: restoreNodeData(children) } : {})
    } as ClipboardNode
  })
}

export type TextPictureBuilder = (node: SceneNode) => Uint8Array | null

function collectImageHashes(nodes: SceneNode[], graph: SceneGraph): Set<string> {
  const hashes = new Set<string>()
  function walk(nodeList: SceneNode[]) {
    for (const node of nodeList) {
      for (const fill of node.fills) {
        if (fill.imageHash) hashes.add(fill.imageHash)
      }
      walk(graph.getChildren(node.id))
    }
  }
  walk(nodes)
  return hashes
}

export function buildKalkaClipboardHTML(
  nodes: SceneNode[],
  graph: SceneGraph,
  textPictureBuilder?: TextPictureBuilder
): string {
  const copiedIds = new Set<string>()
  const nodeTree = collectNodeTree(nodes, graph, textPictureBuilder, copiedIds)
  const hashes = collectImageHashes(nodes, graph)
  // Annotations and measurements travel with their layers, as Figma's copy and paste keep them.
  const handoff = handoffThreadsOn(graph, copiedIds)
  const images: Record<string, string> = {}
  for (const hash of hashes) {
    const bytes = graph.images.get(hash)
    if (bytes) images[hash] = fromUint8Array(bytes)
  }
  const data = {
    format: 'kalka/v1',
    nodes: nodeTree,
    images,
    ...(handoff.length > 0 ? { handoff } : {})
  }
  const compressed = deflateSync(new TextEncoder().encode(JSON.stringify(data)))
  return `<!--(kalka)${fromUint8Array(compressed)}(/kalka)-->`
}

function collectNodeTree(
  nodes: SceneNode[],
  graph: SceneGraph,
  textPictureBuilder: TextPictureBuilder | undefined,
  copiedIds: Set<string>
): JSONObject[] {
  return nodes.map((node) => {
    copiedIds.add(node.id)
    const children = graph.getChildren(node.id)
    const serialized: Record<string, unknown> = {
      ...node,
      instanceOverrides: serializeInstanceOverrideState(node.instanceOverrides)
    }

    if (node.type === 'TEXT' && node.text && textPictureBuilder) {
      const pic = node.textPicture ?? textPictureBuilder(node)
      if (pic) serialized.textPicture = fromUint8Array(pic)
    } else {
      delete serialized.textPicture
    }

    if (children.length > 0) {
      serialized.children = collectNodeTree(children, graph, textPictureBuilder, copiedIds)
    }
    return serialized
  })
}
