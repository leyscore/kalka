<script setup lang="ts">
import { pixelSky } from '@/theme/brand'

/** The kalka.design sky, drawn behind a full screen; decorative only. */
const sky = pixelSky()

/** Cloud dots sit on a 9 px grid; a twinkle covers one to three of them. */
const STEP = 9
const TWINKLES = 420
/** The cloud layer spans the screen plus its drift on each side. */
const AREA = { width: 2200, height: 1200 }

/**
 * Where and how each twinkle blinks: a fixed pseudo-random sequence (no `Math.random`), so the
 * sky looks the same on every open and every patch keeps its own pace.
 */
function twinkles() {
  let seed = 7
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  return Array.from({ length: TWINKLES }, () => {
    const columns = 1 + Math.floor(next() * 3)
    const rows = 1 + Math.floor(next() * 2)
    return {
      left: `${Math.floor((next() * AREA.width) / STEP) * STEP}px`,
      top: `${Math.floor((next() * AREA.height) / STEP) * STEP}px`,
      width: `${columns * STEP}px`,
      height: `${rows * STEP}px`,
      '--twinkle-duration': `${(2.2 + next() * 4.5).toFixed(1)}s`,
      '--twinkle-delay': `${(-next() * 7).toFixed(1)}s`
    }
  })
}

const sparks = twinkles()
</script>

<template>
  <div aria-hidden="true" :class="sky.root()">
    <div :class="sky.grain()" />
    <div :class="sky.clouds()">
      <i v-for="(spark, index) in sparks" :key="index" :class="sky.spark()" :style="spark" />
    </div>
  </div>
</template>
