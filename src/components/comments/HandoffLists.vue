<script setup lang="ts">
import { computed, ref } from 'vue'

import { documentFrameReviews, handoffLabel, type FrameReviewStatus } from '@kalka/scene-graph'
import { useCommentsMessages } from '@kalka/vue'

import { focusedAnnotation } from '@/app/comments/annotations'
import { useComments } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import { useLeftPanel } from '@/app/shell/left-panel/use'

/**
 * The comments panel's handoff lists: every annotation of the document, and the frames and
 * sections with a dev status, filtered as Figma's Ready for dev view filters them. Choosing one
 * goes to its layer and selects it.
 */
const { list } = defineProps<{ list: 'annotations' | 'dev' }>()

const store = useEditorStore()
const comments = useComments(store)
const messages = useCommentsMessages()
const { show } = useLeftPanel()

const annotations = computed(() =>
  comments.handoffThreads.value.flatMap((thread) => {
    const node = thread.anchor.nodeId ? store.graph.getNode(thread.anchor.nodeId) : undefined
    return thread.annotation && node ? [{ thread, node }] : []
  })
)

type Filter = FrameReviewStatus | 'all'
const filter = ref<Filter>('ready')
const filters: Filter[] = ['ready', 'review', 'completed', 'all']

function filterLabel(name: Filter): string {
  if (name === 'ready') return messages.value.statusReady
  if (name === 'review') return messages.value.statusChanged
  if (name === 'completed') return messages.value.statusCompleted
  return messages.value.filterAll
}

const reviews = computed(() => {
  void store.state.sceneVersion
  return documentFrameReviews(store.graph).flatMap((review) => {
    const node = store.graph.getNode(review.nodeId)
    if (!node || (filter.value !== 'all' && review.status !== filter.value)) return []
    return [{ review, node }]
  })
})

function pageName(nodeId: string): string {
  return store.graph.closest(nodeId, (node) => node.type === 'CANVAS')?.name ?? ''
}

async function reveal(nodeId: string) {
  const page = store.graph.closest(nodeId, (node) => node.type === 'CANVAS')
  if (page && store.state.currentPageId !== page.id) await store.switchPage(page.id)
  const bounds = store.graph.getAbsoluteBounds(nodeId)
  store.centerOn(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, store.state.zoom)
  store.select([nodeId])
}

async function revealAnnotation(threadId: string, nodeId: string) {
  await reveal(nodeId)
  focusedAnnotation.value = threadId
  show('code')
}
</script>

<template>
  <template v-if="list === 'annotations'">
    <div
      v-if="annotations.length === 0"
      class="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-10 text-center"
      data-slot="comments-panel-empty"
    >
      <icon-hugeicons-note-edit class="size-5 text-surface/60" aria-hidden="true" />
      <p class="max-w-56 text-sm text-surface/75">{{ messages.noAnnotations }}</p>
    </div>
    <ul v-else class="flex min-h-0 flex-1 flex-col overflow-y-auto px-1.5 pb-2">
      <li v-for="{ thread, node } in annotations" :key="thread.id">
        <button
          type="button"
          class="flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-hover"
          data-slot="annotation-row"
          :data-category="thread.annotation?.category"
          @click="revealAnnotation(thread.id, node.id)"
        >
          <span class="flex items-center gap-1 text-xs text-muted">
            <span class="truncate font-medium text-surface">{{ node.name }}</span>
            <span class="flex-1" />
            {{ messages.pageLabel({ page: pageName(node.id) }) }}
          </span>
          <span v-if="handoffLabel(thread)" class="line-clamp-2 text-sm text-surface">
            {{ handoffLabel(thread) }}
          </span>
        </button>
      </li>
    </ul>
  </template>
  <template v-else>
    <div role="radiogroup" :aria-label="messages.devStatus" class="flex flex-wrap gap-1 px-3 pb-2">
      <button
        v-for="name in filters"
        :key="name"
        type="button"
        role="radio"
        class="rounded-full border border-border px-2 py-0.5 text-[11px] text-surface/75 hover:bg-hover data-[active]:border-accent data-[active]:text-surface"
        :aria-checked="filter === name"
        :data-active="filter === name || undefined"
        :data-filter="name"
        @click="filter = name"
      >
        {{ filterLabel(name) }}
      </button>
    </div>
    <div
      v-if="reviews.length === 0"
      class="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-10 text-center"
      data-slot="comments-panel-empty"
    >
      <icon-hugeicons-checkmark-circle-02 class="size-5 text-surface/60" aria-hidden="true" />
      <p class="max-w-56 text-sm text-surface/75">{{ messages.noReady }}</p>
    </div>
    <ul v-else class="flex min-h-0 flex-1 flex-col overflow-y-auto px-1.5 pb-2">
      <li v-for="{ review, node } in reviews" :key="review.nodeId">
        <button
          type="button"
          class="flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-hover"
          data-slot="dev-status-row"
          :data-status="review.status"
          @click="reveal(node.id)"
        >
          <span class="flex items-center gap-1 text-xs text-muted">
            <span class="truncate font-medium text-surface">{{ node.name }}</span>
            <span class="flex-1" />
            {{ filterLabel(review.status) }}
          </span>
          <span class="flex gap-2 text-xs text-muted">
            <span>{{ messages.pageLabel({ page: pageName(node.id) }) }}</span>
            <span class="truncate">{{ review.by }}</span>
          </span>
        </button>
      </li>
    </ul>
  </template>
</template>
