<script setup lang="ts">
import { computed, ref } from 'vue'

import type { Color, Fill, SceneNode, Stroke } from '@kalka/scene-graph'
import { colorToHexRaw } from '@kalka/scene-graph/color'
import {
  applySolidStrokeColor,
  applyStrokePaint,
  BindableValueRoot,
  useColorBindingProvider,
  useI18n,
  useOkHCL,
  useSharedStyleBinding,
  useStrokeControls
} from '@kalka/vue'
import type { BindableValueActions } from '@kalka/vue'

import FillPicker from '@/components/fill-picker/FillPicker.vue'
import NumberField from '@/components/inputs/NumberField.vue'
import VariableBindingPicker from '@/components/properties/binding/VariableBindingPicker.vue'
import { topFirst } from '@/components/properties/item-list/order'
import PropertyItemRow from '@/components/properties/item-list/PropertyItemRow.vue'
import {
  applyPaintMutation,
  cancelPaintMutation,
  commitPaintMutation,
  paintBindingTargets
} from '@/components/properties/paint/binding'
import { createStrokeOkhclAdapter } from '@/components/properties/paint/okhcl'
import PaintField from '@/components/properties/paint/PaintField.vue'
import PaintValue from '@/components/properties/paint/PaintValue.vue'
import PropertyListRoot from '@/components/properties/PropertyListRoot.vue'
import AppliedStyle from '@/components/properties/styles/AppliedStyle.vue'
import StylePicker from '@/components/properties/styles/StylePicker.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

import StrokeSettingsPopover from './StrokeSettingsPopover.vue'

const strokeStyle = useSharedStyleBinding('stroke')
/** An applied colour style stands in for the stroke paints; weight and placement stay. */
const hasStyle = computed(() => typeof strokeStyle.styleId.value === 'string')

const strokeCtx = useStrokeControls()
const { advancedActive } = strokeCtx
const colorProvider = useColorBindingProvider()
const okhcl = useOkHCL()
const { panels, common } = useI18n()
const expandedSides = ref(false)

/** A bound variable colours the swatch, but only a solid stroke has one colour to replace. */
function displayStroke(stroke: Stroke, resolvedColor: Color | undefined): Fill {
  return stroke.type === 'SOLID' && resolvedColor ? { ...stroke, color: resolvedColor } : stroke
}

function updateStrokePaint(
  binding: BindableValueActions<Color>,
  flush: () => void,
  stroke: Stroke,
  paint: Fill,
  update: (stroke: Stroke) => void
) {
  applyPaintMutation(binding, flush, () => update(applyStrokePaint(stroke, paint)))
}

function updateStrokeColor(
  binding: BindableValueActions<Color>,
  flush: () => void,
  color: Color,
  patch: (changes: Partial<Stroke>) => void,
  commit: boolean
) {
  if (!applyPaintMutation(binding, flush, () => patch(applySolidStrokeColor(color)))) return
  if (commit) commitPaintMutation(binding)
}

function onToggleSides(activeNode: SceneNode | null) {
  if (!activeNode) return
  const next = !expandedSides.value
  expandedSides.value = next
  if (next && !activeNode.independentStrokeWeights) {
    const weight = activeNode.strokes[0]?.weight ?? 1
    strokeCtx.selectSide('CUSTOM', {
      ...activeNode,
      borderTopWeight: weight,
      borderRightWeight: weight,
      borderBottomWeight: weight,
      borderLeftWeight: weight
    })
  } else if (!next && activeNode.independentStrokeWeights) {
    strokeCtx.selectSide('ALL', activeNode)
  }
}
</script>

