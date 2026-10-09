<script setup lang="ts">
/**
 * The brand backdrop behind the whole app, as on the boot splash: soft blue and sky light with
 * film grain. Panels are frosted glass over it. It drifts only where asked: glass over moving
 * light is recomputed every frame.
 */
const { drift = false, fill = 'fixed' } = defineProps<{
  drift?: boolean
  fill?: 'fixed' | 'absolute'
}>()
</script>

<template>
  <div
    aria-hidden="true"
    :class="[fill, 'pointer-events-none inset-0 -z-10 overflow-hidden bg-canvas']"
  >
    <div
      class="absolute -top-[18vmax] -left-[12vmax] size-[52vmax] rounded-full bg-brand-blue opacity-[var(--backdrop-glow-a)] blur-[110px]"
      :class="drift && 'animate-backdrop-drift motion-reduce:animate-none'"
    />
    <div
      class="absolute -right-[14vmax] -bottom-[20vmax] size-[56vmax] rounded-full bg-brand-sky opacity-[var(--backdrop-glow-b)] blur-[120px]"
      :class="drift && 'animate-backdrop-drift-reverse motion-reduce:animate-none'"
    />
    <div
      class="absolute top-[30%] left-[55%] size-[30vmax] rounded-full bg-brand-blue opacity-[var(--backdrop-glow-c)] blur-[100px]"
    />
    <div class="grain-corners absolute inset-0" />
  </div>
</template>
