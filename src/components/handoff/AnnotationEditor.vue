<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

import {
  ANNOTATION_CATEGORIES,
  ANNOTATION_PROPERTY_CSS,
  annotationPropertiesFor,
  annotationPropertyValue,
  handoffLabel,
  updateAnnotation,
  type AnnotationCategory,
  type AnnotationProperty,
  type CommentThread,
  type SceneNode
} from '@kalka/scene-graph'
import { useCommentsMessages } from '@kalka/vue'

import { focusedAnnotation } from '@/app/comments/annotations'
import type { CommentsController } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

/**
 * One annotation of the selected layer: its note, its category, and the layer properties it
 * pins with their values now. Changes apply as they are made, like a comment's.
 */
const { thread, node, comments } = defineProps<{
  thread: CommentThread
  node: SceneNode
  comments: CommentsController
}>()

const store = useEditorStore()
const messages = useCommentsMessages()
const field = useTemplateRef<HTMLTextAreaElement>('field')
const text = ref(handoffLabel(thread))

watch(
  () => handoffLabel(thread),
  (label) => {
    if (document.activeElement !== field.value) text.value = label
  }
)

function commitLabel() {
  if (text.value.trim() === handoffLabel(thread)) return
  updateAnnotation(store.graph, thread.id, { label: text.value })
  store.requestRefresh()
}

const CATEGORY_LABEL: Record<AnnotationCategory | 'none', () => string> = {
  none: () => messages.value.categoryNone,
  accessibility: () => messages.value.categoryAccessibility,
  behavior: () => messages.value.categoryBehavior,
  content: () => messages.value.categoryContent,
  development: () => messages.value.categoryDevelopment,
  interaction: () => messages.value.categoryInteraction
}

const categoryOptions = computed(() =>
  (['none', ...ANNOTATION_CATEGORIES] as const).map((value) => ({
    value,
    label: CATEGORY_LABEL[value]()
  }))
)

function setCategory(value: AnnotationCategory | 'none') {
  updateAnnotation(store.graph, thread.id, { category: value === 'none' ? null : value })
  store.requestRefresh()
}

const pinned = computed(() => {
  void store.state.sceneVersion
  return (thread.annotation?.properties ?? []).map((name) => ({
    name,
    label: ANNOTATION_PROPERTY_CSS[name],
    value: annotationPropertyValue(store.graph, node, name)
  }))
})

const PICK = 'pick'
const propertyOptions = computed(() => [
  { value: PICK, label: messages.value.pinProperty, disabled: true },
  ...annotationPropertiesFor(node)
    .filter((name) => !thread.annotation?.properties.includes(name))
    .map((name) => ({ value: name, label: ANNOTATION_PROPERTY_CSS[name] }))
])

function setProperties(properties: AnnotationProperty[]) {
  updateAnnotation(store.graph, thread.id, { properties })
  store.requestRefresh()
}

function pin(value: string) {
  const name = annotationPropertiesFor(node).find((candidate) => candidate === value)
  if (name) setProperties([...(thread.annotation?.properties ?? []), name])
}

function unpin(name: AnnotationProperty) {
  setProperties((thread.annotation?.properties ?? []).filter((candidate) => candidate !== name))
}

// A new annotation opens with the caret in its note, as Figma's Annotation tool leaves it.
onMounted(async () => {
  if (focusedAnnotation.value !== thread.id) return
  focusedAnnotation.value = null
  await nextTick()
  field.value?.focus()
})
watch(focusedAnnotation, async (id) => {
  if (id !== thread.id) return
  focusedAnnotation.value = null
  await nextTick()
  field.value?.focus()
})
</script>

<template>
  <li
    class="flex flex-col gap-1.5 rounded-lg border border-border p-2"
    data-slot="annotation-editor"
    :data-category="thread.annotation?.category"
  >
    <div class="flex items-center gap-1">
      <AppSelect
        :model-value="thread.annotation?.category ?? 'none'"
        :options="categoryOptions"
        :label="messages.category"
        data-test-id="annotation-category"
        :ui="{ trigger: 'h-6 min-w-0 flex-1 text-[11px]' }"
        @update:model-value="setCategory"
      />
      <IconButton :label="messages.deleteAnnotation" @click="comments.remove(thread.id)">
        <icon-hugeicons-delete-02 />
      </IconButton>
    </div>
    <textarea
      ref="field"
      v-model="text"
      rows="2"
      class="w-full resize-none rounded-md border border-border bg-input px-2 py-1 text-[11px] outline-none focus:border-accent"
      data-test-id="annotation-label"
      :aria-label="messages.annotationLabel"
      :placeholder="messages.annotationPlaceholder"
      @blur="commitLabel"
      @keydown.enter.exact.prevent="field?.blur()"
      @keydown.escape.stop="field?.blur()"
    />
    <ul v-if="pinned.length > 0" class="flex flex-col gap-0.5" data-slot="annotation-properties">
      <li
        v-for="row in pinned"
        :key="row.name"
        class="group flex items-center gap-2 font-mono text-[10px]"
        :data-property="row.name"
      >
        <span class="text-muted">{{ row.label }}</span>
        <span class="min-w-0 flex-1 truncate text-surface">{{ row.value }}</span>
        <IconButton
          :label="messages.unpinProperty({ name: row.label })"
          class="size-4 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          @click="unpin(row.name)"
        >
          <icon-hugeicons-cancel-01 class="size-3" />
        </IconButton>
      </li>
    </ul>
    <AppSelect
      v-if="propertyOptions.length > 1"
      :model-value="PICK"
      :options="propertyOptions"
      :label="messages.pinProperty"
      data-test-id="annotation-pin-property"
      :ui="{ trigger: 'h-6 text-[11px]' }"
      @update:model-value="pin"
    />
  </li>
</template>
