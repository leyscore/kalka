import { tryOnScopeDispose, useEventListener } from '@vueuse/core'
import { watch, type Ref } from 'vue'

import type { Rect } from '@kalka/scene-graph/primitives'

/** Marks UI that floats over the canvas, such as the toolbar, for overlays to keep clear of. */
const CANVAS_OBSTACLE_ATTRIBUTE = 'data-canvas-obstacle'

/** Floating UI over a canvas, as rectangles in the canvas's CSS pixels. */
export function canvasOverlayObstacles(canvas: HTMLElement | null): Rect[] {
  if (!canvas) return []
  const box = canvas.getBoundingClientRect()
  return [...document.querySelectorAll(`[${CANVAS_OBSTACLE_ATTRIBUTE}]`)].flatMap((element) => {
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return []
    return [
      { x: rect.left - box.left, y: rect.top - box.top, width: rect.width, height: rect.height }
    ]
  })
}

function sameElements(a: readonly Element[], b: readonly Element[]): boolean {
  return a.length === b.length && a.every((element, index) => element === b[index])
}

/**
 * The obstacles over a canvas, read again only when they may have moved: when the floating UI
 * marked as obstacles is not the same elements, or the canvas or one of them changed size.
 * Reading element boxes forces a layout, which the overlay would otherwise pay on every frame
 * of a gesture.
 */
export function useCanvasOverlayObstacles(canvas: Ref<HTMLElement | null>): () => Rect[] {
  let cached: Rect[] | null = null
  let elements: Element[] = []
  const invalidate = () => {
    cached = null
  }
  // One observer for the canvas and the obstacles it last found; the obstacles change rarely.
  const sizes = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(invalidate)
  const observe = (box: HTMLElement | null) => {
    if (!sizes) return
    sizes.disconnect()
    for (const element of [box, ...elements]) if (element) sizes.observe(element)
  }
  watch(canvas, observe, { immediate: true })
  useEventListener('resize', invalidate)
  tryOnScopeDispose(() => sizes?.disconnect())
  return () => {
    const current = [...document.querySelectorAll(`[${CANVAS_OBSTACLE_ATTRIBUTE}]`)]
    if (!sameElements(current, elements)) {
      elements = current
      observe(canvas.value)
      cached = null
    }
    cached ??= canvasOverlayObstacles(canvas.value)
    return cached
  }
}