<template>
  <PropertyListRoot
    v-slot="{ items, isMixed, activeNode, selectedNodeIds, flush, actions }"
    prop-key="strokes"
    :label="panels.stroke"
  >
    <PanelSection :label="panels.stroke" :empty="!isMixed && items.length === 0">
      <template #actions>
        <StylePicker
          v-if="strokeStyle.active.value && !hasStyle"
          kind="stroke"
          :current-style-id="null"
          @apply="strokeStyle.bind"
          @create="strokeStyle.createStyle"
        />
        <IconButton :label="panels.addStroke" @click="actions.add(strokeCtx.defaultStroke)">
          <icon-hugeicons-plus class="size-3.5" />
        </IconButton>
      </template>

      <AppliedStyle :binding="strokeStyle" />

      <p v-if="isMixed && !hasStyle" class="text-[11px] text-muted">
        {{ panels.mixedStrokesHelp }}
      </p>

      <PropertyItemRow
        v-for="{ item: stroke, index } in hasStyle ? [] : topFirst(items)"
        :key="`${index}:${stroke.visible ? 'visible' : 'hidden'}`"
        prop-key="strokes"
        :index="index"
        :visibility-label="panels.toggleVisibility"
        :remove-label="panels.removeStroke"
      >
        <BindableValueRoot
          v-slot="binding"
          :provider="colorProvider"
          :targets="paintBindingTargets(selectedNodeIds, 'strokes', index)"
          :value="stroke.color"
          batch-label="Change stroke color"
        >
          <PaintField
            :opacity="stroke.opacity"
            :opacity-label="panels.opacity"
            @update:opacity="actions.patch(index, { opacity: $event })"
          >
            <template #preview>
              <FillPicker
                :label="panels.stroke"
                :fill="displayStroke(stroke, binding.resolvedValue)"
                :okhcl="createStrokeOkhclAdapter(okhcl, activeNode, index)"
                paint="strokes"
                :index="index"
                @update="
                  updateStrokePaint(binding.actions, flush, stroke, $event, (next) =>
                    actions.update(index, next)
                  )
                "
                @open-change="!$event && commitPaintMutation(binding.actions)"
                @settle="commitPaintMutation(binding.actions)"
                @cancel="cancelPaintMutation(binding.actions)"
              />
            </template>

            <template #value>
              <PaintValue
                v-if="stroke.type === 'SOLID'"
                :color="stroke.color"
                :resolved-color="binding.resolvedValue"
                :variable-name="binding.variable?.name ?? binding.bindingId"
                :unavailable-label="
                  binding.state === 'unresolved' ? panels.unresolvedVariable : undefined
                "
                :label="panels.stroke"
                @update="
                  updateStrokeColor(
                    binding.actions,
                    flush,
                    $event,
                    (changes) => actions.patch(index, changes),
                    true
                  )
                "
              />
            </template>

            <template #binding>
              <VariableBindingPicker
                :trigger-label="panels.applyVariable"
                :search-placeholder="common.search"
                :empty-label="panels.noVariablesFound"
                :detach-label="panels.detachVariable"
                :create-label="
                  panels.createColorVariable({ value: `#${colorToHexRaw(stroke.color)}` })
                "
                :create-name-placeholder="panels.variableName"
                :create-submit-label="panels.create"
              />
            </template>
          </PaintField>
        </BindableValueRoot>
      </PropertyItemRow>

      <div v-if="!isMixed && items.length > 0" class="mt-1 flex items-center gap-1.5">
        <AppSelect
          :label="panels.strokeType"
          :ui="{ trigger: 'min-w-0 flex-1' }"
          :model-value="strokeCtx.currentAlign(activeNode)"
          :options="strokeCtx.alignOptions"
          data-property="stroke-align"
          @update:model-value="strokeCtx.updateAlign($event as Stroke['align'], activeNode)"
        />
        <Tip :label="panels.strokeWeight">
          <NumberField
            v-if="!expandedSides"
            class="w-16 flex-none"
            icon="W"
            :model-value="items[0]?.weight ?? 1"
            :min="0"
            data-property="stroke-weight"
            @update:model-value="actions.patch(0, { weight: $event })"
          />
        </Tip>
        <StrokeSettingsPopover
          v-if="advancedActive"
          :stroke="items[0]"
          @patch="actions.patch(0, $event)"
        />
        <IconButton
          :label="panels.strokeSides"
          size="xs"
          class="size-[26px] shrink-0"
          :active="expandedSides"
          data-property="stroke-sides"
          @click="onToggleSides(activeNode)"
        >
          <icon-hugeicons-layout-grid class="size-3.5" />
        </IconButton>
      </div>

      <StrokeSettingsPopover v-if="isMixed && advancedActive" />

      <div
        v-if="!isMixed && items.length > 0 && expandedSides"
        class="mt-1.5 grid grid-cols-2 gap-1.5"
      >
        <NumberField
          v-for="side in strokeCtx.borderSides"
          :key="side"
          :label="side[0].toUpperCase()"
          :model-value="strokeCtx.borderWeight(activeNode, side)"
          :min="0"
          :data-property="`stroke-${side}-weight`"
          @update:model-value="strokeCtx.updateBorderWeight(side, $event, activeNode)"
        />
      </div>
    </PanelSection>
  </PropertyListRoot>
</template>
