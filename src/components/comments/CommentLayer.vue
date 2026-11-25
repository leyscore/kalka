<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, nextTick, ref, useTemplateRef, watch, type ComponentPublicInstance } from 'vue'

import type { ViewportTransform } from '@kalka/core/geometry'
import type { CommentAnchor, CommentThread } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'
import { useCommentsMessages } from '@kalka/vue'

import { commentCardPlacement } from '@/app/comments/placement'
import { useComments } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'

import CommentThreadCard from './CommentThreadCard.vue'

/**
 * Comments on the canvas: pins where threads are, the click that places a new one while comment
 * mode is on, and the open thread beside its pin. Pins keep their size at any zoom.
 */
const { view, drawn } = defineProps<{
  view: { panX: number; panY: number; zoom: number; currentPageId: string }
  /** The pan and zoom of the canvas's last drawn frame, which pins follow so they do not lead it. */
  drawn?: ViewportTransform | null
}>()

const store = useEditorStore()
const comments = useComments(store)
const messages = useCommentsMessages()
const layer = ref<HTMLElement | null>(null)
const placement = computed(() => drawn ?? view)

function toScreen(point: Vector) {
  const { panX, panY, zoom } = placement.value
  return { left: point.x * zoom + panX, top: point.y * zoom + panY }
}

/** Where a click on the canvas pins a thread: on the deepest layer under it, or on the page. */
function anchorAt(clientX: number, clientY: number): CommentAnchor | null {
  const rect = layer.value?.getBoundingClientRect()
  if (!rect) return null
  const { panX, panY, zoom } = view
  const x = (clientX - rect.left - panX) / zoom
  const y = (clientY - rect.top - panY) / zoom
  const pageId = view.currentPageId
  const node = store.graph.hitTestDeep(x, y, pageId)
  if (!node || node.id === pageId) return { pageId, nodeId: null, x, y }
  const origin = store.graph.getAbsolutePosition(node.id)
  return { pageId, nodeId: node.id, x: x - origin.x, y: y - origin.y }
}

function anchorPoint(anchor: CommentAnchor) {
  if (!anchor.nodeId) return { x: anchor.x, y: anchor.y }
  const origin = store.graph.getAbsolutePosition(anchor.nodeId)
  return { x: origin.x + anchor.x, y: origin.y + anchor.y }
}

const pins = computed(() => {
  void placement.value
  if (!comments.state.value.pinsVisible) return []
  return comments.pageThreads.value.flatMap((thread) => {
    const point = comments.position(thread)
    if (!point || (thread.resolved && comments.state.value.openThreadId !== thread.id)) return []
    return [{ thread, ...toScreen(point) }]
  })
})

const draftPosition = computed(() => {
  const draft = comments.state.value.draft
  return draft ? toScreen(anchorPoint(draft)) : null
})

const openPin = computed(() =>
  pins.value.find((pin) => pin.thread.id === comments.state.value.openThreadId)
)

function place(event: PointerEvent) {
  if (event.button !== 0) return
  const anchor = anchorAt(event.clientX, event.clientY)
  if (anchor) comments.startDraft(anchor)
}

function stateOf(thread: CommentThread): string {
  if (thread.resolved) return 'resolved'
  return thread.agent?.state ?? 'note'
}

function initial(thread: CommentThread): string {
  return thread.messages[0]?.author.name.trim().charAt(0).toUpperCase() || '·'
}

// Dragging a pin pins its thread where it is dropped; a click without moving opens it.
const drag = ref<{ id: string; startX: number; startY: number; left: number; top: number } | null>(
  null
)

function pinDown(event: PointerEvent, id: string, left: number, top: number) {
  if (event.button !== 0) return
  event.stopPropagation()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  drag.value = { id, startX: event.clientX, startY: event.clientY, left, top }
}

function pinMove(event: PointerEvent) {
  if (!drag.value) return
  drag.value = {
    ...drag.value,
    left: drag.value.left + event.movementX,
    top: drag.value.top + event.movementY
  }
}

