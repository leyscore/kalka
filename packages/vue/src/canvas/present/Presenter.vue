<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef, watch } from 'vue'

import { shownFrames } from '@kalka/core/editor'
import { colorToCSS } from '@kalka/scene-graph/color'

import { useEditor } from '#vue/editor/context'

import { useDelayTimers } from './delays'
import { useHotspotHints } from './hotspots'
import { settled, usePresentPlayback } from './playback'
import PresentScreen from './PresentScreen.vue'
import { usePresentScreens } from './screens'
import { applyScrolling, overlayPlacement } from './scrolling'
import { PADDING, usePresentStage } from './stage'
import { usePresentTriggers } from './triggers'

/**
 * Presents a page's prototype, as Figma's presentation view: one screen at a time over the
 * page's prototype background, on its device's screen when it has one, with overlays above it.
 * The layers are live DOM, so controls run and the browser lays out each screen; interactions
 * run through Core's presentation steps and play as Web Animations.
 */
const { pageId, startId, revision } = defineProps<{
  pageId: string
  startId: string
  /** Changing it restarts the presentation, as Figma's Restart. */
  revision: number
}>()
const editor = useEditor()

const viewport = useTemplateRef<HTMLElement>('viewport')
const scroller = useTemplateRef<HTMLElement>('scroller')
const scaler = useTemplateRef<HTMLElement>('scaler')

const screens = usePresentScreens(pageId, startId)
const { present, screen, leaving, overlays, instances, register } = screens
const stage = usePresentStage({
  pageId: () => pageId,
  screenRootId: () => screen.value.rootId,
  viewport,
  scaler
})
const { background, box, hasDevice, body, scale, device } = stage

const timers = useDelayTimers((reaction, context) => triggers.runReaction(reaction, context))

/** An instance changed variant: the timers of the variant it left stop, the new one's start. */
function rearmVariant(rootId: string, path: string) {
  const frame = screens.shownFrameViews().find((view) => view.rootId === rootId)
  if (frame) timers.rearm(frame, path)
}

const { apply, queue } = usePresentPlayback({
  screens,
  stage,
  scroller,
  viewport,
  onVariant: rearmVariant
})

/** A click that runs nothing flashes where the layers that do something are. */
const { hotspots, fading, flash } = useHotspotHints(
  (element) => stage.boxIn(element) ?? { x: 0, y: 0, width: 0, height: 0 }
)

const triggers = usePresentTriggers({
  screens,
  apply,
  queue,
  later: timers.later,
  onMiss: () => flash(screens.shownFrameViews())
})
const { onPointerMove, onPointerLeave, onPointerDown, onClick, onOutside } = triggers

// --- Scrolling and restarts -----------------------------------------------------------------

let unscroll: (() => void)[] = []
async function arrange() {
  await settled()
  for (const stop of unscroll) stop()
  unscroll = []
  for (const key of screens.shownKeys()) {
    const instance = instances.get(key)
    if (instance?.container)
      unscroll.push(
        applyScrolling(instance.graph(), instance.container, [scroller.value, viewport.value])
      )
  }
  timers.arm(screens.shownFrameViews())
}

watch(
  () => shownFrames(present.value).join('|') + screen.value.key,
  () => void arrange(),
  { immediate: true }
)

watch(
  () => [startId, revision] as const,
  () => {
    timers.clear()
    triggers.reset()
    screens.restart(pageId, startId)
  }
)

onBeforeUnmount(() => {
  timers.clear()
  for (const stop of unscroll) stop()
})

function overlayStyle(overlay: (typeof overlays.value)[number]) {
  const trigger = overlay.triggerId
    ? instances.get(screen.value.key)?.elementOf(overlay.triggerId)
    : null
  const frame = editor.graph.getNode(overlay.frameId)
  const position = overlayPlacement(
    frame?.overlayPositionType ?? 'CENTER',
    stage.frameSize(overlay.frameId),
    box.value,
    trigger ? stage.boxIn(trigger) : null,
    overlay.offset
  )
  return { left: `${position.x}px`, top: `${position.y}px` }
}

function overlayBackground(frameId: string): string {
  const color = editor.graph.getNode(frameId)?.overlayBackground
  return color ? colorToCSS(color) : 'transparent'
}
</script>

<template>
  <div
    ref="viewport"
    data-test-id="prototype-presenter"
    class="absolute inset-0 overflow-auto"
    :style="{ background }"
  >
    <div
      class="flex min-h-full min-w-full items-center justify-center"
      :style="{ padding: `${PADDING}px` }"
    >
      <div class="flex shrink-0 flex-col items-center">
        <div
          data-test-id="prototype-device"
          :data-device="body ? 'true' : 'false'"
          :style="device.body"
        >
          <div
            class="relative shrink-0 overflow-hidden"
            :style="{
              width: `${box.width * scale}px`,
              height: `${box.height * scale}px`,
              ...device.screen
            }"
          >
            <div
              ref="scaler"
              class="absolute top-0 left-0 origin-top-left"
              :style="{
                width: `${box.width}px`,
                height: `${box.height}px`,
                transform: `scale(${scale})`
              }"
              @pointermove="onPointerMove"
              @pointerleave="onPointerLeave"
              @pointerdown="onPointerDown"
              @click="onClick"
            >
              <div
                ref="scroller"
                class="absolute inset-0"
                :class="hasDevice ? 'overflow-auto' : 'overflow-hidden'"
              >
                <PresentScreen
                  v-if="leaving"
                  :key="leaving.shown.key"
                  :ref="(value) => register(leaving?.shown.key ?? '', value)"
                  :root-id="leaving.shown.rootId"
                  :revision="revision"
                  :variants="present.variants[leaving.shown.rootId]"
                  :variables="present.variables"
                  class="absolute top-0 left-0"
                  :style="{ zIndex: leaving.onTop ? 2 : 0 }"
                />
                <PresentScreen
                  :key="screen.key"
                  :ref="(value) => register(screen.key, value)"
                  :root-id="screen.rootId"
                  :revision="revision"
                  :variants="present.variants[screen.rootId]"
                  :variables="present.variables"
                  class="absolute top-0 left-0"
                  :style="{ zIndex: 1 }"
                />
              </div>
              <div
                v-for="overlay in overlays"
                :key="overlay.key"
                data-test-id="prototype-overlay"
                class="absolute inset-0 z-10"
                :style="{ background: overlayBackground(overlay.frameId) }"
                @click="onOutside($event, overlay.frameId)"
              >
                <PresentScreen
                  :ref="(value) => register(overlay.key, value)"
                  :root-id="overlay.frameId"
                  :revision="revision"
                  :variants="present.variants[overlay.frameId]"
                  :variables="present.variables"
                  class="absolute"
                  :style="overlayStyle(overlay)"
                />
              </div>
              <div
                v-for="hotspot in hotspots"
                :key="hotspot.id"
                data-test-id="prototype-hotspot"
                class="pointer-events-none absolute z-20 rounded-[2px] border border-[#0d99ff] bg-[#0d99ff]/25 transition-opacity duration-300"
                :class="{ 'opacity-0': fading }"
                :style="{
                  left: `${hotspot.x}px`,
                  top: `${hotspot.y}px`,
                  width: `${hotspot.width}px`,
                  height: `${hotspot.height}px`
                }"
              />
            </div>
          </div>
        </div>
        <div v-if="device.base" :style="device.base" />
      </div>
    </div>
  </div>
</template>
