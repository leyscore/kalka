<script setup lang="ts">
import { computed, normalizeClass, type HTMLAttributes } from 'vue'

import { useI18n } from '@kalka/vue'

import { documentEntry } from '@/theme/home/document-entry'

const {
  name,
  metadata,
  previewURL,
  badge,
  view = 'grid',
  lead = false,
  disabled = false,
  class: className
} = defineProps<{
  name: string
  metadata: string
  previewURL?: string | null
  /** A short word beside the name, such as Draft for a file never saved. */
  badge?: string
  view?: 'grid' | 'list'
  /** The last file opened, shown larger with a button to continue it. */
  lead?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
const emit = defineEmits<{ open: [] }>()
const { files } = useI18n()
const styles = computed(() => documentEntry({ view, lead: lead && view === 'grid' }))
const HANDLES = [
  '-top-[5px] -left-[5px]',
  '-top-[5px] -right-[5px]',
  '-bottom-[5px] -left-[5px]',
  '-right-[5px] -bottom-[5px]'
]
</script>

<template>
  <div data-slot="document-entry" :class="styles.root({ class: normalizeClass(className) })">
    <button
      type="button"
      :disabled="disabled"
      data-slot="trigger"
      :class="styles.trigger()"
      @click="emit('open')"
    >
      <template v-if="view === 'grid'">
        <span data-slot="body" :class="styles.body()">
          <span data-slot="name" :class="styles.name()">{{ name }}</span>
          <span v-if="badge" data-slot="badge" :class="styles.badge()">{{ badge }}</span>
          <span data-slot="metadata" :class="styles.metadata()">{{ metadata }}</span>
        </span>
        <span data-slot="preview" :class="styles.preview()">
          <img v-if="previewURL" :src="previewURL" alt="" :class="styles.image()" />
          <icon-hugeicons-file-image v-else :class="styles.fallback()" />
          <span v-if="lead" :class="styles.continueBar()">
            <span :class="styles.continueText()">{{ metadata }}</span>
            <span :class="styles.continueButton()">
              {{ files.continueFile }}<icon-hugeicons-arrow-right-01 class="size-3.5" />
            </span>
          </span>
          <i
            v-for="corner in HANDLES"
            :key="corner"
            aria-hidden="true"
            :class="styles.handle({ class: corner })"
          />
        </span>
      </template>
      <template v-else>
        <icon-hugeicons-file-image :class="styles.icon()" />
        <span data-slot="body" :class="styles.body()">
          <span data-slot="name" :class="styles.name()">{{ name }}</span>
          <span v-if="badge" data-slot="badge" :class="styles.badge()">{{ badge }}</span>
          <span data-slot="metadata" :class="styles.metadata()">{{ metadata }}</span>
        </span>
        <span :class="styles.trailingMetadata()">{{ metadata }}</span>
      </template>
    </button>
    <div v-if="$slots.actions" data-slot="actions" :class="styles.actions()">
      <slot name="actions" />
    </div>
  </div>
</template>
