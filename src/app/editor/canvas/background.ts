import { converter } from 'culori'
import { computed } from 'vue'

import type { Color } from '@kalka/scene-graph'

import { appPreferences } from '@/app/settings/preferences/store'
import { resolvedAppTheme } from '@/app/shell/theme'

/** Kalka's canvas colors, as `--color-design-canvas` paints them in each theme. */
const KALKA_CANVAS = { light: '#ececee', dark: '#1a1b20' } as const

const toRGB = converter('rgb')

function hexColor(hex: string): Color {
  const rgb = toRGB(hex)
  return { r: rgb?.r ?? 0, g: rgb?.g ?? 0, b: rgb?.b ?? 0, a: 1 }
}

/** Whether the canvas shows Kalka's color behind the artboards instead of the page's own. */
export const showsKalkaCanvas = computed(
  () => appPreferences.value.rendering.canvasBackground === 'kalka'
)

// One object per theme, so a frame-by-frame comparison sees it unchanged.
const kalkaCanvasColor = computed(() => hexColor(KALKA_CANVAS[resolvedAppTheme.value]))

/** The color behind the artboards, which labels and grids on the canvas contrast with. */
export function canvasBackgroundColor(pageColor: Color): Color {
  return showsKalkaCanvas.value ? kalkaCanvasColor.value : pageColor
}
