<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { FONT_WEIGHT_NAMES, weightToStyle } from '@kalka/core/text'
import type { SceneNode } from '@kalka/scene-graph'
import { useEditor, useI18n } from '@kalka/vue'

import { loadFont } from '@/app/editor/fonts'
import FontPicker from '@/components/font-picker/FontPicker.vue'
import NumberField from '@/components/inputs/NumberField.vue'
import LetterSpacingField from '@/components/properties/typography/LetterSpacingField.vue'
import LineHeightField from '@/components/properties/typography/LineHeightField.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import PanelGrid from '@/components/ui/panel/PanelGrid.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

/**
 * A text style's properties, as Figma's Edit text style panel shows them. A change is made to the
 * style and every layer that uses it in one undo step; dragging a value shows it on the style only.
 */
const { definition } = defineProps<{ definition: SceneNode }>()
const editor = useEditor()
const { panels } = useI18n()

const weights = Object.entries(FONT_WEIGHT_NAMES).map(([value, label]) => ({
  value: Number(value),
  label
}))
const textCaseOptions = computed(() => [
  { value: 'ORIGINAL', label: panels.value.textCaseOriginal },
  { value: 'UPPER', label: panels.value.textCaseUpper },
  { value: 'LOWER', label: panels.value.textCaseLower },
  { value: 'TITLE', label: panels.value.textCaseTitle }
])

const draftName = ref(definition.name)
watch(
  () => definition.name,
  (name) => {
    draftName.value = name
  }
)

function rename() {
  const next = draftName.value.trim()
  if (next && next !== definition.name) editor.renameSharedStyle(definition.id, next)
  else draftName.value = definition.name
}

function change(changes: Partial<SceneNode>) {
  editor.updateTextStyle(definition.id, changes)
}

/** Shows a dragged value on the style alone, before the change reaches the layers. */
function preview(field: keyof SceneNode, value: number) {
  editor.updateNode(definition.id, { [field]: value })
}

/** Puts back the value the drag started from, so the change is recorded from it. */
function commit(field: keyof SceneNode, value: number, previous: number) {
  editor.updateNode(definition.id, { [field]: previous })
  change({ [field]: value })
}

async function setFamily(family: string) {
  await loadFont(family, weightToStyle(definition.fontWeight))
  change({ fontFamily: family })
}

async function setWeight(weight: number) {
  await loadFont(definition.fontFamily, weightToStyle(weight))
  change({ fontWeight: weight })
}

function setTextCase(value: string) {
  if (value === 'ORIGINAL' || value === 'UPPER' || value === 'LOWER' || value === 'TITLE')
    change({ textCase: value })
}
</script>

<template>
  <div class="flex flex-col gap-3" data-test-id="text-style-editor">
    <PanelFieldGroup :label="panels.styleName">
      <AppInput
        v-model="draftName"
        size="sm"
        tone="panel"
        :aria-label="panels.styleName"
        data-property="text-style-name"
        @change="rename"
        @enter="rename"
      />
    </PanelFieldGroup>

    <FontPicker
      :model-value="definition.fontFamily"
      :label="panels.fontFamily"
      @select="setFamily"
    />

    <PanelGrid :columns="2">
      <PanelFieldGroup :label="panels.fontWeight">
        <AppSelect
          :label="panels.fontWeight"
          :model-value="definition.fontWeight"
          :options="weights"
          @update:model-value="setWeight(+$event)"
        />
      </PanelFieldGroup>
      <PanelFieldGroup :label="panels.fontSize">
        <NumberField
          :model-value="definition.fontSize"
          :aria-label="panels.fontSize"
          :min="1"
          :max="1000"
          data-property="text-style-font-size"
          @update:model-value="preview('fontSize', $event)"
          @commit="(value: number, previous: number) => commit('fontSize', value, previous)"
        />
      </PanelFieldGroup>
    </PanelGrid>

    <PanelGrid :columns="2">
      <PanelFieldGroup :label="panels.lineHeight">
        <LineHeightField
          :node="definition"
          :apply="change"
          @update="preview('lineHeight', $event)"
          @commit="(value, previous) => commit('lineHeight', value, previous)"
        />
      </PanelFieldGroup>
      <PanelFieldGroup :label="panels.letterSpacing">
        <LetterSpacingField
          :node="definition"
          :apply="change"
          @update="preview('letterSpacing', $event)"
          @commit="(value, previous) => commit('letterSpacing', value, previous)"
        />
      </PanelFieldGroup>
    </PanelGrid>

    <PanelGrid :columns="2">
      <PanelFieldGroup :label="panels.paragraphSpacing">
        <NumberField
          :model-value="definition.paragraphSpacing"
          :aria-label="panels.paragraphSpacing"
          suffix="px"
          :min="0"
          data-property="text-style-paragraph-spacing"
          @update:model-value="preview('paragraphSpacing', $event)"
          @commit="(value: number, previous: number) => commit('paragraphSpacing', value, previous)"
        >
          <template #icon><icon-hugeicons-paragraph-spacing class="size-3" /></template>
        </NumberField>
      </PanelFieldGroup>
      <PanelFieldGroup :label="panels.paragraphIndent">
        <NumberField
          :model-value="definition.paragraphIndent"
          :aria-label="panels.paragraphIndent"
          suffix="px"
          data-property="text-style-paragraph-indent"
          @update:model-value="preview('paragraphIndent', $event)"
          @commit="(value: number, previous: number) => commit('paragraphIndent', value, previous)"
        >
          <template #icon><icon-hugeicons-text-indent class="size-3" /></template>
        </NumberField>
      </PanelFieldGroup>
    </PanelGrid>

    <PanelFieldGroup :label="panels.textCase">
      <AppSelect
        :label="panels.textCase"
        :model-value="definition.textCase"
        :options="textCaseOptions"
        @update:model-value="setTextCase"
      />
    </PanelFieldGroup>
  </div>
</template>
