<script setup lang="ts">
import { computed } from 'vue'

import { copyFills, type Color, type Fill, type SceneNode } from '@kalka/scene-graph'
import { BLACK } from '@kalka/scene-graph/constants'
import { useI18n } from '@kalka/vue'

import FillPicker from '@/components/fill-picker/FillPicker.vue'
import { fillLabel } from '@/components/properties/fill-label'
import { topFirst } from '@/components/properties/item-list/order'
import PaintField from '@/components/properties/paint/PaintField.vue'
import PaintValue from '@/components/properties/paint/PaintValue.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import PanelItemRow from '@/components/ui/panel/PanelItemRow.vue'

import { useStyleEdit } from './edit'
import StyleNameField from './StyleNameField.vue'

/**
 * A colour style's name and paints, as Figma's Edit color style shows them. A change is made to
 * the style and every fill and stroke using it in one undo step; a picker shows its edits live and
 * records them when it closes.
 */
const { definition } = defineProps<{ definition: SceneNode }>()
const { panels } = useI18n()
const edit = useStyleEdit(() => definition)
const rows = computed(() => topFirst(definition.fills))

/** Figma's new paint in a colour style: opaque black, drawn in front. */
const NEW_PAINT: Fill = {
  type: 'SOLID',
  color: BLACK,
  opacity: 1,
  visible: true
}

function withPaint(index: number, paint: Fill): Fill[] {
  return definition.fills.map((fill, at) => (at === index ? paint : fill))
}

function setPaint(index: number, paint: Fill) {
  edit.commit({ fills: withPaint(index, paint) })
}

function previewPaint(index: number, paint: Fill) {
  edit.preview({ fills: withPaint(index, paint) })
}

function setColor(index: number, fill: Fill, color: Color) {
  setPaint(index, { ...fill, color })
}

function add() {
  edit.commit({ fills: [...copyFills(definition.fills), { ...NEW_PAINT, color: { ...BLACK } }] })
}

function remove(index: number) {
  edit.commit({ fills: definition.fills.filter((_, at) => at !== index) })
}
</script>

<template>
  <div class="flex flex-col gap-3" data-test-id="fill-style-editor">
    <StyleNameField :definition="definition" />
    <div>
      <div class="mb-1 flex h-6 items-center justify-between">
        <span class="text-[11px] font-medium text-surface">{{ panels.fill }}</span>
        <IconButton :label="panels.addFill" data-test-id="fill-style-add-paint" @click="add">
          <icon-hugeicons-plus class="size-3.5" />
        </IconButton>
      </div>
      <PanelItemRow
        v-for="{ item: fill, index } in rows"
        :key="index"
        :ui="{ content: fill.visible ? '' : 'opacity-50' }"
      >
        <PaintField
          class="w-full flex-none"
          :opacity="fill.opacity"
          :opacity-label="panels.opacity"
          @update:opacity="previewPaint(index, { ...fill, opacity: $event })"
          @commit:opacity="setPaint(index, { ...fill, opacity: $event })"
        >
          <template #preview>
            <FillPicker
              :fill="fill"
              @update="previewPaint(index, $event)"
              @open-change="!$event && edit.settle()"
              @settle="edit.settle()"
              @cancel="edit.settle()"
            />
          </template>
          <template #value>
            <PaintValue
              v-if="fill.type === 'SOLID'"
              :color="fill.color"
              :label="panels.fill"
              @update="setColor(index, fill, $event)"
            />
            <span v-else class="min-w-0 flex-1 truncate font-mono text-xs text-surface">
              {{ fillLabel(fill) }}
            </span>
          </template>
        </PaintField>
        <template #rail>
          <IconButton
            :label="panels.toggleVisibility"
            :active="!fill.visible"
            @click="setPaint(index, { ...fill, visible: !fill.visible })"
          >
            <icon-hugeicons-eye-off v-if="!fill.visible" class="size-3.5" />
            <icon-hugeicons-eye v-else class="size-3.5" />
          </IconButton>
          <IconButton :label="panels.removeFill" @click="remove(index)">
            <icon-hugeicons-minus class="size-3.5" />
          </IconButton>
        </template>
      </PanelItemRow>
    </div>
  </div>
</template>
