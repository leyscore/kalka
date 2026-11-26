<script setup lang="ts">
import { computed } from 'vue'

import type { Effect, Fill } from '@kalka/scene-graph'
import { colorToHexRaw } from '@kalka/scene-graph/color'
import {
  BindableValueRoot,
  useColorBindingProvider,
  useEffectsControls,
  useI18n,
  useSharedStyleBinding
} from '@kalka/vue'

import ColorInput from '@/components/ColorPicker/ColorInput.vue'
import NumberField from '@/components/inputs/NumberField.vue'
import VariableBindingPicker from '@/components/properties/binding/VariableBindingPicker.vue'
import {
  commitDiscretePropertyListChange,
  useBlendModeOptions
} from '@/components/properties/blend-mode/use'
import EffectKindSettings from '@/components/properties/effects/EffectKindSettings.vue'
import PropertyItemRow from '@/components/properties/item-list/PropertyItemRow.vue'
import PropertyListRoot from '@/components/properties/PropertyListRoot.vue'
import AppliedStyle from '@/components/properties/styles/AppliedStyle.vue'
import StylePicker from '@/components/properties/styles/StylePicker.vue'
import VariableNumberField from '@/components/properties/VariableNumberField.vue'
import { BindingPill } from '@/components/ui/binding'
import IconButton from '@/components/ui/button/IconButton.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import FillSwatch from '@/components/ui/paint/FillSwatch.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

const effectsCtx = useEffectsControls()
const colorProvider = useColorBindingProvider()
const { panels, common } = useI18n()
const blendModeOptions = useBlendModeOptions()
const effectStyle = useSharedStyleBinding('effect')
/** An applied effect style stands in for the effects, as in Figma. */
const hasStyle = computed(() => typeof effectStyle.styleId.value === 'string')

/** Shadows and one- or two-tone noise draw in a color, which a variable can set. */
function hasColor(effect: Effect): boolean {
  return (
    effectsCtx.isShadow(effect.type) ||
    (effect.type === 'NOISE' && effect.noiseType !== 'MULTITONE')
  )
}

function effectPreview(effect: Effect): Fill {
  return {
    type: 'SOLID',
    color: effect.color,
    opacity: 1,
    visible: effect.visible
  }
}
</script>

