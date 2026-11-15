<script setup lang="ts">
import HudButton from '@/components/mobile-hud/HudButton.vue'
import { useMobileHudContext } from '@/components/MobileHud/context'

const hud = useMobileHudContext()
</script>

<template>
  <HudButton :label="hud.messages.share" @click="hud.share">
    <template #leading><icon-hugeicons-share-01 class="size-3.5" /></template>
  </HudButton>
</template>
