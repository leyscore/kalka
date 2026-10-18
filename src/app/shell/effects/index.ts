import { useLocalStorage, useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'

import { appRuntimeConfig } from '@/app/runtime/config'
import { whenIdle } from '@/app/runtime/idle'

const SOFTWARE_RENDERING_STORAGE_KEY = 'kalka:effects:software-rendering'
/** The longest the check waits for the app to be idle after the first screen. */
const DETECTION_IDLE_TIMEOUT_MS = 5000

/**
 * Whether the browser draws without a GPU, as when Chromium blocklists the driver or the app runs
 * with `--disable-gpu`. WebGL then fails with a major performance caveat. Remembered from the
 * last launch, so the first screen already draws the way this machine can afford.
 */
const softwareRendering = useLocalStorage<boolean | null>(SOFTWARE_RENDERING_STORAGE_KEY, null)
const prefersReducedTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)')

/**
 * Glass and lights cost more than they show without a GPU, where every blurred pixel is drawn by
 * the CPU, or when the system asks for less transparency: panels then draw opaque, without
 * backdrop blur, and the backdrop's lights as plain gradients (`data-effects` in `src/app.css`).
 */
export const reducedEffects = computed(
  () => softwareRendering.value === true || prefersReducedTransparency.value
)

/** True when no hardware-accelerated WebGL context can be created: the page draws in software. */
export function detectSoftwareRendering(doc: Document = document): boolean {
  const canvas = doc.createElement('canvas')
  const context =
    canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
    canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
  if (!context) return true
  context.getExtension('WEBGL_lose_context')?.loseContext()
  return false
}

/**
 * Checks the GPU: at once on the first launch, which has no answer yet, then again once the app
 * is idle, keeping the answer for the next launch.
 */
export function watchRenderingCapability(): () => void {
  // Test browsers often draw in software; their screenshots keep the effects users see.
  if (appRuntimeConfig.test) return () => undefined
  if (softwareRendering.value === null) softwareRendering.value = detectSoftwareRendering()
  return whenIdle(() => {
    softwareRendering.value = detectSoftwareRendering()
  }, DETECTION_IDLE_TIMEOUT_MS)
}
