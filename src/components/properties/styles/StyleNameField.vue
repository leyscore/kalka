<script setup lang="ts">
import { ref, watch } from 'vue'

import type { SceneNode } from '@kalka/scene-graph'
import { useEditor, useI18n } from '@kalka/vue'

import AppInput from '@/components/ui/input/AppInput.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'

/** A style's name in its editor; a `/` files it in a folder. */
const { definition } = defineProps<{ definition: SceneNode }>()
const editor = useEditor()
const { panels } = useI18n()
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
</template>
