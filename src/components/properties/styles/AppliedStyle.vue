<script setup lang="ts">
import { PopoverTrigger } from 'reka-ui'
import { computed } from 'vue'

import { sharedStyleTypeForKind } from '@kalka/scene-graph'
import { MIXED, useI18n, vTestId, type useSharedStyleBinding } from '@kalka/vue'

import IconButton from '@/components/ui/button/IconButton.vue'

import StyleEditPopover from './StyleEditPopover.vue'
import StyleLabel from './StyleLabel.vue'

/**
 * The style a selection uses, standing in for the values it gives, as Figma shows an applied
 * style: its name, Edit style, which opens beside the panel, and Detach style.
 */
const { binding } = defineProps<{ binding: ReturnType<typeof useSharedStyleBinding> }>()
const { panels } = useI18n()
const type = computed(() => sharedStyleTypeForKind(binding.kind))
const appliedId = computed(() => {
  const id = binding.styleId.value
  return typeof id === 'string' ? id : null
})
const applied = computed(() => binding.styles.value.find((style) => style.id === appliedId.value))
const definition = computed(() => (applied.value ? binding.definition(applied.value.nodeId) : null))
const name = computed(() => {
  if (binding.styleId.value === MIXED) return panels.value.mixed
  if (applied.value) return applied.value.name
  return appliedId.value ? panels.value.missingStyle({ id: appliedId.value }) : ''
})
</script>

<template>
  <StyleEditPopover v-if="binding.styleId.value !== null" :definition="definition">
    <div
      class="flex h-7 min-w-0 items-center gap-1.5 rounded bg-panel-field pr-0.5 pl-1.5"
      :class="type === 'TEXT' ? 'mb-3' : 'mb-1.5'"
      v-test-id="`applied-${binding.kind}-style`"
    >
      <icon-hugeicons-text-font
        v-if="type === 'TEXT'"
        class="size-3.5 shrink-0 text-muted"
        aria-hidden="true"
      />
      <StyleLabel v-if="type !== 'TEXT'" :type="type" :label="name" :definition="definition" />
      <span v-else class="min-w-0 flex-1 truncate text-xs text-surface">{{ name }}</span>
      <PopoverTrigger v-if="definition" as-child>
        <IconButton :label="panels.editStyle" :data-test-id="`${binding.kind}-style-edit`">
          <icon-hugeicons-edit-02 class="size-3.5" />
        </IconButton>
      </PopoverTrigger>
      <IconButton
        :label="panels.detachStyle"
        :data-test-id="`${binding.kind}-style-detach`"
        @click="binding.unbind()"
      >
        <icon-hugeicons-unlink-01 class="size-3.5" />
      </IconButton>
    </div>
  </StyleEditPopover>
</template>
