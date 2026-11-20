<script setup lang="ts">
import { pixelSky } from '@/theme/brand'

/** The kalka.design sky, behind a full screen or as the band at the top of Home; decorative only. */
const { place = 'screen' } = defineProps<{ place?: 'screen' | 'band' }>()
const sky = pixelSky({ place })

/** Cloud dots sit on a 9 px grid; a twinkle covers one to three of them. */
const STEP = 9
/** How many twinkles, over the cloud layer: the screen plus its drift on each side, or the band's strip. */
const LAYERS = {
  screen: { count: 420, width: 2200, height: 1200 },
  band: { count: 150, width: 2200, height: 200 }
} as const

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
  const area = LAYERS[place]
  return Array.from({ length: area.count }, () => {
    const columns = 1 + Math.floor(next() * 3)
    const rows = 1 + Math.floor(next() * 2)
    return {
      left: `${Math.floor((next() * area.width) / STEP) * STEP}px`,
      top: `${Math.floor((next() * area.height) / STEP) * STEP}px`,
      width: `${columns * STEP}px`,
      height: `${rows * STEP}px`,
      '--twinkle-duration': `${(2.2 + next() * 4.5).toFixed(1)}s`,
      '--twinkle-delay': `${(-next() * 7).toFixed(1)}s`
    }
  })
}

const sparks = twinkles()

/** The four-point stars of the night, where kalka.design's footer places them: where, how big, what pace. */
const STARS = [
  [6, 38, 10, 3.8, 0],
  [17, 64, 7, 5.2, -1.4],
  [29, 44, 12, 4.4, -2.6],
  [41, 78, 8, 6.0, -0.8],
  [52, 36, 9, 4.9, -3.1],
  [63, 58, 14, 5.6, -1.9],
  [74, 42, 8, 3.6, -0.4],
  [86, 70, 11, 4.7, -2.2],
  [94, 48, 7, 5.9, -3.6],
  [12, 86, 9, 4.2, -1.1],
  [58, 90, 7, 5.0, -2.9],
  [81, 30, 9, 6.3, -0.6]
] as const

const stars = STARS.map(([left, top, size, duration, delay]) => ({
  left: `${left}%`,
  top: `${top}%`,
  width: `${size}px`,
  height: `${size}px`,
  '--glow-duration': `${duration}s`,
  '--glow-delay': `${delay}s`
}))
</script>

<template>
  <div aria-hidden="true" :class="sky.root()">
    <div :class="sky.night()">
      <div :class="sky.stars()" />
      <i v-for="(star, index) in stars" :key="index" :class="sky.star()" :style="star" />
    </div>
    <div :class="sky.grain()" />
    <div :class="sky.clouds()">
      <i v-for="(spark, index) in sparks" :key="index" :class="sky.spark()" :style="spark" />
    </div>
  </div>
</template>
