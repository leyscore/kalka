import { deflateSync, inflateSync } from 'fflate'

import {
  deserializeInstanceOverrideState,
  serializeInstanceOverrideState,
  type SceneGraph,
  type SceneNode,
  type SerializedInstanceOverrideState
} from '@open-pencil/scene-graph'
import type { JSONObject } from '@open-pencil/scene-graph/primitives'

import { decodeBase64, encodeBase64 } from '#core/bytes'

interface SerializedClipboardNode extends JSONObject {
  instanceOverrides?: SerializedInstanceOverrideState
  textPicture?: string | Uint8Array
  children?: SerializedClipboardNode[]
}

type ClipboardNode = SceneNode & { children?: ClipboardNode[] }

export interface OpenPencilClipboardData {
  nodes: Array<SceneNode & { children?: SceneNode[] }>
  images: Map<string, Uint8Array>
}

export function parseOpenPencilClipboard(html: string): OpenPencilClipboardData | null {
  const match = html.match(/<!--\(openpencil\)(.*?)\(\/openpencil\)-->/s)
  if (!match) return null

  try {
    const raw = decodeBase64(match[1])
    let bytes: Uint8Array
    try {
      bytes = inflateSync(raw)
    } catch {
      bytes = raw
    }
    const decoded = JSON.parse(new TextDecoder().decode(bytes))
    if (decoded.format === 'openpencil/v1' && Array.isArray(decoded.nodes)) {
      const nodes = restoreNodeData(decoded.nodes as SerializedClipboardNode[])
      const images = new Map<string, Uint8Array>()
      if (decoded.images && typeof decoded.images === 'object') {
        for (const [hash, b64] of Object.entries(decoded.images)) {
          if (typeof b64 === 'string') {
            images.set(hash, decodeBase64(b64))
          }
        }
      }
      return { nodes, images }
    }
  } catch (e) {
    console.warn('Failed to parse OpenPencil clipboard data:', e)
  }
  return null
}

function restoreNodeData(nodes: SerializedClipboardNode[]): ClipboardNode[] {
  return nodes.map((node) => {
    const { children, instanceOverrides, textPicture, ...rest } = node
    return {
      ...rest,
      instanceOverrides: deserializeInstanceOverrideState(instanceOverrides),
      textPicture: typeof textPicture === 'string' ? decodeBase64(textPicture) : textPicture,
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

export function buildOpenPencilClipboardHTML(
  nodes: SceneNode[],
  graph: SceneGraph,
  textPictureBuilder?: TextPictureBuilder
): string {
  const nodeTree = collectNodeTree(nodes, graph, textPictureBuilder)
  const hashes = collectImageHashes(nodes, graph)
  const images: Record<string, string> = {}
  for (const hash of hashes) {
    const bytes = graph.images.get(hash)
    if (bytes) images[hash] = encodeBase64(bytes)
  }
  const data = {
    format: 'openpencil/v1',
    nodes: nodeTree,
    images
  }
  const compressed = deflateSync(new TextEncoder().encode(JSON.stringify(data)))
  return `<!--(openpencil)${encodeBase64(compressed)}(/openpencil)-->`
}

function collectNodeTree(
  nodes: SceneNode[],
  graph: SceneGraph,
  textPictureBuilder?: TextPictureBuilder
): JSONObject[] {
  return nodes.map((node) => {
    const children = graph.getChildren(node.id)
    const serialized: Record<string, unknown> = {
      ...node,
      instanceOverrides: serializeInstanceOverrideState(node.instanceOverrides)
    }

    if (node.type === 'TEXT' && node.text && textPictureBuilder) {
      const pic = node.textPicture ?? textPictureBuilder(node)
      if (pic) serialized.textPicture = encodeBase64(pic)
    } else {
      delete serialized.textPicture
    }

    if (children.length > 0) {
      serialized.children = collectNodeTree(children, graph, textPictureBuilder)
    }
    return serialized
  })
}
