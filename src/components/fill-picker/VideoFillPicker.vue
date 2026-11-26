<script setup lang="ts">
import { useFileDialog, useObjectUrl } from '@vueuse/core'
import { computed, shallowRef, useId, watch } from 'vue'

import {
  videoPlaybackOf,
  type Fill,
  type ImageScaleMode,
  type VideoPlayback
} from '@kalka/scene-graph'
import { readVideoFile, usePrototypeMessages, useSceneComputed } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import AppCheckbox from '@/components/ui/toggle/AppCheckbox.vue'

/**
 * A video paint, as Figma's video fill: the clip and its poster frame, how it fits the layer,
 * and how it plays in prototypes (Autoplay, Loop, Muted), which Figma keeps on the layer.
 * Canvases and exports draw the poster; the presenter plays the clip.
 */
const SCALE_MODES: { value: ImageScaleMode; label: string }[] = [
  { value: 'FILL', label: 'Fill' },
  { value: 'FIT', label: 'Fit' },
  { value: 'CROP', label: 'Crop' }
]

const { fill } = defineProps<{ fill: Fill }>()
const emit = defineEmits<{ update: [fill: Fill] }>()

const store = useEditorStore()
const m = usePrototypeMessages()

const clip = shallowRef<Blob | null>(null)
const clipURL = useObjectUrl(clip)
const poster = shallowRef<Blob | null>(null)
const posterURL = useObjectUrl(poster)

function blobOf(hash: string | undefined): Blob | null {
  const data = hash ? store.getImage(hash) : undefined
  return data ? new Blob([data.slice()]) : null
}

watch(
  () => [fill.videoHash, fill.imageHash],
  () => {
    clip.value = blobOf(fill.videoHash)
    poster.value = blobOf(fill.imageHash)
  },
  { immediate: true }
)

const { open: pickVideo, onChange } = useFileDialog({
  accept: 'video/mp4,video/quicktime,video/webm',
  multiple: false,
  reset: true
})

onChange(async (files) => {
  const file = files?.[0]
  const video = file ? await readVideoFile(file) : null
  if (!video) return
  emit('update', {
    ...fill,
    type: 'VIDEO',
    videoHash: store.storeImage(video.bytes),
    imageHash: store.storeImage(video.poster),
    imageScaleMode: fill.imageScaleMode ?? 'FILL'
  })
})

const scaleMode = computed({
  get: () => fill.imageScaleMode ?? ('FILL' as ImageScaleMode),
  set: (mode: ImageScaleMode) => emit('update', { ...fill, imageScaleMode: mode })
})

/** The selected layers whose video plays as these settings say. */
const layers = useSceneComputed(() =>
  [...store.state.selectedIds].flatMap((id) => {
    const node = store.graph.getNode(id)
    return node ? [node] : []
  })
)
const playback = computed(() => videoPlaybackOf(layers.value[0] ?? { videoPlayback: null }))

function setPlayback(key: keyof VideoPlayback, value: boolean) {
  for (const node of layers.value)
    store.updateNodeWithUndo(
      node.id,
      { videoPlayback: { ...videoPlaybackOf(node), [key]: value } },
      'Change video playback'
    )
}

const ids = { autoplay: useId(), loop: useId(), muted: useId() }
const OPTIONS: (keyof VideoPlayback)[] = ['autoplay', 'loop', 'muted']
</script>

<template>
  <div class="space-y-2" data-slot="video-fill">
    <div
      v-if="clipURL || posterURL"
      class="flex h-24 items-center justify-center overflow-hidden rounded border border-border"
    >
      <video
        v-if="clipURL"
        :src="clipURL"
        :poster="posterURL"
        class="max-h-full max-w-full object-contain"
        data-test-id="fill-picker-video-preview"
        muted
        loop
        autoplay
        playsinline
      />
      <img v-else-if="posterURL" :src="posterURL" class="max-h-full max-w-full object-contain" />
    </div>
    <AppButton
      variant="outline"
      class="w-full"
      data-test-id="fill-picker-choose-video"
      @click="pickVideo()"
    >
      <template #leading><icon-hugeicons-video-01 class="size-3" /></template>
      {{ fill.videoHash ? m.replaceVideo : m.chooseVideo }}
    </AppButton>
    <AppSelect
      :model-value="scaleMode"
      :options="SCALE_MODES"
      @update:model-value="(mode) => (scaleMode = mode as ImageScaleMode)"
    />
    <div v-if="layers.length > 0" class="flex flex-col gap-0.5" data-slot="video-playback">
      <span class="text-[11px] text-muted">{{ m.videoPlayback }}</span>
      <label
        v-for="option in OPTIONS"
        :key="option"
        class="flex cursor-pointer items-center gap-2 py-0.5 text-[11px] text-surface"
      >
        <AppCheckbox
          :model-value="playback[option]"
          :ariaLabelledby="ids[option]"
          :data-property="`video-${option}`"
          @update:model-value="setPlayback(option, $event)"
        />
        <span :id="ids[option]">{{ m[option] }}</span>
      </label>
    </div>
  </div>
</template>
