import * as v from 'valibot'

import type { SceneGraph } from './index'

/**
 * Where a top-level frame stands in review: marked ready for development by a person, or back
 * to needing review because it changed since. A frame with neither is a draft. Kept on the
 * document's root, saved with it, and readable by agents, so a coding agent knows what to build.
 */
export const FRAME_REVIEW_STATUSES = ['ready', 'review'] as const
export type FrameReviewStatus = (typeof FRAME_REVIEW_STATUSES)[number]

export interface FrameReview {
  nodeId: string
  status: FrameReviewStatus
  /** Who marked it ready. */
  by: string
  /** Milliseconds since the epoch when it was marked ready. */
  at: number
}

const reviewSchema = v.object({
  nodeId: v.string(),
  status: v.picklist(FRAME_REVIEW_STATUSES),
  by: v.pipe(v.string(), v.maxLength(80)),
  at: v.pipe(v.number(), v.finite())
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
    const frame = reviewedFrameOf(graph, id) ?? (graph.getNode(id) ? null : id)
    if (frame) changed.add(frame)
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
