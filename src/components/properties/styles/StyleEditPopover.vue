<script setup lang="ts">
import { PopoverAnchor, PopoverClose, PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui'
import { computed } from 'vue'

import type { SceneNode } from '@kalka/scene-graph'
import { useI18n, useRetainedPopup } from '@kalka/vue'

import AppButton from '@/components/ui/button/AppButton.vue'
import { usePopoverUI } from '@/components/ui/overlay/popover'

import ColorStyleEditor from './ColorStyleEditor.vue'
import EffectStyleEditor from './EffectStyleEditor.vue'
import GridStyleEditor from './GridStyleEditor.vue'
import { styleKindForType, useStyleTypeLabels } from './kinds'
import TextStyleEditor from './TextStyleEditor.vue'

/**
 * Edit style: a floating panel beside the properties panel with the style's name and values, as
 * Figma's Edit text, color, effect or grid style. The slot is one element, the panel row it opens
 * beside, holding a `PopoverTrigger` that opens it.
 */
const { definition } = defineProps<{ definition: SceneNode | null }>()
defineSlots<{ default(): unknown }>()
const { common } = useI18n()
const { open, portalActive } = useRetainedPopup()
const typeLabels = useStyleTypeLabels()
const title = computed(() => {
  const type = definition?.sharedStyleType
  return type ? typeLabels.value(styleKindForType(type)).edit : ''
})
const styles = usePopoverUI({
  content: 'flex max-h-[min(36rem,80vh)] w-64 max-w-[calc(100vw-1rem)] flex-col overflow-hidden',
  header: 'flex items-center gap-1.5 border-b border-border px-3 py-2',
  body: 'scrollbar-thin min-h-0 flex-1 overflow-y-auto p-3'
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
        :aria-label="title"
        :class="styles.content"
        @focus-outside.prevent
      >
        <div :class="styles.header">
          <h3 class="truncate text-xs font-semibold text-surface">{{ title }}</h3>
          <PopoverClose as-child>
            <AppButton :aria-label="common.close" class="ml-auto">
              <icon-hugeicons-x class="size-3.5" />
            </AppButton>
          </PopoverClose>
        </div>
        <div :class="styles.body">
          <TextStyleEditor v-if="definition.sharedStyleType === 'TEXT'" :definition="definition" />
          <ColorStyleEditor
            v-else-if="definition.sharedStyleType === 'FILL'"
            :definition="definition"
          />
          <EffectStyleEditor
            v-else-if="definition.sharedStyleType === 'EFFECT'"
            :definition="definition"
          />
          <GridStyleEditor
            v-else-if="definition.sharedStyleType === 'GRID'"
            :definition="definition"
          />
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
