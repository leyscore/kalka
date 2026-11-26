import type { CommentAuthor, CommentThread } from '../comments'
import type { SceneGraph } from '../index'
import type { Rect, Vector } from '../primitives'
import { randomHex } from '../random'
import {
  ANNOTATION_PROPERTIES,
  type AnnotationCategoryRef,
  type AnnotationProperty,
  type CommentAnnotation,
  type CommentMeasurement,
  type MeasurementSide
} from './model'

export * from './categories'
export * from './model'
export * from './values'

/** Whether a thread is an annotation or a measurement, which the comment lists leave out. */
export function isHandoffThread(thread: CommentThread): boolean {
  return thread.annotation !== undefined || thread.measurement !== undefined
}

/** The annotations and measurements on a layer, in the order they were added. */
export function layerHandoffThreads(graph: SceneGraph, nodeId: string): CommentThread[] {
  return (graph.getNode(graph.rootId)?.comments ?? []).filter(
    (thread) => thread.anchor.nodeId === nodeId && isHandoffThread(thread)
  )
}

/** The page a layer is on, which a thread's anchor names. */
function pageOf(graph: SceneGraph, nodeId: string): string | null {
  return graph.closest(nodeId, (node) => node.type === 'CANVAS')?.id ?? null
}

function newThread(
  graph: SceneGraph,
  nodeId: string,
  from: CommentAuthor,
  text: string,
  now: number
): CommentThread | null {
  const node = graph.getNode(nodeId)
  const pageId = pageOf(graph, nodeId)
  if (!node || !pageId) return null
  return {
    id: randomHex(8),
    anchor: { pageId, nodeId, x: node.width, y: 0 },
    messages: [{ id: randomHex(8), author: { ...from }, text, createdAt: now }],
    resolved: false
  }
}

function appendThread(graph: SceneGraph, thread: CommentThread): void {
  const threads = graph.getNode(graph.rootId)?.comments ?? []
  graph.updateNode(graph.rootId, { comments: [...threads, thread] })
}

/** Annotates a layer; null when it is not on a page. */
export function addAnnotation(
  graph: SceneGraph,
  nodeId: string,
  from: CommentAuthor,
  annotation: {
    label?: string
    category?: AnnotationCategoryRef
    properties?: AnnotationProperty[]
  },
  now = Date.now()
): CommentThread | null {
  const thread = newThread(graph, nodeId, from, annotation.label?.trim() ?? '', now)
  if (!thread) return null
  thread.annotation = { properties: [...(annotation.properties ?? [])] }
  if (annotation.category) thread.annotation.category = annotation.category
  appendThread(graph, thread)
  return thread
}

/** Pins a measurement from a side of a layer to another layer, or to itself for its size. */
export function addMeasurement(
  graph: SceneGraph,
  nodeId: string,
  from: CommentAuthor,
  measurement: CommentMeasurement,
  now = Date.now()
): CommentThread | null {
  if (!graph.getNode(measurement.toNodeId)) return null
  const thread = newThread(graph, nodeId, from, '', now)
  if (!thread) return null
  thread.measurement = { ...measurement }
  appendThread(graph, thread)
  return thread
}

/** Changes an annotation's note, category or pinned properties. */
export function updateAnnotation(
  graph: SceneGraph,
  id: string,
  change: {
    label?: string
    category?: AnnotationCategoryRef | null
    properties?: AnnotationProperty[]
  }
): CommentThread | undefined {
  let updated: CommentThread | undefined
  const threads = (graph.getNode(graph.rootId)?.comments ?? []).map((thread) => {
    if (thread.id !== id || !thread.annotation) return thread
    const annotation: CommentAnnotation = {
      ...thread.annotation,
      properties: change.properties
        ? ANNOTATION_PROPERTIES.filter((name) => change.properties?.includes(name))
        : thread.annotation.properties
    }
    if (change.category === null) delete annotation.category
    else if (change.category) annotation.category = change.category
    const first = thread.messages.at(0)
    const rest = thread.messages.slice(1)
    const messages =
      change.label === undefined || !first
        ? thread.messages
        : [{ ...first, text: change.label.trim() }, ...rest]
    updated = { ...thread, annotation, messages }
    return updated
  })
  if (updated) graph.updateNode(graph.rootId, { comments: threads })
  return updated
}

/** The note an annotation or a measurement carries, which may be empty. */
export function handoffLabel(thread: CommentThread): string {
  return thread.messages[0]?.text ?? ''
}

const EDGES: Record<MeasurementSide, (box: Rect) => number> = {
  top: (box) => box.y,
  bottom: (box) => box.y + box.height,
  left: (box) => box.x,
  right: (box) => box.x + box.width
}

