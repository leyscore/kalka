<script setup lang="ts">
import type { Effect, SceneNode } from '@kalka/scene-graph'
import { useEffectsControls, useI18n } from '@kalka/vue'

import ColorInput from '@/components/ColorPicker/ColorInput.vue'
import NumberField from '@/components/inputs/NumberField.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import PanelItemRow from '@/components/ui/panel/PanelItemRow.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

import { useStyleEdit } from './edit'
import StyleNameField from './StyleNameField.vue'

/**
 * An effect style's name and effects, as Figma's Edit effect style shows them. A change is made
 * to the style and every layer using it in one undo step; a drag shows each value live.
 */
const { definition } = defineProps<{ definition: SceneNode }>()
const { panels } = useI18n()
const effectsCtx = useEffectsControls()
const edit = useStyleEdit(() => definition)

function withEffect(index: number, changes: Partial<Effect>): Effect[] {
  return definition.effects.map((effect, at) => (at === index ? { ...effect, ...changes } : effect))
}

function patch(index: number, changes: Partial<Effect>) {
  edit.commit({ effects: withEffect(index, changes) })
}

function scrub(index: number, changes: Partial<Effect>) {
  edit.preview({ effects: withEffect(index, changes) })
}

function setType(index: number, type: Effect['type']) {
  effectsCtx.updateType(patch, definition, index, type)
}

function add() {
  edit.commit({ effects: [...definition.effects, effectsCtx.createDefaultEffect()] })
}

function remove(index: number) {
  effectsCtx.adjustExpandedAfterRemove(index)
  edit.commit({ effects: definition.effects.filter((_, at) => at !== index) })
}

function alpha(percent: number) {
  return Math.max(0, Math.min(1, percent / 100))
}
</script>

<template>
  <div class="flex flex-col gap-3" data-test-id="effect-style-editor">
    <StyleNameField :definition="definition" />
    <div>
      <div class="mb-1 flex h-6 items-center justify-between">
        <span class="text-[11px] font-medium text-surface">{{ panels.effects }}</span>
        <IconButton :label="panels.addEffect" data-test-id="effect-style-add-effect" @click="add">
          <icon-hugeicons-plus class="size-3.5" />
        </IconButton>
      </div>
      <div v-for="(effect, index) in definition.effects" :key="index" data-effect-group>
        <PanelItemRow :ui="{ content: effect.visible ? '' : 'opacity-50' }">
          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <IconButton
              :label="
                effectsCtx.expandedIndex.value === index
                  ? panels.collapseEffectSettings
                  : panels.expandEffectSettings
              "
              :active="effectsCtx.expandedIndex.value === index"
              :aria-expanded="effectsCtx.expandedIndex.value === index"
              data-property="effect-expand"
              @click="effectsCtx.toggleExpand(index)"
            >
              <icon-hugeicons-blend class="size-3.5" />
            </IconButton>
            <AppSelect
              class="min-w-0 flex-1"
              :model-value="effect.type"
              :options="effectsCtx.effectOptions"
              :label="panels.effects"
              data-property="effect-type"
              @update:model-value="setType(index, $event as Effect['type'])"
            />
          </div>
          <template #rail>
            <IconButton
              :label="panels.toggleVisibility"
              :active="!effect.visible"
              @click="patch(index, { visible: !effect.visible })"
            >
              <icon-hugeicons-eye-off v-if="!effect.visible" class="size-3.5" />
              <icon-hugeicons-eye v-else class="size-3.5" />
            </IconButton>
            <IconButton :label="panels.removeEffect" @click="remove(index)">
              <icon-hugeicons-minus class="size-3.5" />
            </IconButton>
          </template>
        </PanelItemRow>

        <div
          v-if="effectsCtx.expandedIndex.value === index"
          class="flex flex-col gap-1.5 py-2"
          data-slot="effect-settings"
        >
          <template v-if="effectsCtx.isShadow(effect.type)">
            <div class="flex items-center gap-1.5">
              <Tip :label="panels.xAxis">
                <NumberField
                  icon="X"
                  :model-value="effect.offset.x"
                  :aria-label="panels.xAxis"
                  data-property="effect-offset-x"
                  @update:model-value="scrub(index, { offset: { ...effect.offset, x: $event } })"
                  @commit="
                    (value: number) => patch(index, { offset: { ...effect.offset, x: value } })
                  "
                />
              </Tip>
              <Tip :label="panels.yAxis">
                <NumberField
                  icon="Y"
                  :model-value="effect.offset.y"
                  :aria-label="panels.yAxis"
                  data-property="effect-offset-y"
                  @update:model-value="scrub(index, { offset: { ...effect.offset, y: $event } })"
                  @commit="
                    (value: number) => patch(index, { offset: { ...effect.offset, y: value } })
                  "
                />
              </Tip>
            </div>
            <div class="flex items-center gap-1.5">
              <Tip :label="panels.radius">
                <NumberField
                  icon="B"
                  :model-value="effect.radius"
                  :min="0"
                  :aria-label="panels.radius"
                  data-property="effect-radius"
                  @update:model-value="scrub(index, { radius: $event })"
                  @commit="(value: number) => patch(index, { radius: value })"
                />
              </Tip>
              <Tip :label="panels.spread">
                <NumberField
                  icon="S"
                  :model-value="effect.spread"
                  :aria-label="panels.spread"
                  data-property="effect-spread"
                  @update:model-value="scrub(index, { spread: $event })"
                  @commit="(value: number) => patch(index, { spread: value })"
                />
              </Tip>
            </div>
            <div class="flex items-center gap-1.5">
              <ColorInput
                class="min-w-0 flex-1"
                :color="effect.color"
                editable
                @update="patch(index, { color: $event })"
              />
              <Tip :label="panels.opacity">
                <NumberField
                  class="w-14"
                  suffix="%"
                  :model-value="Math.round(effect.color.a * 100)"
                  :min="0"
                  :max="100"
                  :aria-label="panels.opacity"
                  data-property="effect-opacity"
                  @update:model-value="
                    scrub(index, { color: { ...effect.color, a: alpha($event) } })
                  "
                  @commit="
                    (value: number) => patch(index, { color: { ...effect.color, a: alpha(value) } })
                  "
                />
              </Tip>
            </div>
          </template>
          <NumberField
            v-else
            class="w-24 flex-none"
            icon="B"
            :model-value="effect.radius"
            :min="0"
            :aria-label="panels.radius"
            data-property="effect-radius"
            @update:model-value="scrub(index, { radius: $event })"
            @commit="(value: number) => patch(index, { radius: value })"
          />
        </div>
      </div>
    </div>
  </div>
</template>
