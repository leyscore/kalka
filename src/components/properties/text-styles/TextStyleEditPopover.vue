<script setup lang="ts">
import { PopoverAnchor, PopoverClose, PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui'

import type { SceneNode } from '@kalka/scene-graph'
import { useI18n, useRetainedPopup } from '@kalka/vue'

import AppButton from '@/components/ui/button/AppButton.vue'
import { usePopoverUI } from '@/components/ui/overlay/popover'

import TextStyleEditor from './TextStyleEditor.vue'

/**
 * Edit text style: a floating panel beside the properties panel. The slot is one element, the
 * panel row it opens beside, holding a `PopoverTrigger` that opens it.
 */
const { definition } = defineProps<{ definition: SceneNode | null }>()
defineSlots<{ default(): unknown }>()
const { panels, common } = useI18n()
const { open, portalActive } = useRetainedPopup()
const styles = usePopoverUI({
  content: 'w-64 max-w-[calc(100vw-1rem)]',
  header: 'flex items-center gap-1.5 border-b border-border px-3 py-2',
  body: 'p-3'
})
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverAnchor as-child>
      <slot />
    </PopoverAnchor>
    <PopoverPortal v-if="portalActive && definition">
      <PopoverContent
        side="left"
        align="start"
        :side-offset="8"
        :aria-label="panels.editTextStyle"
        :class="styles.content"
        @focus-outside.prevent
      >
        <div :class="styles.header">
          <h3 class="truncate text-xs font-semibold text-surface">{{ panels.editTextStyle }}</h3>
          <PopoverClose as-child>
            <AppButton :aria-label="common.close" class="ml-auto">
              <icon-hugeicons-x class="size-3.5" />
            </AppButton>
          </PopoverClose>
        </div>
        <div :class="styles.body">
          <TextStyleEditor :definition="definition" />
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
