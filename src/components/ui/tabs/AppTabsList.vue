<script setup lang="ts">
import { injectTabsRootContext, TabsList } from 'reka-ui'
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

// The active tab's pill slides to the chosen tab; a soft one follows the pointer. Vertical tabs
// are a page's navigation, such as Settings, and take the roomier navigation pills.
const list = useTemplateRef<{ $el: HTMLElement }>('list')
const element = computed(() => list.value?.$el ?? null)
const vertical = injectTabsRootContext().orientation.value === 'vertical'
useGlide(element, {
  items: '[role="tab"]',
  active: '[role="tab"][data-state="active"]',
  pillClass: vertical ? glidePills.navActive : glidePills.active
})
useGlide(element, {
  items: '[role="tab"]',
  hover: true,
  pillClass: vertical ? glidePills.navHover : glidePills.hover
})
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