<template>
  <PropertyListRoot
    v-slot="{ items, isMixed, activeNode, flush, actions }"
    prop-key="effects"
    :label="panels.effects"
  >
    <PanelSection :label="panels.effects" :empty="!isMixed && items.length === 0">
      <template #actions>
        <StylePicker
          v-if="effectStyle.active.value && !hasStyle"
          kind="effect"
          :current-style-id="null"
          @apply="effectStyle.bind"
          @create="effectStyle.createStyle"
        />
        <IconButton
          :label="panels.addEffect"
          @click="actions.add(effectsCtx.createDefaultEffect())"
        >
          <icon-hugeicons-plus class="size-3.5" />
        </IconButton>
      </template>

      <AppliedStyle :binding="effectStyle" />

      <p v-if="isMixed && !hasStyle" class="text-[11px] text-muted">
        {{ panels.mixedEffectsHelp }}
      </p>

      <div
        v-for="(effect, index) in hasStyle ? [] : items"
        :key="`${index}:${effect.visible ? 'visible' : 'hidden'}`"
        :data-effect-index="index"
        data-effect-group
      >
        <PropertyItemRow
          prop-key="effects"
          :index="index"
          :visibility-label="panels.toggleVisibility"
          :remove-label="panels.removeEffect"
          class="items-start"
          @remove="effectsCtx.adjustExpandedAfterRemove(index)"
        >
          <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex min-w-0 items-center gap-1.5">
              <Tip
                :label="
                  effectsCtx.expandedIndex.value === index
                    ? panels.collapseEffectSettings
                    : panels.expandEffectSettings
                "
              >
                <button
                  type="button"
                  :aria-expanded="effectsCtx.expandedIndex.value === index"
                  :aria-label="
                    effectsCtx.expandedIndex.value === index
                      ? panels.collapseEffectSettings
                      : panels.expandEffectSettings
                  "
                  data-property="effect-expand"
                  class="flex size-5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border border-border bg-input p-0"
                  @click="effectsCtx.toggleExpand(index)"
                >
                  <FillSwatch
                    v-if="effectsCtx.isShadow(effect.type)"
                    :fill="effectPreview(effect)"
                    class="size-full border-0"
                  />
                  <icon-hugeicons-blend v-else class="size-3 text-muted" />
                </button>
              </Tip>

              <AppSelect
                class="min-w-0 flex-1"
                :model-value="effect.type"
                :options="effectsCtx.effectOptions"
                :label="panels.effects"
                data-property="effect-type"
                @update:model-value="
                  effectsCtx.updateType(actions.patch, activeNode, index, $event as Effect['type'])
                "
              />
            </div>
          </div>
        </PropertyItemRow>

        <div
          v-if="effectsCtx.expandedIndex.value === index"
          class="flex flex-col gap-1.5 py-2"
          data-slot="effect-settings"
        >
          <PanelFieldGroup :label="panels.blendMode">
            <AppSelect
              :model-value="effect.blendMode ?? 'NORMAL'"
              :options="blendModeOptions"
              :label="panels.blendMode"
              data-property="effect-blend-mode"
              @update:model-value="
                commitDiscretePropertyListChange(flush, () =>
                  actions.patch(index, { blendMode: $event as Effect['blendMode'] })
                )
              "
            />
          </PanelFieldGroup>
          <template v-if="effectsCtx.isShadow(effect.type)">
            <div class="flex items-center gap-1.5">
              <Tip :label="panels.xAxis">
                <VariableNumberField
                  icon="X"
                  :node-id="activeNode?.id ?? ''"
                  :binding-path="`effects/${index}/offsetX`"
                  :aria-label="panels.xAxis"
                  :model-value="effect.offset.x"
                  data-property="effect-offset-x"
                  @update:model-value="
                    effectsCtx.scrubEffect(activeNode, index, {
                      offset: { ...effect.offset, x: $event }
                    })
                  "
                  @commit="
                    effectsCtx.commitEffect(activeNode, index, {
                      offset: { ...effect.offset, x: $event }
                    })
                  "
                />
              </Tip>
              <Tip :label="panels.yAxis">
                <VariableNumberField
                  icon="Y"
                  :node-id="activeNode?.id ?? ''"
                  :binding-path="`effects/${index}/offsetY`"
                  :aria-label="panels.yAxis"
                  :model-value="effect.offset.y"
                  data-property="effect-offset-y"
                  @update:model-value="
                    effectsCtx.scrubEffect(activeNode, index, {
                      offset: { ...effect.offset, y: $event }
                    })
                  "
                  @commit="
                    effectsCtx.commitEffect(activeNode, index, {
                      offset: { ...effect.offset, y: $event }
                    })
                  "
                />
              </Tip>
            </div>

            <div class="flex items-center gap-1.5">
              <Tip :label="panels.radius">
                <VariableNumberField
                  icon="B"
                  :node-id="activeNode?.id ?? ''"
                  :binding-path="`effects/${index}/radius`"
                  :aria-label="panels.radius"
                  :model-value="effect.radius"
                  :min="0"
                  data-property="effect-radius"
                  @update:model-value="
                    effectsCtx.scrubEffect(activeNode, index, { radius: $event })
                  "
                  @commit="effectsCtx.commitEffect(activeNode, index, { radius: $event })"
                />
              </Tip>
              <Tip :label="panels.spread">
                <VariableNumberField
                  icon="S"
                  :node-id="activeNode?.id ?? ''"
                  :binding-path="`effects/${index}/spread`"
                  :aria-label="panels.spread"
                  :model-value="effect.spread"
                  data-property="effect-spread"
                  @update:model-value="
                    effectsCtx.scrubEffect(activeNode, index, { spread: $event })
                  "
                  @commit="effectsCtx.commitEffect(activeNode, index, { spread: $event })"
                />
              </Tip>
            </div>
          </template>

          <EffectKindSettings
            v-else
            :effect="effect"
            :index="index"
            :node-id="activeNode?.id ?? ''"
            @scrub="effectsCtx.scrubEffect(activeNode, index, $event)"
            @commit="effectsCtx.commitEffect(activeNode, index, $event)"
            @change="commitDiscretePropertyListChange(flush, () => actions.patch(index, $event))"
          />

          <template v-if="hasColor(effect)">
            <BindableValueRoot
              v-slot="binding"
              :provider="colorProvider"
              :targets="[{ nodeId: activeNode?.id ?? '', path: `effects/${index}/color` }]"
              :value="effect.color"
              batch-label="Change effect color"
            >
              <div class="flex items-center gap-1.5">
                <BindingPill
                  v-if="binding.variable || binding.state === 'unresolved'"
                  class="min-w-0 flex-1"
                  :unresolved="binding.state === 'unresolved'"
                  :label="binding.variable?.name ?? binding.bindingId ?? panels.unresolvedVariable"
                />
                <ColorInput
                  v-else
                  class="min-w-0 flex-1"
                  :color="effect.color"
                  editable
                  @update="effectsCtx.updateColor(actions.patch, index, $event)"
                />
                <Tip v-if="!binding.variable" :label="panels.opacity">
                  <NumberField
                    class="w-14"
                    suffix="%"
                    :model-value="Math.round(effect.color.a * 100)"
                    :min="0"
                    :max="100"
                    data-property="effect-opacity"
                    @update:model-value="
                      effectsCtx.scrubEffect(activeNode, index, {
                        color: { ...effect.color, a: Math.max(0, Math.min(1, $event / 100)) }
                      })
                    "
                    @commit="
                      effectsCtx.commitEffect(activeNode, index, {
                        color: { ...effect.color, a: Math.max(0, Math.min(1, $event / 100)) }
                      })
                    "
                  />
                </Tip>
                <VariableBindingPicker
                  :trigger-label="panels.applyVariable"
                  :search-placeholder="common.search"
                  :empty-label="panels.noVariablesFound"
                  :detach-label="panels.detachVariable"
                  :create-label="
                    panels.createColorVariable({ value: `#${colorToHexRaw(effect.color)}` })
                  "
                  :create-name-placeholder="panels.variableName"
                  :create-submit-label="panels.create"
                />
              </div>
            </BindableValueRoot>
          </template>
        </div>
      </div>
    </PanelSection>
  </PropertyListRoot>
</template>
