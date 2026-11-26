<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import {
  canHaveDevStatus,
  frameReview,
  measurementSpan,
  setFrameDevStatus,
  type CommentThread
} from '@kalka/scene-graph'
import { useCommentsMessages } from '@kalka/vue'

import {
  annotateSelection,
  annotationsVisible,
  focusedAnnotation,
  measureSelection
} from '@/app/comments/annotations'
import { currentPersonName, useComments } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

import AnnotationEditor from './AnnotationEditor.vue'
import DevResourcesList from './DevResourcesList.vue'

/**
 * Handoff in the Code tab, where developers read a layer: its dev status when it is a frame or a
 * section, its annotations and kept measurements, and its dev resources. Kalka has no separate
 * Dev Mode, since its canvas already is code.
 */
const store = useEditorStore()
const comments = useComments(store)
const messages = useCommentsMessages()
const open = ref(true)

const node = computed(() => {
  void store.state.sceneVersion
  const ids = [...store.state.selectedIds]
  return ids.length === 1 ? store.graph.getNode(ids[0]) : undefined
})
const selectionSize = computed(() => store.state.selectedIds.size)

const layerThreads = computed(() =>
  comments.handoffThreads.value.filter((thread) => thread.anchor.nodeId === node.value?.id)
)
const annotations = computed(() => layerThreads.value.filter((thread) => thread.annotation))
const measurements = computed(() => layerThreads.value.filter((thread) => thread.measurement))

// A new annotation made from the canvas opens this section with its note.
watch(focusedAnnotation, (id) => {
  if (id) open.value = true
})

type Status = 'none' | 'ready' | 'completed'
const canTakeStatus = computed(() => !!node.value && canHaveDevStatus(store.graph, node.value.id))
const review = computed(() => {
  void store.state.sceneVersion
  return node.value ? frameReview(store.graph, node.value.id) : undefined
})
const status = computed<Status>(() => {
  if (!review.value) return 'none'
  return review.value.status === 'completed' ? 'completed' : 'ready'
})
const statusOptions = computed(() => [
  { value: 'none' as const, label: messages.value.statusNone },
  { value: 'ready' as const, label: messages.value.statusReady },
  { value: 'completed' as const, label: messages.value.statusCompleted }
])

function setStatus(next: Status) {
  const target = node.value
  if (!target) return
  setFrameDevStatus(store.graph, target.id, next === 'none' ? null : next, currentPersonName(), {
    description: review.value?.description
  })
  store.requestRefresh()
}

function measurementText(thread: CommentThread): string {
  const span = measurementSpan(store.graph, thread)
  const distance = span ? `${Math.round(span.distance * 100) / 100}px` : '—'
  const to = thread.measurement ? store.graph.getNode(thread.measurement.toNodeId) : undefined
  if (!to || to.id === thread.anchor.nodeId)
    return messages.value.measurementSize({ distance, name: node.value?.name ?? '' })
  return messages.value.measurementTo({ distance, name: to.name })
}
</script>

<template>
  <section
    class="flex max-h-[45%] shrink-0 flex-col border-b border-border"
    data-test-id="handoff-section"
    :aria-label="messages.handoff"
  >
    <header class="flex items-center gap-1 px-3 py-1.5">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-1 text-left text-[11px] font-semibold text-muted hover:text-surface"
        :aria-expanded="open"
        @click="open = !open"
      >
        <icon-hugeicons-arrow-right-01
          class="size-3 transition-transform data-[open]:rotate-90"
          :data-open="open || undefined"
        />
        {{ messages.handoff }}
      </button>
      <Tip :label="annotationsVisible ? messages.hideAnnotations : messages.showAnnotations">
        <IconButton
          :label="annotationsVisible ? messages.hideAnnotations : messages.showAnnotations"
          data-test-id="handoff-toggle-annotations"
          :aria-pressed="annotationsVisible"
          @click="annotationsVisible = !annotationsVisible"
        >
          <icon-hugeicons-view v-if="annotationsVisible" />
          <icon-hugeicons-view-off v-else />
        </IconButton>
      </Tip>
    </header>
    <div v-if="open" class="flex min-h-0 flex-col gap-3 overflow-y-auto px-3 pb-3">
      <div v-if="canTakeStatus" class="flex flex-col gap-1" data-slot="dev-status">
        <span class="text-[10px] text-muted">{{ messages.devStatus }}</span>
        <div class="flex items-center gap-1">
          <AppSelect
            :model-value="status"
            :options="statusOptions"
            :label="messages.devStatus"
            data-test-id="handoff-dev-status"
            :ui="{ trigger: 'h-6 min-w-0 flex-1 text-[11px]' }"
            @update:model-value="setStatus"
          />
          <span
            v-if="review?.status === 'review'"
            class="rounded-full bg-warning-action px-1.5 text-[10px] text-white"
            data-slot="dev-status-changed"
          >
            {{ messages.statusChanged }}
          </span>
        </div>
      </div>

      <div v-if="node" class="flex flex-col gap-1">
        <div class="flex items-center gap-1">
          <span class="flex-1 text-[10px] text-muted">{{ messages.annotations }}</span>
          <AppButton
            size="xs"
            variant="ghost"
            data-test-id="handoff-annotate"
            @click="annotateSelection(store)"
          >
            <icon-hugeicons-add-01 class="size-3" />
            {{ messages.annotate }}
          </AppButton>
        </div>
        <ul v-if="annotations.length > 0" class="flex flex-col gap-1.5">
          <AnnotationEditor
            v-for="thread in annotations"
            :key="thread.id"
            :thread="thread"
            :node="node"
            :comments="comments"
          />
        </ul>
      </div>

      <div v-if="node || selectionSize === 2" class="flex flex-col gap-1" data-slot="measurements">
        <div class="flex items-center gap-1">
          <span class="flex-1 text-[10px] text-muted">{{ messages.measurements }}</span>
          <Tip :label="messages.measureHint">
            <AppButton
              size="xs"
              variant="ghost"
              data-test-id="handoff-measure"
              @click="measureSelection(store)"
            >
              <icon-hugeicons-ruler class="size-3" />
              {{ messages.measure }}
            </AppButton>
          </Tip>
        </div>
        <ul v-if="measurements.length > 0" class="flex flex-col gap-0.5">
          <li
            v-for="thread in measurements"
            :key="thread.id"
            class="group flex items-center gap-1 text-[11px]"
            data-slot="measurement"
          >
            <span class="min-w-0 flex-1 truncate">{{ measurementText(thread) }}</span>
            <IconButton
              :label="messages.deleteMeasurement"
              class="size-5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              @click="comments.remove(thread.id)"
            >
              <icon-hugeicons-cancel-01 class="size-3" />
            </IconButton>
          </li>
        </ul>
      </div>

      <div v-if="node" class="flex flex-col gap-1">
        <span class="text-[10px] text-muted">{{ messages.devResources }}</span>
        <DevResourcesList :node="node" />
      </div>
    </div>
  </section>
</template>