const OPPOSITE: Record<MeasurementSide, MeasurementSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
}

/**
 * Where a measurement's line runs, in world coordinates, and the distance it shows. Null when one
 * of its layers is gone, so a measurement to a deleted layer is not drawn.
 */
export function measurementSpan(
  graph: SceneGraph,
  thread: CommentThread
): { from: Vector; to: Vector; distance: number } | null {
  const measurement = thread.measurement
  const fromId = thread.anchor.nodeId
  if (!measurement || !fromId || !graph.getNode(fromId) || !graph.getNode(measurement.toNodeId))
    return null
  const a = graph.getAbsoluteBounds(fromId)
  const b = graph.getAbsoluteBounds(measurement.toNodeId)
  const target = measurement.toSameSide ? measurement.side : OPPOSITE[measurement.side]
  const edge = (box: Rect, side: MeasurementSide) => EDGES[side](box)
  const start = edge(a, measurement.side)
  const end = edge(b, target)
  const vertical = measurement.side === 'top' || measurement.side === 'bottom'
  // The line runs through the middle of where the two layers overlap across it, or of the first.
  const across = (low: number, high: number) => {
    const from = vertical ? Math.max(a.x, b.x) : Math.max(a.y, b.y)
    const to = vertical
      ? Math.min(a.x + a.width, b.x + b.width)
      : Math.min(a.y + a.height, b.y + b.height)
    return to > from ? (from + to) / 2 : (low + high) / 2
  }
  const middle = vertical ? across(a.x, a.x + a.width) : across(a.y, a.y + a.height)
  return {
    from: vertical ? { x: middle, y: start } : { x: start, y: middle },
    to: vertical ? { x: middle, y: end } : { x: end, y: middle },
    distance: Math.abs(end - start)
  }
}

/** The annotations and measurements on any of these layers, as copy and paste carry them. */
export function handoffThreadsOn(graph: SceneGraph, nodeIds: Iterable<string>): CommentThread[] {
  const ids = new Set(nodeIds)
  return (graph.getNode(graph.rootId)?.comments ?? []).filter(
    (thread) =>
      thread.anchor.nodeId !== null && ids.has(thread.anchor.nodeId) && isHandoffThread(thread)
  )
}

/**
 * Gives copies of layers the annotations and measurements of the layers they copy, as Figma's
 * copy, paste and duplicate do: `copies` maps each copied layer to its copy. A measurement to a
 * layer copied with it measures to that copy; to another layer, still to that one. Returns the
 * threads added, so an undo can take them back.
 */
export function copyHandoffThreads(
  graph: SceneGraph,
  threads: readonly CommentThread[],
  copies: ReadonlyMap<string, string>
): CommentThread[] {
  const added: CommentThread[] = []
  for (const thread of threads) {
    const nodeId = thread.anchor.nodeId ? copies.get(thread.anchor.nodeId) : undefined
    const pageId = nodeId ? pageOf(graph, nodeId) : null
    if (!nodeId || !pageId || !isHandoffThread(thread)) continue
    const copy: CommentThread = {
      ...structuredClone(thread),
      id: randomHex(8),
      anchor: { ...thread.anchor, pageId, nodeId },
      messages: thread.messages.map((message) => ({
        ...structuredClone(message),
        id: randomHex(8)
      }))
    }
    if (thread.measurement) {
      const toNodeId = copies.get(thread.measurement.toNodeId) ?? thread.measurement.toNodeId
      if (!graph.getNode(toNodeId)) continue
      copy.measurement = { ...thread.measurement, toNodeId }
    }
    added.push(copy)
  }
  if (added.length > 0) {
    const current = graph.getNode(graph.rootId)?.comments ?? []
    graph.updateNode(graph.rootId, { comments: [...current, ...added] })
  }
  return added
}

/** Takes back threads `copyHandoffThreads` added, as undoing the paste that added them does. */
export function removeCommentThreads(graph: SceneGraph, ids: ReadonlySet<string>): void {
  const current = graph.getNode(graph.rootId)?.comments ?? []
  if (!current.some((thread) => ids.has(thread.id))) return
  graph.updateNode(graph.rootId, { comments: current.filter((thread) => !ids.has(thread.id)) })
}

/** Puts back threads an undo took away, unless they are there already. */
export function restoreCommentThreads(graph: SceneGraph, threads: readonly CommentThread[]): void {
  const current = graph.getNode(graph.rootId)?.comments ?? []
  const missing = threads.filter((thread) => !current.some((known) => known.id === thread.id))
  if (missing.length > 0) graph.updateNode(graph.rootId, { comments: [...current, ...missing] })
}
