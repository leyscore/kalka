<script setup lang="ts">
import { PositionControlsRoot, useI18n } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'
import AlignToolbar from '@/components/properties/position/AlignToolbar.vue'
import TransformButtons from '@/components/properties/position/TransformButtons.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import PanelGrid from '@/components/ui/panel/PanelGrid.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'

const { panels } = useI18n()
</script>

<template>
  <PositionControlsRoot
    v-slot="{ active, isMulti, xValue, yValue, wValue, hValue, rotationValue, actions }"
  >
    <PanelSection v-if="active" :label="panels.position">
      <AlignToolbar :align="actions.align" />

      <PanelGrid :columns="2">
        <Tip :label="panels.xAxis">
          <NumberField
            icon="X"
            data-property="x"
            :aria-label="panels.xAxis"
            :model-value="xValue"
            @update:model-value="actions.updateProp('x', $event)"
            @commit="(v: number, p: number) => actions.commitProp('x', v, p)"
            @cancel="actions.cancelProp('x')"
          />
        </Tip>
        <Tip :label="panels.yAxis">
          <NumberField
            icon="Y"
            data-property="y"
            :aria-label="panels.yAxis"
            :model-value="yValue"
            @update:model-value="actions.updateProp('y', $event)"
            @commit="(v: number, p: number) => actions.commitProp('y', v, p)"
            @cancel="actions.cancelProp('y')"
          />
        </Tip>
      </PanelGrid>

      <PanelGrid v-if="isMulti" :columns="2" class="mt-1.5">
        <Tip :label="panels.width">
          <NumberField
            icon="W"
            data-property="width"
            :aria-label="panels.width"
            :model-value="wValue"
            :min="1"
            @update:model-value="actions.updateProp('width', $event)"
            @commit="(v: number, p: number) => actions.commitProp('width', v, p)"
            @cancel="actions.cancelProp('width')"
          />
        </Tip>
        <Tip :label="panels.height">
          <NumberField
            icon="H"
            data-property="height"
            :aria-label="panels.height"
            :model-value="hValue"
            :min="1"
            @update:model-value="actions.updateProp('height', $event)"
            @commit="(v: number, p: number) => actions.commitProp('height', v, p)"
            @cancel="actions.cancelProp('height')"
          />
        </Tip>
      </PanelGrid>

      <PanelGrid :columns="2" class="mt-1.5">
        <Tip :label="panels.rotation">
          <NumberField
            suffix="°"
            data-property="rotation"
            :aria-label="panels.rotation"
            :model-value="rotationValue"
            :min="-360"
            :max="360"
            @update:model-value="actions.updateProp('rotation', $event)"
            @commit="(v: number, p: number) => actions.commitProp('rotation', v, p)"
            @cancel="actions.cancelProp('rotation')"
          >
            <template #icon>
              <icon-hugeicons-rotate-cw class="size-3" />
            </template>
          </NumberField>
        </Tip>
        <TransformButtons :flip="actions.flip" :rotate="actions.rotate" />
      </PanelGrid>
    </PanelSection>
  </PositionControlsRoot>
</template>
