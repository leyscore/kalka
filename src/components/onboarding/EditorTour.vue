<script setup lang="ts">
import { useRafFn } from '@vueuse/core'
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui'
import { computed, shallowRef, watch } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { useAIChat } from '@/app/ai/chat/use'
import {
  endTour,
  nextTourStop,
  TOUR_STOPS,
  tourAnchor,
  tourIndex,
  tourStop
} from '@/app/onboarding/tour'
import AppButton from '@/components/ui/button/AppButton.vue'

/** How long a stop waits for its element to appear before the tour moves past it. */
const ANCHOR_TIMEOUT_MS = 2000
const SPOTLIGHT_PADDING = 4

const { welcome } = useI18n()
const { activeTab: panelTab } = useAIChat()
const anchor = shallowRef<HTMLElement | null>(null)
const rect = shallowRef<DOMRect | null>(null)
let searchingSince = 0

const text = computed(() => {
  const w = welcome.value
  const id = tourStop.value?.id
  if (id === 'code') return { title: w.tourCodeTitle, body: w.tourCodeBody }
  if (id === 'layers') return { title: w.tourLayersTitle, body: w.tourLayersBody }
  if (id === 'toolbar') return { title: w.tourToolbarTitle, body: w.tourToolbarBody }
  return { title: w.tourAITitle, body: w.tourAIBody }
})
const isLast = computed(() => tourIndex.value === TOUR_STOPS.length - 1)

watch(tourStop, (stop) => {
  anchor.value = null
  rect.value = null
  searchingSince = performance.now()
  if (stop?.panelTab) panelTab.value = stop.panelTab
})

// The stop's element can mount late (a panel opening) and move (a resize), so it is followed
// every frame while the tour is open.
const { pause, resume } = useRafFn(
  () => {
    const stop = tourStop.value
    if (!stop) return
    const element = tourAnchor(stop)
    if (!element) {
      if (performance.now() - searchingSince > ANCHOR_TIMEOUT_MS) nextTourStop()
      return
    }
    anchor.value = element
    const next = element.getBoundingClientRect()
    const previous = rect.value
    if (
      !previous ||
      previous.x !== next.x ||
      previous.y !== next.y ||
      previous.width !== next.width ||
      previous.height !== next.height
    )
      rect.value = next
  },
  { immediate: false }
)

watch(
  () => tourIndex.value !== null,
  (open) => {
    if (open) {
      searchingSince = performance.now()
      if (tourStop.value?.panelTab) panelTab.value = tourStop.value.panelTab
      resume()
    } else pause()
  },
  { immediate: true }
)

const spotlight = computed(() => {
  const box = rect.value
  if (!box) return null
  return {
    left: `${box.left - SPOTLIGHT_PADDING}px`,
    top: `${box.top - SPOTLIGHT_PADDING}px`,
    width: `${box.width + SPOTLIGHT_PADDING * 2}px`,
    height: `${box.height + SPOTLIGHT_PADDING * 2}px`
  }
})
</script>

<template>
  <template v-if="tourStop">
    <div
      v-if="spotlight"
      class="pointer-events-none fixed z-[150] rounded-[10px] ring-2 ring-accent transition-all duration-300 ease-out motion-reduce:transition-none"
      :style="{ ...spotlight, boxShadow: '0 0 0 100vmax var(--color-scrim)' }"
      aria-hidden="true"
    />
    <PopoverRoot :open="anchor !== null" :modal="false">
      <PopoverAnchor :reference="anchor ?? undefined" />
      <PopoverPortal>
        <PopoverContent
          :key="tourStop.id"
          :side="tourStop.side"
          :side-offset="14"
          :collision-padding="16"
          class="z-[160] w-[320px] rounded-[16px] bg-float p-5 text-surface shadow-[0_0_0_1px_var(--color-float-border),var(--float-shadow)] backdrop-blur-[28px] backdrop-saturate-150 outline-none animate-in fade-in zoom-in-95 duration-200"
          data-test-id="editor-tour"
          @escape-key-down="endTour"
          @interact-outside.prevent
        >
          <p class="mb-1.5 font-mono text-[11px] font-medium text-highlight tabular-nums">
            {{ welcome.tourStep({ current: (tourIndex ?? 0) + 1, total: TOUR_STOPS.length }) }}
          </p>
          <h2 class="font-display text-xl leading-tight font-semibold tracking-[-0.03em]">
            {{ text.title }}
          </h2>
          <p class="mt-2 text-[13px] leading-relaxed text-muted">{{ text.body }}</p>
          <div class="mt-5 flex items-center justify-between">
            <button
              type="button"
              class="rounded-[7px] text-[13px] font-medium text-muted transition-colors outline-none hover:text-surface focus-visible:ring-2 focus-visible:ring-accent/50"
              @click="endTour"
            >
              {{ welcome.tourSkip }}
            </button>
            <AppButton
              size="lg"
              color="primary"
              variant="solid"
              class="rounded-[9px] px-5 font-semibold"
              @click="nextTourStop"
            >
              {{ isLast ? welcome.tourDone : welcome.tourNext }}
            </AppButton>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </template>
</template>
