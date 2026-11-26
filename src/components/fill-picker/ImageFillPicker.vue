<script setup lang="ts">
import { useFileDialog, useObjectUrl } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'

import {
  hasImageFilters,
  IMAGE_FILTER_KEYS,
  imageFilterValue,
  type Fill,
  type ImageFilterKey,
  type ImageScaleMode
} from '@kalka/scene-graph'
import { useEffectMessages } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import NumberField from '@/components/inputs/NumberField.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

const IMAGE_SCALE_MODES: { value: ImageScaleMode; label: string }[] = [
  { value: 'FILL', label: 'Fill' },
  { value: 'FIT', label: 'Fit' },
  { value: 'CROP', label: 'Crop' },
  { value: 'TILE', label: 'Tile' }
]

const { fill } = defineProps<{ fill: Fill }>()
const emit = defineEmits<{ update: [fill: Fill] }>()

const store = useEditorStore()

const imageBlob = shallowRef<Blob | null>(null)
const imagePreviewURL = useObjectUrl(imageBlob)

watch(
  () => fill.imageHash,
  (hash) => {
    if (!hash) {
      imageBlob.value = null
      return
    }
    const data = store.getImage(hash)
    imageBlob.value = data ? new Blob([data]) : null
  },
  { immediate: true }
)

const { open: pickImage, onChange: onFileChange } = useFileDialog({
  accept: 'image/png,image/jpeg,image/webp',
  multiple: false
})

onFileChange(async (files) => {
  const file = files?.[0]
  if (!file) return
  const bytes = new Uint8Array(await file.arrayBuffer())
  const hash = store.storeImage(bytes)
  emit('update', {
    ...fill,
    type: 'IMAGE',
    imageHash: hash,
    imageScaleMode: fill.imageScaleMode ?? 'FILL'
  })
})

const labels = useEffectMessages()

/** Figma's image adjustments, each from -100 to 100 in the panel and -1 to 1 on the paint. */
function adjustment(key: ImageFilterKey): number {
  return Math.round(imageFilterValue(fill.filters, key) * 100)
}

function adjust(key: ImageFilterKey, value: number) {
  const filters = { ...fill.filters, [key]: Math.max(-1, Math.min(1, value / 100)) }
  emit('update', { ...fill, filters: hasImageFilters(filters) ? filters : undefined })
}

function resetAdjustments() {
  emit('update', { ...fill, filters: undefined })
}

const scaleMode = computed({
  get: () => fill.imageScaleMode ?? ('FILL' as ImageScaleMode),
  set: (mode: ImageScaleMode) => emit('update', { ...fill, imageScaleMode: mode })
})
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="imagePreviewURL"
      class="flex h-24 items-center justify-center overflow-hidden rounded border border-border"
    >
      <img :src="imagePreviewURL" class="max-h-full max-w-full object-contain" />
    </div>
    <AppButton
      variant="outline"
      class="w-full"
      data-test-id="fill-picker-choose-image"
      @click="pickImage()"
    >
      <template #leading><icon-hugeicons-image-01 class="size-3" /></template>
      {{ fill.imageHash ? 'Replace' : 'Choose image' }}
    </AppButton>
    <AppSelect
      :model-value="scaleMode"
      :options="IMAGE_SCALE_MODES"
      @update:model-value="(m) => (scaleMode = m as ImageScaleMode)"
    />
    <div class="flex flex-col gap-1" data-slot="image-adjustments">
      <div class="flex items-center justify-between">
        <span class="text-[11px] text-muted">{{ labels.adjustments }}</span>
        <IconButton
          v-if="hasImageFilters(fill.filters)"
          :label="labels.resetAdjustments"
          data-test-id="image-adjustments-reset"
          @click="resetAdjustments"
        >
          <icon-hugeicons-refresh-cw class="size-3" />
        </IconButton>
      </div>
      <NumberField
        v-for="key in IMAGE_FILTER_KEYS"
        :key="key"
        :label="labels[key]"
        :aria-label="labels[key]"
        :model-value="adjustment(key)"
        :min="-100"
        :max="100"
        :data-property="`image-${key}`"
        @update:model-value="adjust(key, $event)"
      />
    </div>
  </div>
</template>
