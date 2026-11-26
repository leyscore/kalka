import * as v from 'valibot'

import type { SceneGraph } from './index'

/**
 * Where a top-level frame or section stands in review, as Figma's dev status: marked ready for
 * development by a person, back to needing review because it changed since (Figma's "Changed"),
 * or completed once built. A frame with none is a draft. Kept on the document's root, saved with
 * it, and readable by agents, so a coding agent knows what to build.
 */
export const FRAME_REVIEW_STATUSES = ['ready', 'review', 'completed'] as const
export type FrameReviewStatus = (typeof FRAME_REVIEW_STATUSES)[number]

export interface FrameReview {
  nodeId: string
  status: FrameReviewStatus
  /** Who marked it ready. */
  by: string
  /** Milliseconds since the epoch when it was marked ready. */
  at: number
  /** A note for developers given with the status. */
  description?: string
}

const reviewSchema = v.object({
  nodeId: v.string(),
  status: v.picklist(FRAME_REVIEW_STATUSES),
  by: v.pipe(v.string(), v.maxLength(80)),
  at: v.pipe(v.number(), v.finite()),
  description: v.optional(v.pipe(v.string(), v.maxLength(4000)))
})

/** Stored reviews, from a file: a malformed one is dropped, and a frame kept once. */
export const frameReviewsSchema: v.GenericSchema<unknown, FrameReview[]> = v.pipe(
  v.array(v.unknown()),
  v.transform((items) => {
    const reviews: FrameReview[] = []
    for (const item of items) {
      const parsed = v.safeParse(reviewSchema, item)
      if (parsed.success && !reviews.some((known) => known.nodeId === parsed.output.nodeId))
        reviews.push(parsed.output)
    }
    return reviews
  })
)

export function documentFrameReviews(graph: SceneGraph): FrameReview[] {
  return graph.getNode(graph.rootId)?.frameReviews ?? []
}

export function frameReview(graph: SceneGraph, nodeId: string): FrameReview | undefined {
  return documentFrameReviews(graph).find((review) => review.nodeId === nodeId)
}

/** Marks a frame ready for development, or a draft again with null. */
export function setFrameReady(
  graph: SceneGraph,
  nodeId: string,
  by: string | null,
  now = Date.now()
): void {
  const others = documentFrameReviews(graph).filter((review) => review.nodeId !== nodeId)
  graph.updateNode(graph.rootId, {
    frameReviews: by ? [...others, { nodeId, status: 'ready', by, at: now }] : others
  })
}

/**
 * Sets a frame's or a section's dev status: ready for development, completed, or a draft again
 * with null; `description` is the note it comes with.
 */
export function setFrameDevStatus(
  graph: SceneGraph,
  nodeId: string,
  status: 'ready' | 'completed' | null,
  by: string,
  options: { description?: string; now?: number } = {}
): void {
  const others = documentFrameReviews(graph).filter((review) => review.nodeId !== nodeId)
  if (!status) {
    graph.updateNode(graph.rootId, { frameReviews: others })
    return
  }
  const review: FrameReview = { nodeId, status, by, at: options.now ?? Date.now() }
  const description = options.description?.trim()
  if (description) review.description = description
  graph.updateNode(graph.rootId, { frameReviews: [...others, review] })
}

/** The top-level frame of a page that holds `id`: what a review is about. */
export function reviewedFrameOf(graph: SceneGraph, id: string): string | null {
  let node = graph.getNode(id)
  while (node?.parentId) {
    const parent = graph.getNode(node.parentId)
    if (!parent) return null
    if (parent.type === 'CANVAS') return node.id
    node = parent
  }
  return null
}

const STATUS_TYPES = new Set(['FRAME', 'SECTION', 'COMPONENT', 'COMPONENT_SET'])

/**
 * Whether a layer can take a dev status, as in Figma: a section, or a frame at the top of a page
 * or directly in a section.
 */
export function canHaveDevStatus(graph: SceneGraph, id: string): boolean {
  const node = graph.getNode(id)
  const parent = node?.parentId ? graph.getNode(node.parentId) : undefined
  if (!node || !parent || !STATUS_TYPES.has(node.type)) return false
  return node.type === 'SECTION' || parent.type === 'CANVAS' || parent.type === 'SECTION'
}

/** The frames and sections holding `id`, itself included, that can take a dev status. */
export function devStatusTargetsOf(graph: SceneGraph, id: string): string[] {
  const targets: string[] = []
  graph.closest(id, (node) => {
    if (canHaveDevStatus(graph, node.id)) targets.push(node.id)
    return false
  })
  return targets
}

/**
 * Layers changed: frames marked ready that hold any of them need review again, as their design is
 * no longer what was approved. Frames deleted since lose their review. Whether any changed.
 */
export function markChangedFramesForReview(
  graph: SceneGraph,
  changedIds: Iterable<string>
): boolean {
  const reviews = documentFrameReviews(graph)
  if (reviews.length === 0) return false
  const changed = new Set<string>()
  for (const id of changedIds) {
    if (!graph.getNode(id)) changed.add(id)
    for (const target of devStatusTargetsOf(graph, id)) changed.add(target)
  }
  const next: FrameReview[] = []
  for (const review of reviews) {
    if (!graph.getNode(review.nodeId)) continue
    next.push(
      review.status === 'ready' && changed.has(review.nodeId)
        ? { ...review, status: 'review' }
        : review
    )
  }
  const touched = next.length !== reviews.length || next.some((review, i) => review !== reviews[i])
  if (touched) graph.updateNode(graph.rootId, { frameReviews: next })
  return touched
}
