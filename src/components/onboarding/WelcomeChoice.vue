<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem } from 'reka-ui'

/** A choice in a welcome step: a whole card that acts as one radio button. */
const { value, label, hint } = defineProps<{ value: string; label: string; hint?: string }>()
</script>

<template>
  <RadioGroupItem
    :value="value"
    class="group flex w-full items-center gap-3.5 rounded-[14px] border border-transparent bg-card px-4 py-3 text-left transition-[border-color,background-color] duration-150 outline-none hover:bg-card-hover focus-visible:ring-2 focus-visible:ring-accent/50 data-[state=checked]:border-accent/70 data-[state=checked]:bg-row-selected/60"
  >
    <span
      class="grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] border-muted/70 transition-colors group-data-[state=checked]:border-accent"
    >
      <RadioGroupIndicator class="size-2 rounded-full bg-accent" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-[13px] font-semibold text-surface">{{ label }}</span>
      <span v-if="hint" class="mt-0.5 block text-xs text-muted">{{ hint }}</span>
      <slot />
    </span>
  </RadioGroupItem>
</template>
