<script setup lang="ts">
import { isEndPointCap, isStrokeCapValue, MIXED, useI18n, useStrokeControls } from '@kalka/vue'
import type { EndPointSide } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'

const controls = useStrokeControls()
const { cap, join, miterLimit, hasEndPoints, startCap, endCap, shaftCap } = controls
const { panels } = useI18n()
function setCap(value: string) {
  if (!isStrokeCapValue(value)) return
  // A line or an open path keeps its arrows: the cap is its shaft's other ends.
  if (hasEndPoints.value) controls.setShaftCap(value)
  else controls.setCap(value)
}
function setEndPoint(side: EndPointSide, value: string) {
  if (isEndPointCap(value)) controls.setEndPoint(side, value)
}
function endPointOptions(value: unknown): { value: string; label: string; disabled?: boolean }[] {
  if (value !== MIXED) return controls.endPointOptions
  return [
    { value: 'MIXED', label: panels.value.mixed, disabled: true },
    ...controls.endPointOptions
  ]
}
function setJoin(value: string) {
  if (value === 'MITER' || value === 'BEVEL' || value === 'ROUND') controls.setJoin(value)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-if="hasEndPoints" class="grid grid-cols-2 gap-2">
      <PanelFieldGroup :label="panels.strokeStartPoint">
        <AppSelect
          :model-value="startCap === MIXED ? 'MIXED' : startCap"
          class="w-full"
          :label="panels.strokeStartPoint"
          :options="endPointOptions(startCap)"
          data-property="stroke-start-point"
          @update:model-value="setEndPoint('start', $event)"
        />
      </PanelFieldGroup>
      <PanelFieldGroup :label="panels.strokeEndPoint">
        <AppSelect
          :model-value="endCap === MIXED ? 'MIXED' : endCap"
          class="w-full"
          :label="panels.strokeEndPoint"
          :options="endPointOptions(endCap)"
          data-property="stroke-end-point"
          @update:model-value="setEndPoint('end', $event)"
        />
      </PanelFieldGroup>
    </div>
    <PanelFieldGroup :label="panels.strokeCap">
      <SegmentedControl
        :model-value="
          hasEndPoints ? (shaftCap === MIXED ? 'MIXED' : shaftCap) : cap === MIXED ? 'MIXED' : cap
        "
        :options="hasEndPoints ? controls.shaftCapOptions : controls.capOptions"
        :label="panels.strokeCap"
        data-property="stroke-cap"
        @update:model-value="setCap"
      >
        <template #option="{ option }">
          <Tip :label="option.label">
            <icon-hugeicons-minus v-if="option.value === 'NONE'" class="size-3" />
            <icon-hugeicons-circle v-else-if="option.value === 'ROUND'" class="size-2.5" />
            <icon-hugeicons-square v-else-if="option.value === 'SQUARE'" class="size-2.5" />
            <icon-hugeicons-arrow-right-01
              v-else-if="option.value === 'ARROW_LINES'"
              class="size-3"
            />
            <icon-hugeicons-triangle v-else class="size-2.5" />
          </Tip>
        </template>
      </SegmentedControl>
    </PanelFieldGroup>
    <PanelFieldGroup :label="panels.strokeJoin">
      <SegmentedControl
        :model-value="join === MIXED ? 'MIXED' : join"
        :options="controls.joinOptions"
        :label="panels.strokeJoin"
        data-property="stroke-join"
        @update:model-value="setJoin"
      >
        <template #option="{ option }">
          <Tip :label="option.label">
            <icon-hugeicons-corner-up-right v-if="option.value === 'MITER'" class="size-3" />
            <icon-hugeicons-triangle v-else-if="option.value === 'BEVEL'" class="size-2.5" />
            <icon-hugeicons-circle v-else class="size-2.5" />
          </Tip>
        </template>
      </SegmentedControl>
    </PanelFieldGroup>
    <PanelFieldGroup :label="panels.strokeMiterLimit">
      <NumberField
        :model-value="miterLimit"
        :min="1"
        data-property="stroke-miter-limit"
        :aria-label="panels.strokeMiterLimit"
        @update:model-value="controls.updateMiterLimit"
        @commit="controls.commitMiterLimit"
      >
        <template #icon><icon-hugeicons-triangle-right class="size-3" /></template>
      </NumberField>
    </PanelFieldGroup>
  </div>
</template>
