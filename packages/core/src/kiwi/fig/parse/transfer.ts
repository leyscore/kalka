import { isEmptyObject } from 'es-toolkit/predicate'

import { createDefaultNode, SceneGraph } from '@kalka/scene-graph'
import type { EnabledLibraryBinding, NodeType, SceneNode } from '@kalka/scene-graph'

import type { PortableSceneGraphData } from '#core/kiwi/fig/parse/portable-data'

/**
 * A layer as it crosses from the reader's worker: the fields that differ from a new layer of its
 * type, and the fields a new layer has that it lacks. Most of a layer's fields hold their
 * defaults, and copying a field costs the same whatever it holds, so sending only the others
 * makes a large file's graph several times cheaper to copy on both threads.
 */
export type SerializedNode = [
  id: string,
  fields: Partial<SceneNode> & Pick<SceneNode, 'type'>,
  absent?: string[]
]

export interface SerializedSceneGraph extends Omit<PortableSceneGraphData, 'nodes'> {
  nodes: SerializedNode[]
  instanceIndex: Array<[string, string[]]>
  figKiwiVersion: number | null
  figSchemaDeflated: Uint8Array | null
  enabledLibraries?: Array<[string, EnabledLibraryBinding]>
}

/** A new layer of a type, which serialized layers are told apart from. */
interface NodeDefaults {
  node: SceneNode
  keys: readonly string[]
  /** Fields whose default is an empty list or an empty record. */
  emptyLists: ReadonlySet<string>
  emptyRecords: ReadonlySet<string>
}

function defaultsFor(type: NodeType, cache: Map<NodeType, NodeDefaults>): NodeDefaults {
  let defaults = cache.get(type)
  if (!defaults) {
    const node = createDefaultNode(() => '', type)
    const entries = Object.entries(node)
    defaults = {
      node,
      keys: entries.map(([key]) => key),
      emptyLists: new Set(
        entries.flatMap(([key, value]) => (Array.isArray(value) && value.length === 0 ? [key] : []))
      ),
      emptyRecords: new Set(entries.flatMap(([key, value]) => (isEmptyObject(value) ? [key] : [])))
    }
    cache.set(type, defaults)
  }
  return defaults
}

/**
 * Keeps the fields that differ from a new layer's, as far as telling costs nothing: the same
 * primitive, or an empty list or record where the default is one too, stays behind.
 */
function serializeNode(node: SceneNode, cache: Map<NodeType, NodeDefaults>): SerializedNode {
  const defaults = defaultsFor(node.type, cache)
  const fields: Partial<Record<keyof SceneNode, unknown>> = { type: node.type }
  let shared = 0
  for (const key of Object.keys(node) as (keyof SceneNode)[]) {
    const value = node[key]
    if (!(key in defaults.node)) {
      fields[key] = value
      continue
    }
    shared++
    if (key === 'id' || value === defaults.node[key]) continue
    if (
      Array.isArray(value)
        ? value.length === 0 && defaults.emptyLists.has(key)
        : defaults.emptyRecords.has(key) && isEmptyObject(value)
    )
      continue
    fields[key] = value
  }
  const absent =
    shared < defaults.keys.length ? defaults.keys.filter((key) => !(key in node)) : undefined
  // `fields` holds the node's own type and only keys the node has, so it is a part of the node.
  const part = fields as Partial<SceneNode> & Pick<SceneNode, 'type'>
  return absent ? [node.id, part, absent] : [node.id, part]
}

/** A new layer of a type, copied into a fast object, and its fields that hold lists or records. */
interface NodeTemplate {
  node: SceneNode
  mutable: readonly (keyof SceneNode)[]
}

function templateFor(type: NodeType, cache: Map<NodeType, NodeTemplate>): NodeTemplate {
  let template = cache.get(type)
  if (!template) {
    // Spreading the new layer gives an object with fast properties, which copies cheaply.
    const node = { ...createDefaultNode(() => '', type) }
    const mutable = (Object.keys(node) as (keyof SceneNode)[]).filter(
      (key) => typeof node[key] === 'object' && node[key] !== null
    )
    template = { node, mutable }
    cache.set(type, template)
  }
  return template
}

/** A default list or record of its own for one layer: a new empty one, or a deep copy. */
function freshDefault(value: unknown): unknown {
  if (Array.isArray(value) && value.length === 0) return []
  if (isEmptyObject(value)) return {}
  return structuredClone(value)
}

/**
 * The layer, filled from a new layer of its type. It is copied from a template with fast
 * properties, as a structured clone gives, rather than built on a new layer, whose many fields
 * leave it in V8's slow dictionary mode: layers built that way were several times slower to
 * read and copy, as snapping does with every sibling while dragging.
 */
