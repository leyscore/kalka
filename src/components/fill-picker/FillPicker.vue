<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'

import { applySolidFillColor, FillRoot, useI18n } from '@open-pencil/vue'

import ColorPickerPanel from '@/components/color-picker-panel/ColorPickerPanel.vue'
import GradientEditor from '@/components/fill-picker/GradientEditor.vue'
import ImageFillPicker from '@/components/fill-picker/ImageFillPicker.vue'
import FillSwatch from '@/components/ui/FillSwatch.vue'
import Tip from '@/components/ui/Tip.vue'
import { usePopoverUI } from '@/components/ui/popover'

import type { Fill } from '@open-pencil/scene-graph'
import type { OkHCLControls } from '@open-pencil/vue'

const TAB_BASE =
  'flex size-6 cursor-pointer items-center justify-center rounded border-none p-0 transition-colors'

function tabClass(active: boolean) {
  return twMerge(
    TAB_BASE,
    active ? 'bg-hover text-surface' : 'text-muted hover:bg-hover hover:text-surface'
  )
}

const {
  fill,
  okhcl = null,
  swatchBackground
} = defineProps<{
  fill: Fill
  okhcl?: OkHCLControls | null
  swatchBackground?: string
}>()
const emit = defineEmits<{ update: [fill: Fill] }>()
const cls = usePopoverUI({ content: 'w-60 p-2' })
const { panels } = useI18n()
</script>

<template>
  <FillRoot :fill="fill" @update="emit('update', $event)" v-slot="root">
    <PopoverRoot>
      <PopoverTrigger as-child>
        <button
          type="button"
          :aria-label="panels.fill"
          data-test-id="fill-picker-swatch"
          class="size-5 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        >
          <FillSwatch :fill="fill" class="size-full" v-slot="swatch">
            <span
              class="pointer-events-none absolute inset-0"
              :style="{ background: swatchBackground ?? swatch.background }"
            />
          </FillSwatch>
        </button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent :class="cls.content" :side-offset="4" side="left">
          <div class="mb-2 flex items-center gap-0.5">
            <Tip :label="panels.solid">
              <button
                :class="tabClass(root.category === 'SOLID')"
                data-test-id="fill-picker-tab-solid"
                @click="root.actions.toSolid"
              >
                <icon-lucide-square class="size-3.5" />
              </button>
            </Tip>
            <Tip :label="panels.linearGradient">
              <button
                :class="tabClass(root.category === 'GRADIENT')"
                data-test-id="fill-picker-tab-gradient"
                @click="root.actions.toGradient"
              >
                <icon-lucide-blend class="size-3.5" />
              </button>
            </Tip>
            <Tip :label="panels.image">
              <button
                :class="tabClass(root.category === 'IMAGE')"
                data-test-id="fill-picker-tab-image"
                @click="root.actions.toImage"
              >
                <icon-lucide-image class="size-3.5" />
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
            :fill="root.fill"
            @update="emit('update', $event)"
          />

          <ImageFillPicker
            v-if="root.category === 'IMAGE'"
            :fill="root.fill"
            @update="emit('update', $event)"
          />
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </FillRoot>
</template>
