<script setup lang="ts">
import { isEqual } from 'es-toolkit'
import { computed } from 'vue'

import type { ViewportTransform } from '@kalka/core/geometry'
import { documentFrameReviews, type FrameReviewStatus } from '@kalka/scene-graph'
import { useCommentsMessages } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'

/**
 * Dev status above the top-right corner of frames and sections: ready for development, with who
 * approved it, changed since and needing review again, or completed.
 */
const { view, drawn } = defineProps<{
  view: { panX: number; panY: number; zoom: number; currentPageId: string }
  drawn?: ViewportTransform | null
}>()

const store = useEditorStore()
const messages = useCommentsMessages()
const placement = computed(() => drawn ?? view)

interface Badge {
  id: string
  status: FrameReviewStatus
  label: string
  right: number
  top: number
}

function badgeLabel(status: FrameReviewStatus, by: string): string {
  if (status === 'ready') return messages.value.ready({ name: by })
  if (status === 'completed') return messages.value.completedBadge({ name: by })
  return messages.value.needsReview
}

/** Kept while unchanged, so an edit elsewhere in the scene does not re-render the badges. */
const badges = computed<Badge[]>((previous) => {
  void store.state.sceneVersion
  const { panX, panY, zoom } = placement.value
  const next = documentFrameReviews(store.graph).flatMap((review) => {
    const node = store.graph.getNode(review.nodeId)
    const page = store.graph.closest(review.nodeId, (candidate) => candidate.type === 'CANVAS')
    if (!node || page?.id !== view.currentPageId) return []
    const origin = store.graph.getAbsolutePosition(node.id)
    return [
      {
        id: review.nodeId,
        status: review.status,
        label: badgeLabel(review.status, review.by),
        right: (origin.x + node.width) * zoom + panX,
        top: origin.y * zoom + panY
      }
    ]
  })
  return previous && isEqual(previous, next) ? previous : next
})
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <span
      v-for="badge in badges"
      :key="badge.id"
      role="status"
      class="absolute flex -translate-x-full -translate-y-[calc(100%+4px)] items-center gap-1 rounded-full bg-success px-2 py-0.5 text-xs text-white shadow data-[status=completed]:bg-muted data-[status=review]:bg-warning-action"
      data-slot="frame-review-badge"
      :data-status="badge.status"
      :style="{ left: `${badge.right}px`, top: `${badge.top}px` }"
    >
      <icon-hugeicons-checkmark-circle-02 v-if="badge.status !== 'review'" class="size-3" />
      <icon-hugeicons-alert-circle v-else class="size-3" />
      {{ badge.label }}
    </span>
  </div>
</template>
