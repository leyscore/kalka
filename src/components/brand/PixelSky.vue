<script setup lang="ts">
import { pixelSky } from '@/theme/brand'

/** The kalka.design sky, drawn behind a full screen; decorative only. */
const sky = pixelSky()
</script>

<template>
  <div aria-hidden="true" :class="sky.root()">
    <div :class="sky.grain()" />
    <div :class="sky.clouds()" />
  </div>
</template>
