<script setup lang="ts">
import { computed } from 'vue'

import type { ViewportTransform } from '@kalka/core/geometry'
import {
  annotationPropertyValue,
  ANNOTATION_PROPERTY_CSS,
  handoffLabel,
  measurementSpan,
  type CommentThread
} from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'
import { useCommentsMessages } from '@kalka/vue'

import { annotationCategoryStyle } from '@/app/comments/annotation-categories'
import { annotationsVisible, focusedAnnotation } from '@/app/comments/annotations'
import { useComments } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import { useLeftPanel } from '@/app/shell/left-panel/use'

/**
 * Annotations and measurements on the canvas, as Figma draws them for developers: a callout
 * beside the layer with its note and the properties it pins, and a labelled line for each
 * measurement. Both follow their layers; clicking a callout opens it in the Code tab.
 */
const { view, drawn } = defineProps<{
  view: { panX: number; panY: number; zoom: number; currentPageId: string }
  drawn?: ViewportTransform | null
}>()

const store = useEditorStore()
const comments = useComments(store)
const messages = useCommentsMessages()
const { show } = useLeftPanel()
const placement = computed(() => drawn ?? view)

/** Room between a layer's corner and its callouts. */
const CALLOUT_GAP = 8
/** Half the length of the tick across each end of a measurement. */
const TICK = 4

function toScreen(point: Vector) {
  const { panX, panY, zoom } = placement.value
  return { left: point.x * zoom + panX, top: point.y * zoom + panY }
}

const pageThreads = computed(() => {
  void store.state.sceneVersion
  if (!annotationsVisible.value) return []
  return comments.handoffThreads.value.filter(
    (thread) => thread.anchor.pageId === view.currentPageId
  )
})

interface Callout {
  thread: CommentThread
  layer: string
  label: string
  rows: { name: string; value: string }[]
}

/** A layer's callouts, stacked beside its top-right corner. */
interface CalloutStack {
  layerId: string
  left: number
  top: number
  callouts: Callout[]
}

const stacks = computed<CalloutStack[]>(() => {
  const byLayer = new Map<string, CalloutStack>()
  for (const thread of pageThreads.value) {
    const id = thread.anchor.nodeId
    const node = id ? store.graph.getNode(id) : undefined
    if (!thread.annotation || !id || !node) continue
    let stack = byLayer.get(id)
    if (!stack) {
      const origin = store.graph.getAbsolutePosition(id)
      const at = toScreen({ x: origin.x + node.width, y: origin.y })
      stack = { layerId: id, left: at.left + CALLOUT_GAP, top: at.top, callouts: [] }
      byLayer.set(id, stack)
    }
    stack.callouts.push({
      thread,
      layer: node.name,
      label: handoffLabel(thread),
      rows: thread.annotation.properties.map((name) => ({
        name: ANNOTATION_PROPERTY_CSS[name],
        value: annotationPropertyValue(store.graph, node, name)
      }))
    })
  }
  return [...byLayer.values()]
})

const lines = computed(() =>
  pageThreads.value.flatMap((thread) => {
    const span = measurementSpan(store.graph, thread)
    if (!span) return []
    const from = toScreen(span.from)
    const to = toScreen(span.to)
    const vertical = from.left === to.left
    const left = Math.min(from.left, to.left)
    const top = Math.min(from.top, to.top)
    const box = (x: number, y: number, width: number, height: number) => ({
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`
    })
    return [
      {
        id: thread.id,
        bar: vertical
          ? box(left, top, 1, Math.abs(to.top - from.top))
          : box(left, top, Math.abs(to.left - from.left), 1),
        ticks: [from, to].map((end) =>
          vertical
            ? box(end.left - TICK, end.top, TICK * 2 + 1, 1)
            : box(end.left, end.top - TICK, 1, TICK * 2 + 1)
        ),
        middle: { left: (from.left + to.left) / 2, top: (from.top + to.top) / 2 },
        label: `${Math.round(span.distance * 100) / 100}`
      }
    ]
  })
)

function openAnnotation(callout: Callout) {
  const id = callout.thread.anchor.nodeId
  if (!id) return
  store.select([id])
  focusedAnnotation.value = callout.thread.id
  show('code')
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" data-slot="annotation-layer">
    <!-- Measurements run along one axis, so each is a hairline box with a tick across each end. -->
    <div v-for="line in lines" :key="line.id" data-slot="measurement-line">
      <span class="absolute bg-error" :style="line.bar" />
      <span
        v-for="(tick, index) in line.ticks"
        :key="index"
        class="absolute bg-error"
        :style="tick"
      />
    </div>
    <span
      v-for="line in lines"
      :key="`label-${line.id}`"
      class="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-error px-1 text-[10px] leading-4 font-medium text-white tabular-nums"
      data-slot="measurement-label"
      :style="{ left: `${line.middle.left}px`, top: `${line.middle.top}px` }"
    >
      {{ line.label }}
    </span>
    <div
      v-for="stack in stacks"
      :key="stack.layerId"
      class="absolute flex flex-col items-start gap-1"
      :style="{ left: `${stack.left}px`, top: `${stack.top}px` }"
    >
      <button
        v-for="callout in stack.callouts"
        :key="callout.thread.id"
        type="button"
        class="pointer-events-auto flex max-w-56 flex-col gap-0.5 rounded-md border-l-4 border-l-muted bg-panel px-2 py-1 text-left text-[11px] text-surface shadow-md hover:ring-1 hover:ring-accent data-[category=accessibility]:border-l-component data-[category=behavior]:border-l-accent data-[category=content]:border-l-success data-[category=development]:border-l-warning-action data-[category=interaction]:border-l-error"
        data-slot="annotation-callout"
        :data-category="callout.thread.annotation?.category"
        :style="annotationCategoryStyle(store.graph, callout.thread.annotation?.category)"
        :aria-label="messages.annotationPin({ name: callout.layer, text: callout.label })"
        @pointerdown.stop
        @click="openAnnotation(callout)"
      >
        <span v-if="callout.label" class="line-clamp-3 whitespace-pre-wrap">{{
          callout.label
        }}</span>
        <span
          v-for="row in callout.rows"
          :key="row.name"
          class="flex gap-2 font-mono text-[10px] text-muted"
        >
          <span>{{ row.name }}</span>
          <span class="truncate text-surface">{{ row.value }}</span>
        </span>
      </button>
    </div>
  </div>
</template>
