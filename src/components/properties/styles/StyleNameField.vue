<script setup lang="ts">
import { ref, watch } from 'vue'

import type { SceneNode } from '@kalka/scene-graph'
import { useEditor, useI18n } from '@kalka/vue'

import AppInput from '@/components/ui/input/AppInput.vue'
import AppTextarea from '@/components/ui/input/AppTextarea.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'

/** A style's name and description in its editor; a `/` in the name files it in a folder. */
const { definition } = defineProps<{ definition: SceneNode }>()
const editor = useEditor()
const { panels } = useI18n()
const draftName = ref(definition.name)
const draftDescription = ref(definition.symbolDescription)
watch(
  () => definition.name,
  (name) => {
    draftName.value = name
  }
)
watch(
  () => definition.symbolDescription,
  (description) => {
    draftDescription.value = description
  }
)

function rename() {
  const next = draftName.value.trim()
  if (next && next !== definition.name) editor.renameSharedStyle(definition.id, next)
  else draftName.value = definition.name
}

function describe() {
  editor.describeSharedStyle(definition.id, draftDescription.value)
}
</script>

<template>
  <PanelFieldGroup :label="panels.styleName">
    <AppInput
      v-model="draftName"
      size="sm"
      tone="panel"
      :aria-label="panels.styleName"
      data-property="style-name"
      @change="rename"
      @enter="rename"
    />
  </PanelFieldGroup>
  <PanelFieldGroup :label="panels.styleDescription">
    <AppTextarea
      v-model="draftDescription"
      :rows="2"
      :aria-label="panels.styleDescription"
      data-property="style-description"
      @change="describe"
    />
  </PanelFieldGroup>
</template>
