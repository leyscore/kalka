<script setup lang="ts">
import { useEditorCommands } from '@kalka/vue'

import BooleanOperationsControl from '@/components/properties/BooleanOperationsControl.vue'
import IconButton from '@/components/ui/button/IconButton.vue'

const { showBooleanOperations = false } = defineProps<{
  showBooleanOperations?: boolean
}>()

const { getCommand, runCommand } = useEditorCommands()
const maskCommand = getCommand('selection.toggleMask')
</script>

<template>
  <!-- The mask button keeps its place when booleans appear for several layers, so a click aimed at
  the boolean menu never lands on it. -->
  <div class="ml-auto flex items-center gap-1">
    <BooleanOperationsControl v-if="showBooleanOperations" />
    <IconButton
      :label="maskCommand.label"
      :disabled="!maskCommand.enabled.value"
      data-test-id="selection-toggle-mask"
      @click="runCommand('selection.toggleMask')"
    >
      <icon-hugeicons-shapes class="size-3.5" />
    </IconButton>
  </div>
</template>
