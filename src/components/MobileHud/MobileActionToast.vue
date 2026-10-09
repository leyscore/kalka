<script setup lang="ts">
import { useMobileHudContext } from '@/components/MobileHud/context'
import { feedbackTransition } from '@/theme/motion/styles'

const hud = useMobileHudContext()
</script>

<template>
  <Transition v-bind="feedbackTransition">
    <div
      v-if="hud.actionToast"
      :key="hud.actionToast"
      class="flex h-8 items-center rounded-full border border-glass-strong-border bg-glass-strong px-3 shadow-(--toolbar-shadow) backdrop-blur-[28px]"
    >
      <span class="text-xs whitespace-nowrap text-primary">{{ hud.actionToast }}</span>
    </div>
  </Transition>
</template>
