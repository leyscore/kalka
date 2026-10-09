<script setup lang="ts">
import { TabsList } from 'reka-ui'
import { computed, normalizeClass, useTemplateRef, type HTMLAttributes } from 'vue'

import { useGlide } from '@/components/ui/motion/useGlide'
import { glidePills } from '@/theme/motion/glide'
import { tabs } from '@/theme/tabs/tabs'

const {
  label,
  class: className,
  ui
} = defineProps<{ label: string; class?: HTMLAttributes['class']; ui?: { list?: string } }>()
const styles = tabs()

// The active tab's pill slides to the chosen tab; a soft one follows the pointer.
const list = useTemplateRef<{ $el: HTMLElement }>('list')
const element = computed(() => list.value?.$el ?? null)
useGlide(element, {
  items: '[role="tab"]',
  active: '[role="tab"][data-state="active"]',
  pillClass: glidePills.active
})
useGlide(element, { items: '[role="tab"]', hover: true, pillClass: glidePills.hover })
</script>

<template>
  <TabsList
    ref="list"
    :aria-label="label"
    data-slot="list"
    :class="styles.list({ class: [ui?.list, normalizeClass(className)] })"
  >
    <slot />
  </TabsList>
</template>
