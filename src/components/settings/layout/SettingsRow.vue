<script setup lang="ts">
const { label, description } = defineProps<{ label: string; description?: string }>()
</script>

<template>
  <div
    class="flex min-h-11 items-center justify-between gap-4 px-3.5 py-2"
    data-slot="settings-row"
  >
    <div class="min-w-0">
      <p class="text-xs text-surface">{{ label }}</p>
      <p v-if="description" class="mt-0.5 text-[11px] leading-relaxed text-muted">
        {{ description }}
      </p>
      <slot name="description" />
    </div>
    <div class="shrink-0"><slot /></div>
  </div>
</template>
