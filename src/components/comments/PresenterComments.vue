<script setup lang="ts">
import { useElementSize, useRafFn } from '@vueuse/core'
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import type { CommentAnchor, CommentThread } from '@kalka/scene-graph'
import { useCommentsMessages, type PresentTargets } from '@kalka/vue'

import { useCommentInbox } from '@/app/comments/inbox'
import { commentCardPlacement } from '@/app/comments/placement'
import { mayComment, toggleCommentPlacing, useComments } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'

import CommentThreadCard from './CommentThreadCard.vue'

/**
 * Comments in a presented prototype, as in Figma's presentation view: the pins of the threads
 * on the frames shown, where those layers are drawn, the open thread beside its pin, and comment
 * mode (C, or the button) pinning a new thread on the layer clicked. The presenter scales and
 * scrolls its screens, so pins follow the drawn layers rather than canvas coordinates.
 */
const { presenter, pageId } = defineProps<{
  presenter: PresentTargets | null
  pageId: string
}>()

const store = useEditorStore()
const comments = useComments(store)
const inbox = useCommentInbox(store, comments)
const messages = useCommentsMessages()
const layer = useTemplateRef<HTMLElement>('layer')

/** Redraws pins each frame: the presenter's screens move, scroll and change under them. */
const frame = shallowRef(0)
useRafFn(() => {
  frame.value++
})

/** Where a thread sits on the frames shown, as an offset in a presented layer. */
function targetOf(thread: CommentThread): { nodeId: string; x: number; y: number } | null {
  if (!presenter || thread.anchor.pageId !== pageId) return null
  const frames = presenter.shownFrameIds()
  const { nodeId, x, y } = thread.anchor
  if (nodeId)
    return frames.some((id) => id === nodeId || store.graph.isDescendant(nodeId, id))
      ? { nodeId, x, y }
      : null
  for (const id of [...frames].reverse()) {
    const node = store.graph.getNode(id)
    const origin = store.graph.getAbsolutePosition(id)
    if (
      node &&
      x >= origin.x &&
      y >= origin.y &&
      x <= origin.x + node.width &&
      y <= origin.y + node.height
    )
      return { nodeId: id, x: x - origin.x, y: y - origin.y }
  }
  return null
}

/** A point of a presented layer in this layer's pixels. */
function toLayer(target: { nodeId: string; x: number; y: number }) {
  const element = presenter?.elementOf(target.nodeId)
  const base = layer.value?.getBoundingClientRect()
  if (!element || !base || !presenter) return null
  const rect = element.getBoundingClientRect()
  const scale = presenter.scale()
  return {
    left: rect.left - base.left + target.x * scale,
    top: rect.top - base.top + target.y * scale
  }
}

const pins = computed(() => {
  void frame.value
  if (!comments.state.value.pinsVisible) return []
  return comments.threads.value.flatMap((thread) => {
    if (thread.resolved && comments.state.value.openThreadId !== thread.id) return []
    const target = targetOf(thread)
    const at = target ? toLayer(target) : null
    return at ? [{ thread, ...at }] : []
  })
})

const draftPosition = computed(() => {
  void frame.value
  const draft = comments.state.value.draft
  const target = draft?.nodeId ? { nodeId: draft.nodeId, x: draft.x, y: draft.y } : null
  return target ? toLayer(target) : null
})

const openPin = computed(() =>
  pins.value.find((pin) => pin.thread.id === comments.state.value.openThreadId)
)

/** A click in comment mode pins a thread on the innermost presented layer under it. */
function place(event: PointerEvent) {
  if (event.button !== 0 || !presenter) return
  const nodeId = presenter
    .layersAt(event.clientX, event.clientY)
    .find((id) => store.graph.getNode(id) !== undefined)
  const element = nodeId ? presenter.elementOf(nodeId) : null
  if (!nodeId || !element) return
  const rect = element.getBoundingClientRect()
  const scale = presenter.scale()
  const anchor: CommentAnchor = {
    pageId,
    nodeId,
    x: (event.clientX - rect.left) / scale,
    y: (event.clientY - rect.top) / scale
  }
  comments.startDraft(anchor)
}

function initial(thread: CommentThread): string {
  return thread.messages[0]?.author.name.trim().charAt(0).toUpperCase() || '·'
}

const card = useTemplateRef<ComponentPublicInstance & { focus: () => void }>('card')
const layerSize = useElementSize(layer)
const cardSize = useElementSize(card, undefined, { box: 'border-box' })

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

const openId = computed(() => comments.openThread.value?.id ?? null)
watch(
  () => [openId.value, comments.openThread.value?.messages.length],
  () => {
    const thread = comments.openThread.value
    if (thread) inbox.markRead(thread)
  },
  { immediate: true }
)

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
    data-slot="presenter-comments"
  >
    <div
      v-if="comments.state.value.placing"
      class="pointer-events-auto absolute inset-0 cursor-crosshair"
      data-slot="comment-placement"
      :aria-label="messages.placeHint"
      @pointerdown="place"
    />
    <button
      v-for="pin in pins"
      :key="pin.thread.id"
      type="button"
      class="pointer-events-auto absolute flex size-6 -translate-y-full items-center justify-center rounded-full rounded-bl-none border-2 border-white bg-accent text-xs font-semibold text-white shadow-md data-[open]:size-7"
      data-slot="comment-pin"
      :data-open="comments.state.value.openThreadId === pin.thread.id || undefined"
      :aria-label="
        messages.pin({
          name: pin.thread.messages[0]?.author.name ?? '',
          text: pin.thread.messages[0]?.text ?? ''
        })
      "
      :style="{ left: `${pin.left}px`, top: `${pin.top}px` }"
      @click="
        comments.open(comments.state.value.openThreadId === pin.thread.id ? null : pin.thread.id)
      "
    >
      {{ initial(pin.thread) }}
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
      :inbox="inbox"
      :style="cardPosition"
    />
    <button
      v-if="mayComment(store)"
      type="button"
      class="pointer-events-auto absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full bg-panel text-surface shadow-md data-[active]:bg-accent data-[active]:text-white"
      data-slot="presenter-comment-mode"
      :data-active="comments.state.value.placing || undefined"
      :aria-label="`${messages.tool} (C)`"
      :aria-pressed="comments.state.value.placing"
      @click="toggleCommentPlacing(store)"
    >
      <icon-hugeicons-comment-01 class="size-4" />
    </button>
  </div>
</template>
