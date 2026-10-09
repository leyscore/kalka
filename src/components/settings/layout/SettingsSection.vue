<script setup lang="ts">
import { useId } from 'vue'

const headingId = useId()
</script>

<template>
  <section class="flex flex-col gap-2" :aria-labelledby="headingId">
    <div class="flex min-h-7 items-center justify-between gap-4 px-0.5">
      <div class="min-w-0 flex-1">
        <h3 :id="headingId" class="text-[11px] font-medium text-muted"><slot name="title" /></h3>
        <p v-if="$slots.description" class="mt-0.5 text-[11px] leading-relaxed text-faint">
          <slot name="description" />
        </p>
      </div>
      <div v-if="$slots.actions" class="shrink-0"><slot name="actions" /></div>
    </div>
    <slot />
  </section>
</template>