function pinUp(event: PointerEvent) {
  const current = drag.value
  drag.value = null
  if (!current) return
  const moved = Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 3
  if (!moved) {
    comments.open(comments.state.value.openThreadId === current.id ? null : current.id)
    return
  }
  const anchor = anchorAt(event.clientX, event.clientY)
  if (anchor) comments.move(current.id, anchor)
}

function pinPosition(pin: { thread: CommentThread; left: number; top: number }) {
  if (drag.value?.id === pin.thread.id) return { left: drag.value.left, top: drag.value.top }
  return { left: pin.left, top: pin.top }
}

const card = useTemplateRef<ComponentPublicInstance & { focus: () => void }>('card')
const layerSize = useElementSize(layer)
const cardSize = useElementSize(card, undefined, { box: 'border-box' })

/** The open thread or the draft, beside its pin and inside the canvas. */
const cardPosition = computed(() => {
  const at = draftPosition.value ?? openPin.value
  if (!at) return null
  const { left, top } = commentCardPlacement(
    at,
    { width: cardSize.width.value, height: cardSize.height.value },
    { width: layerSize.width.value, height: layerSize.height.value }
  )
  return { left: `${left}px`, top: `${top}px` }
})

watch(
  () => [comments.state.value.draft, comments.state.value.openThreadId],
  async () => {
    await nextTick()
    card.value?.focus()
  }
)
</script>

<template>
  <div
    ref="layer"
    class="pointer-events-none absolute inset-0 overflow-hidden"
    data-slot="comment-layer"
  >
    <div
      v-if="comments.state.value.placing"
      class="pointer-events-auto absolute inset-0 cursor-crosshair"
      data-slot="comment-placement"
      :aria-label="messages.placeHint"
      @pointerdown="place"
    />
    <p
      v-if="comments.state.value.placing && !comments.state.value.draft"
      class="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-panel px-3 py-1 text-xs text-surface shadow-md"
      role="status"
    >
      {{ messages.placeHint }}
    </p>
    <button
      v-for="pin in pins"
      :key="pin.thread.id"
      type="button"
      class="group pointer-events-auto absolute flex size-4 -translate-y-full items-center justify-center rounded-full rounded-bl-none border-2 border-white bg-accent text-xs font-semibold text-white shadow-md transition-[width,height] hover:size-7 data-[open]:size-7 data-[state=answered]:bg-success data-[state=failed]:bg-error data-[state=resolved]:bg-muted data-[state=waiting]:animate-pulse data-[state=working]:bg-component"
      data-slot="comment-pin"
      :data-state="stateOf(pin.thread)"
      :data-open="comments.state.value.openThreadId === pin.thread.id || undefined"
      :aria-label="
        messages.pin({
          name: pin.thread.messages[0]?.author.name ?? '',
          text: pin.thread.messages[0]?.text ?? ''
        })
      "
      :style="{ left: `${pinPosition(pin).left}px`, top: `${pinPosition(pin).top}px` }"
      @pointerdown="pinDown($event, pin.thread.id, pin.left, pin.top)"
      @pointermove="pinMove"
      @pointerup="pinUp"
    >
      <!-- A pin at rest is a small dot that leaves the design in view; it grows when pointed at or open. -->
      <icon-hugeicons-ai-magic
        v-if="pin.thread.agent"
        class="hidden size-3.5 group-hover:block group-data-[open]:block"
      />
      <span v-else class="hidden group-hover:inline group-data-[open]:inline">
        {{ initial(pin.thread) }}
      </span>
    </button>
    <span
      v-if="draftPosition"
      class="absolute size-7 -translate-y-full rounded-full rounded-bl-none border-2 border-white bg-accent shadow-md"
      data-slot="comment-draft-pin"
      :style="{ left: `${draftPosition.left}px`, top: `${draftPosition.top}px` }"
    />
    <CommentThreadCard
      v-if="cardPosition"
      ref="card"
      class="pointer-events-auto absolute"
      :thread="draftPosition ? undefined : openPin?.thread"
      :comments="comments"
      :style="cardPosition"
    />
  </div>
</template>
