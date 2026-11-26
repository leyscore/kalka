<script setup lang="ts">
import { ref } from 'vue'
import IconTestTube from '~icons/hugeicons/test-tube-01'

import { componentPlaygroundProperties } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'
import { useI18n, useSceneComputed } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import IconButton from '@/components/ui/button/IconButton.vue'

import ComponentPlaygroundDialog from './ComponentPlaygroundDialog.vue'

const { node } = defineProps<{ node: SceneNode }>()
const editor = useEditorStore()
const { panels } = useI18n()
const open = ref(false)
// Figma offers the playground once the component has properties to try.
const available = useSceneComputed(
  () => (componentPlaygroundProperties(editor.graph, node.id)?.definitions.length ?? 0) > 0
)
</script>

<template>
  <template v-if="available">
    <IconButton
      :label="panels.componentPlayground"
      data-test-id="component-playground-open"
      @click="open = true"
    >
      <IconTestTube class="size-3.5" />
    </IconButton>
    <ComponentPlaygroundDialog v-model:open="open" :node-id="node.id" />
  </template>
</template>
