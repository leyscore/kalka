<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, ref, useTemplateRef, watch } from 'vue'

import type { VideoPlayback } from '@kalka/scene-graph'
import { usePrototypeMessages, videoFrame } from '@kalka/vue'

import { formatNumber } from '@/app/i18n/number'
import AppButton from '@/components/ui/button/AppButton.vue'
import { videoTimeline } from '@/theme/video-timeline'

/**
 * A video fill's clip on a timeline, as Figma's video settings show it: the part a prototype
 * plays (Trim, from a start to an end of the clip) and the frame canvases and exports draw for
 * it (Poster frame), picked by scrubbing the preview and keeping the frame it shows.
 */
const { src, poster, playback } = defineProps<{
  src: string
  poster?: string
  /** Null while no layer is selected: the clip shows, but nothing trims it. */
  playback: VideoPlayback | null
}>()
const emit = defineEmits<{
  trim: [startTime: number, endTime: number | null]
  poster: [png: Uint8Array]
}>()

const m = usePrototypeMessages()
const ui = videoTimeline()

/** The slider's step and the precision times are kept at, in seconds. */
const STEP = 0.1

const video = useTemplateRef<HTMLVideoElement>('video')
const duration = ref(0)
const time = ref(0)

/**
 * The clip's length. A recorded WebM may not say it until played through, so the preview seeks
 * past its end once to learn it, then goes back to the start.
 */
useEventListener(video, 'loadedmetadata', () => {
  const element = video.value
  if (!element) return
  if (Number.isFinite(element.duration)) duration.value = element.duration
  else element.currentTime = Number.MAX_SAFE_INTEGER
})
useEventListener(video, 'durationchange', () => {
  const element = video.value
  if (!element || !Number.isFinite(element.duration) || element.duration === duration.value) return
  duration.value = element.duration
  element.currentTime = 0
})
useEventListener(video, 'timeupdate', () => {
  time.value = video.value?.currentTime ?? 0
})

const rounded = (seconds: number) => Math.round(seconds / STEP) * STEP

/** The trimmed part, its end at the clip's end when it plays to the end. */
const trim = ref<number[]>([0, 0])
watch(
  () => [playback?.startTime, playback?.endTime, duration.value] as const,
  ([start = 0, end = null, length]) => {
    trim.value = [Math.min(start, length), end === null ? length : Math.min(end, length)]
  },
  { immediate: true }
)

/** Seeks the preview to the thumb a drag moves, so the frame there shows. */
function previewTrim(values: number[]) {
  const [start, end] = values
  if (start === undefined || end === undefined || !video.value) return
  video.value.currentTime = start !== trim.value[0] ? start : end
  trim.value = values
}

function commitTrim(values: number[]) {
  const [start = 0, end = duration.value] = values
  const startTime = rounded(start)
  // An end at the clip's own end plays to the end, whatever the clip's length turns out to be.
  const endTime = end >= duration.value - STEP / 2 ? null : rounded(end)
  emit('trim', startTime, endTime !== null && endTime <= startTime ? null : endTime)
}

const scrub = computed<number[]>({
  get: () => [time.value],
  set: ([next]) => {
    if (next === undefined || !video.value) return
    video.value.pause()
    video.value.currentTime = next
    time.value = next
  }
})

async function keepFrame() {
  const element = video.value
  if (!element) return
  // A frame still seeking would keep the one shown before it.
  if (element.seeking)
    await new Promise((resolve) => {
      element.addEventListener('seeked', resolve, { once: true })
    })
  const png = await videoFrame(element)
  if (png) emit('poster', png)
}

const seconds = (value: number) => `${formatNumber(rounded(value))} s`
</script>

<template>
  <div :class="ui.root()" data-slot="video-timeline">
    <div :class="ui.preview()">
      <video
        ref="video"
        :src
        :poster
        :class="ui.video()"
        data-test-id="fill-picker-video-preview"
        preload="auto"
        muted
        playsinline
      />
    </div>
    <template v-if="duration > 0">
      <div v-if="playback" :class="ui.row()">
        <span :class="ui.label()">{{ m.videoTrim }}</span>
        <SliderRoot
          :model-value="trim"
          :min="0"
          :max="duration"
          :step="STEP"
          :min-steps-between-thumbs="1"
          :class="ui.slider()"
          data-property="video-trim"
          @update:model-value="(values) => values && previewTrim(values)"
          @value-commit="commitTrim"
        >
          <SliderTrack :class="ui.track()">
            <SliderRange :class="ui.range()" />
          </SliderTrack>
          <SliderThumb :class="ui.thumb()" :aria-label="m.videoTrim" />
          <SliderThumb :class="ui.thumb()" :aria-label="m.videoTrim" />
        </SliderRoot>
        <span :class="ui.value()" data-test-id="video-trim-value">
          {{ seconds(trim[0] ?? 0) }} – {{ seconds(trim[1] ?? duration) }}
        </span>
      </div>
      <div :class="ui.row()">
        <span :class="ui.label()">{{ m.videoPosterFrame }}</span>
        <SliderRoot
          v-model="scrub"
          :min="0"
          :max="duration"
          :step="STEP"
          :class="ui.slider()"
          data-property="video-poster-time"
        >
          <SliderTrack :class="ui.track()" />
          <SliderThumb :class="ui.thumb()" :aria-label="m.videoPosterFrame" />
        </SliderRoot>
        <span :class="ui.value()">{{ seconds(time) }}</span>
      </div>
      <AppButton
        variant="outline"
        class="w-full"
        data-test-id="fill-picker-video-keep-frame"
        @click="keepFrame"
      >
        {{ m.useFrameAsPoster }}
      </AppButton>
    </template>
  </div>
</template>
