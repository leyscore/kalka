<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  ANNOTATION_COLORS,
  documentAnnotationCategories,
  type AnnotationColor
} from '@kalka/scene-graph'
import { useCommentsMessages } from '@kalka/vue'

import {
  ANNOTATION_COLOR_CSS,
  createAnnotationCategory,
  deleteAnnotationCategory,
  editAnnotationCategory
} from '@/app/comments/annotation-categories'
import { useEditorStore } from '@/app/editor/active-store'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppDialog from '@/components/ui/dialog/AppDialog.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

/**
 * Manage categories, as Figma's: the categories the file adds to the presets, each with a label
 * and a colour, renamed, recoloured or deleted in place, and new ones added at the end.
 */
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ added: [id: string] }>()

const store = useEditorStore()
const messages = useCommentsMessages()
const draft = ref('')

const categories = computed(() => {
  void store.state.sceneVersion
  return documentAnnotationCategories(store.graph)
})

const COLOR_LABEL = {
  yellow: 'colorYellow',
  orange: 'colorOrange',
  red: 'colorRed',
  pink: 'colorPink',
  violet: 'colorViolet',
  blue: 'colorBlue',
  teal: 'colorTeal',
  green: 'colorGreen'
} as const satisfies Record<AnnotationColor, string>

const colorOptions = computed(() =>
  ANNOTATION_COLORS.map((color) => ({ value: color, label: messages.value[COLOR_LABEL[color]] }))
)

function isColor(value: string): value is AnnotationColor {
  return ANNOTATION_COLORS.some((color) => color === value)
}

/** Labels being typed, written as one step when the field is left. */
const labels = ref<Record<string, string>>({})

function rename(id: string) {
  const label = labels.value[id]
  const current = categories.value.find((category) => category.id === id)
  const { [id]: _done, ...rest } = labels.value
  labels.value = rest
  if (label !== undefined && current && current.label !== label.trim())
    editAnnotationCategory(store, id, { label })
}

function recolor(id: string, value: string) {
  if (isColor(value)) editAnnotationCategory(store, id, { color: value })
}

function add() {
  const label = draft.value.trim()
  if (!label) return
  const category = createAnnotationCategory(store, label)
  draft.value = ''
  emit('added', category.id)
}
</script>

<template>
  <AppDialog
    v-model:open="open"
    size="sm"
    :heading="messages.categoriesTitle"
    :description="messages.categoriesDescription"
    :close-label="messages.categoriesDone"
    data-test-id="annotation-categories"
  >
    <div class="flex flex-col gap-2">
      <p v-if="!categories.length" class="text-xs text-muted">{{ messages.categoriesNone }}</p>
      <ul v-else class="flex flex-col gap-1">
        <li
          v-for="category in categories"
          :key="category.id"
          class="flex items-center gap-1.5"
          data-slot="annotation-category"
        >
          <span
            class="size-3 shrink-0 rounded-full"
            :style="{ backgroundColor: ANNOTATION_COLOR_CSS[category.color] }"
            aria-hidden="true"
          />
          <AppInput
            :model-value="labels[category.id] ?? category.label"
            size="xs"
            class="min-w-0 flex-1"
            :aria-label="messages.categoryName"
            :placeholder="messages.categoryUntitled"
            data-test-id="annotation-category-label"
            @update:model-value="labels[category.id] = String($event)"
            @change="rename(category.id)"
          />
          <AppSelect
            :model-value="category.color"
            :options="colorOptions"
            :label="messages.categoryColor"
            data-test-id="annotation-category-color"
            :ui="{ trigger: 'h-6 w-24 text-[11px]' }"
            @update:model-value="recolor(category.id, $event)"
          />
          <IconButton
            :label="messages.categoryDelete({ name: category.label || messages.categoryUntitled })"
            data-test-id="annotation-category-delete"
            @click="deleteAnnotationCategory(store, category.id)"
          >
            <icon-hugeicons-delete-02 />
          </IconButton>
        </li>
      </ul>
      <form class="flex items-center gap-1.5" @submit.prevent="add">
        <AppInput
          v-model="draft"
          size="xs"
          class="min-w-0 flex-1"
          :aria-label="messages.categoryName"
          :placeholder="messages.categoryNew"
          data-test-id="annotation-category-new"
        />
        <AppButton
          type="submit"
          size="xs"
          :disabled="!draft.trim()"
          data-test-id="annotation-category-add"
        >
          {{ messages.categoryAdd }}
        </AppButton>
      </form>
    </div>
  </AppDialog>
</template>
