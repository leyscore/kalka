<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { tv } from 'tailwind-variants'

import type { Fill } from '@kalka/scene-graph'
import {
  applySolidFillColor,
  FillRoot,
  useI18n,
  usePrototypeMessages,
  useRetainedPopup
} from '@kalka/vue'
import type { OkHCLControls } from '@kalka/vue'

import ColorPickerPanel from '@/components/color-picker-panel/ColorPickerPanel.vue'
import { useCanvasGradientHandles } from '@/components/fill-picker/canvas-gradient'
import GradientEditor from '@/components/fill-picker/GradientEditor.vue'
import ImageFillPicker from '@/components/fill-picker/ImageFillPicker.vue'
import VideoFillPicker from '@/components/fill-picker/VideoFillPicker.vue'
import { usePopoverUI } from '@/components/ui/overlay/popover'
import Tip from '@/components/ui/overlay/Tip.vue'
import FillSwatch from '@/components/ui/paint/FillSwatch.vue'
import fillPickerTheme from '@/theme/fill-picker'

const fillPicker = tv(fillPickerTheme)

function tabClass(active: boolean) {
  return fillPicker({ active }).tab()
}

const {
  fill,
  okhcl = null,
  swatchBackground,
  paint,
  index
} = defineProps<{
  fill: Fill
  okhcl?: OkHCLControls | null
  swatchBackground?: string
  /** Names the trigger for a paint that is not a fill, such as a stroke. */
  label?: string
  /** Where the paint sits on the selection, which shows a gradient's handles on the canvas. */
  paint?: 'fills' | 'strokes'
  index?: number
}>()
const emit = defineEmits<{
  update: [fill: Fill]
  openChange: [open: boolean]
  cancel: []
  /** A gradient handle is dragged on the canvas: the picker's edits so far end their undo step. */
  settle: []
}>()
const { open: popupOpen, portalActive } = useRetainedPopup(undefined, () => {
  emit('cancel')
  emit('openChange', false)
})
const { activeStop, keepOpen } = useCanvasGradientHandles({
  open: popupOpen,
  fill: () => fill,
  target: () => (paint && index !== undefined ? { paint, index } : null),
  onDragStart: () => emit('settle')
})
const cls = usePopoverUI({ content: 'w-60 p-2' })
const { panels } = useI18n()
const prototype = usePrototypeMessages()

/** Escape closes the picker and keeps the paint, as in Figma; the selection stays. */
function closeFromEscape(event: KeyboardEvent) {
  event.stopPropagation()
  // Commit now rather than once the close finishes, so an Undo pressed right after Escape takes it back.
  emit('openChange', false)
}
</script>

<template>
  <FillRoot :fill="fill" @update="emit('update', $event)" v-slot="root">
    <PopoverRoot v-model:open="popupOpen" @update:open="emit('openChange', $event)">
      <PopoverTrigger as-child>
        <button
          type="button"
          :aria-label="label ?? panels.fill"
          data-test-id="fill-picker-swatch"
          class="size-4 shrink-0 cursor-pointer rounded-sm border-0 bg-transparent p-0"
        >
          <FillSwatch :fill="fill" class="size-full" v-slot="swatch">
            <span
              class="pointer-events-none absolute inset-0"
              :style="{ background: swatchBackground ?? swatch.background }"
            />
          </FillSwatch>
        </button>
      </PopoverTrigger>

      <PopoverPortal v-if="portalActive">
        <PopoverContent
          :class="cls.content"
          :side-offset="4"
          side="left"
          data-picker-content
          @escape-key-down="closeFromEscape"
          @interact-outside="keepOpen"
        >
          <div class="mb-2 flex items-center gap-0.5">
            <Tip :label="panels.solid">
              <button
                :data-active="root.category === 'SOLID' || undefined"
                :class="tabClass(root.category === 'SOLID')"
                data-test-id="fill-picker-tab-solid"
                @click="root.actions.toSolid"
              >
                <icon-hugeicons-square class="size-3.5" />
              </button>
            </Tip>
            <Tip :label="panels.linearGradient">
              <button
                :data-active="root.category === 'GRADIENT' || undefined"
                :class="tabClass(root.category === 'GRADIENT')"
                data-test-id="fill-picker-tab-gradient"
                @click="root.actions.toGradient"
              >
                <icon-hugeicons-blend class="size-3.5" />
              </button>
            </Tip>
            <Tip :label="panels.image">
              <button
                :data-active="root.category === 'IMAGE' || undefined"
                :class="tabClass(root.category === 'IMAGE')"
                data-test-id="fill-picker-tab-image"
                @click="root.actions.toImage"
              >
                <icon-hugeicons-image-01 class="size-3.5" />
              </button>
            </Tip>
            <Tip :label="prototype.video">
              <button
                :data-active="root.category === 'VIDEO' || undefined"
                :class="tabClass(root.category === 'VIDEO')"
                data-test-id="fill-picker-tab-video"
                @click="root.actions.toVideo"
              >
                <icon-hugeicons-video-01 class="size-3.5" />
              </button>
            </Tip>
          </div>

          <ColorPickerPanel
            v-if="root.category === 'SOLID'"
            :color="root.fill.color"
            :okhcl="okhcl"
            @update="emit('update', applySolidFillColor(root.fill, $event))"
          />

          <GradientEditor
            v-if="root.category === 'GRADIENT'"
            v-model:active-stop="activeStop"
            :fill="root.fill"
            @update="emit('update', $event)"
          />

          <ImageFillPicker
            v-if="root.category === 'IMAGE'"
            :fill="root.fill"
            @update="emit('update', $event)"
          />

          <VideoFillPicker
            v-if="root.category === 'VIDEO'"
            :fill="root.fill"
            @update="emit('update', $event)"
          />
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </FillRoot>
</template>
