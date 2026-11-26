<script setup lang="ts">
import { useDrawingMessages, useScaleToolControls } from '@kalka/vue'
import type { ScaleAnchor } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'

const controls = useScaleToolControls()
const { active, anchor, percent } = controls
const messages = useDrawingMessages()

const ANCHOR_LABELS = {
  'top-left': 'scaleAnchorTopLeft',
  'top-center': 'scaleAnchorTopCenter',
  'top-right': 'scaleAnchorTopRight',
  'middle-left': 'scaleAnchorMiddleLeft',
  'middle-center': 'scaleAnchorMiddleCenter',
  'middle-right': 'scaleAnchorMiddleRight',
  'bottom-left': 'scaleAnchorBottomLeft',
  'bottom-center': 'scaleAnchorBottomCenter',
  'bottom-right': 'scaleAnchorBottomRight'
} as const satisfies Record<ScaleAnchor, keyof typeof messages.value>
</script>

<template>
  <PanelSection v-if="active" :label="messages.scaleHeading" data-property="scale-tool">
    <div class="grid grid-cols-[1fr_auto] items-end gap-2">
      <PanelFieldGroup :label="messages.scaleFactor">
        <NumberField
          :model-value="percent"
          :min="1"
          suffix="%"
          :aria-label="messages.scaleFactor"
          data-property="scale-factor"
          @update:model-value="controls.preview"
          @commit="controls.commit"
        />
      </PanelFieldGroup>
      <div
        role="radiogroup"
        :aria-label="messages.scaleAnchor"
        class="grid size-7 grid-cols-3 gap-px rounded-[7px] bg-panel-field p-1"
        data-property="scale-anchor"
      >
        <button
          v-for="value in controls.anchors"
          :key="value"
          type="button"
          role="radio"
          :aria-checked="anchor === value"
          :aria-label="messages[ANCHOR_LABELS[value]]"
          :data-active="anchor === value || undefined"
          class="size-1.5 rounded-full bg-surface/30 data-[active]:bg-accent"
          @click="anchor = value"
        />
      </div>
    </div>
  </PanelSection>
</template>