function deserializeNode(
  [id, fields, absent]: SerializedNode,
  cache: Map<NodeType, NodeTemplate>
): SceneNode {
  const template = templateFor(fields.type, cache)
  const node: SceneNode = { ...template.node, ...fields, id }
  for (const key of template.mutable) {
    if (!(key in fields)) Reflect.set(node, key, freshDefault(template.node[key]))
  }
  for (const key of absent ?? []) Reflect.deleteProperty(node, key)
  return node
}

export function serializeSceneGraph(graph: SceneGraph): SerializedSceneGraph {
  const defaults = new Map<NodeType, NodeDefaults>()
  return {
    rootId: graph.rootId,
    nodes: [...graph.nodes.values()].map((node) => serializeNode(node, defaults)),
    images: [...graph.images],
    variables: [...graph.variables],
    variableCollections: [...graph.variableCollections],
    activeMode: [...graph.activeMode],
    instanceIndex: [...graph.instanceIndex].map(([id, nodeIds]) => [id, [...nodeIds]]),
    figKiwiVersion: graph.figKiwiVersion,
    figSchemaDeflated: graph.figSchemaDeflated,
    documentColorSpace: graph.documentColorSpace,
    interVersion: graph.interVersion,
    enabledLibraries: [...graph.enabledLibraries]
  }
}

export function serializedSceneGraphTransferList(data: SerializedSceneGraph): Transferable[] {
  const buffers = new Set<ArrayBuffer>()
  for (const [, image] of data.images) {
    if (
      image.buffer instanceof ArrayBuffer &&
      image.byteOffset === 0 &&
      image.byteLength === image.buffer.byteLength
    ) {
      buffers.add(image.buffer)
    }
  }

  if (data.figSchemaDeflated) {
    if (
      data.figSchemaDeflated.buffer instanceof ArrayBuffer &&
      data.figSchemaDeflated.byteOffset === 0 &&
      data.figSchemaDeflated.byteLength === data.figSchemaDeflated.buffer.byteLength
    ) {
      buffers.add(data.figSchemaDeflated.buffer)
    }
  }
  return [...buffers]
}

/**
 * Clone the graph state that page population may mutate while retaining immutable imported
 * resources by reference. Population replaces node fields and mutates child ID arrays, but only
 * reads image bytes, variables, source changes, GUID mappings, blobs, and schema bytes.
 */
export function cloneSceneGraphForFigExport(graph: SceneGraph): SceneGraph {
  const cloned = new SceneGraph()
  cloned.rootId = graph.rootId
  cloned.nodes = new Map(
    [...graph.nodes].map(([id, node]) => [id, { ...node, childIds: [...node.childIds] }])
  )
  cloned.images = new Map(graph.images)
  cloned.variables = new Map(graph.variables)
  cloned.variableCollections = new Map(graph.variableCollections)
  cloned.activeMode = new Map(graph.activeMode)
  cloned.instanceIndex = new Map(
    [...graph.instanceIndex].map(([id, nodeIds]) => [id, new Set(nodeIds)])
  )
  cloned.figKiwiVersion = graph.figKiwiVersion
  cloned.figSchemaDeflated = graph.figSchemaDeflated
  cloned.documentColorSpace = graph.documentColorSpace
  cloned.interVersion = graph.interVersion
  cloned.enabledLibraries = new Map(graph.enabledLibraries)

  return cloned
}

/** Fills what older readers left out; the node is the copy just made, so it changes in place. */
function normalizeImportedNode(node: SceneNode): SceneNode {
  if (!Array.isArray(node.guides)) node.guides = []
  node.variableBindingScales = { ...node.variableBindingScales }
  node.variableAssignmentScales = { ...node.variableAssignmentScales }
  if (!Reflect.has(node, 'componentScale')) node.componentScale = 1
  return node
}

export function deserializeSceneGraph(data: SerializedSceneGraph): SceneGraph {
  const graph = new SceneGraph()
  graph.rootId = data.rootId
  const templates = new Map<NodeType, NodeTemplate>()
  graph.nodes = new Map(
    data.nodes.map((entry) => [entry[0], normalizeImportedNode(deserializeNode(entry, templates))])
  )
  graph.images = new Map(data.images)
  graph.variables = new Map(data.variables)
  graph.variableCollections = new Map(data.variableCollections)
  graph.activeMode = new Map(data.activeMode)
  graph.instanceIndex = new Map(data.instanceIndex.map(([id, nodeIds]) => [id, new Set(nodeIds)]))
  graph.figKiwiVersion = data.figKiwiVersion
  graph.figSchemaDeflated = data.figSchemaDeflated
  graph.documentColorSpace = data.documentColorSpace
  if (data.interVersion) graph.interVersion = data.interVersion
  graph.enabledLibraries = data.enabledLibraries ? new Map(data.enabledLibraries) : new Map()

  return graph
}
