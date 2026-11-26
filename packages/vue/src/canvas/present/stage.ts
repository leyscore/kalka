import { useElementSize } from '@vueuse/core'
import { computed, type Ref } from 'vue'

import { colorToCSS } from '@kalka/scene-graph/color'

import { useEditor } from '#vue/editor/context'

import { deviceBody, deviceOutset, deviceStyles } from './device'

/** Space kept around the presented screen, in window pixels. */
export const PADDING = 32

const DEFAULT_BACKGROUND = { r: 0.118, g: 0.118, b: 0.118, a: 1 }

/**
 * The stage a prototype plays on: the page's prototype background, the screen's box (its
 * device's screen, or the presented frame without one) and the scale that fits it, in its
 * device's body, to the window.
 */
export function usePresentStage(options: {
  pageId: () => string
  screenRootId: () => string
  viewport: Readonly<Ref<HTMLElement | null>>
  scaler: Readonly<Ref<HTMLElement | null>>
}) {
  const editor = useEditor()
  const { width: viewWidth, height: viewHeight } = useElementSize(options.viewport)

  const page = computed(() => {
    void editor.state.sceneVersion
    return editor.graph.getNode(options.pageId())
  })
  const background = computed(() =>
    colorToCSS(page.value?.prototypeBackground ?? DEFAULT_BACKGROUND)
  )

  function frameSize(id: string): { width: number; height: number } {
    void editor.state.sceneVersion
    const node = editor.graph.getNode(id)
    return { width: node?.width ?? 0, height: node?.height ?? 0 }
  }

  /** The screen's box: the device's screen, or the presented frame without one. */
  const box = computed(() => {
    const device = page.value?.prototypeDevice
    if (device) {
      const turned = device.rotation === 'CCW_90'
      return {
        width: turned ? device.size.y : device.size.x,
        height: turned ? device.size.x : device.size.y
      }
    }
    return frameSize(options.screenRootId())
  })
  const hasDevice = computed(() => !!page.value?.prototypeDevice)
  const body = computed(() => deviceBody(page.value?.prototypeDevice))

  /**
   * Fit the box, in its device's body, to the window, never larger than 100%; a frame without a
   * device fits its width.
   */
  const scale = computed(() => {
    const { width, height } = box.value
    if (width <= 0 || height <= 0) return 1
    const outset = deviceOutset(body.value)
    const fitWidth = (viewWidth.value - PADDING * 2) / (width + outset.width)
    const fitHeight = hasDevice.value
      ? (viewHeight.value - PADDING * 2) / (height + outset.height)
      : Infinity
    return Math.max(0.05, Math.min(1, fitWidth, fitHeight))
  })
  const device = computed(() => deviceStyles(body.value, box.value, scale.value))

  /** The scaled stage's rectangle in the window. */
  function stageRect(): DOMRect {
    return options.scaler.value?.getBoundingClientRect() ?? new DOMRect()
  }

  /** An element's box in the presented screen's own pixels, once the stage is drawn. */
  function boxIn(element: HTMLElement) {
    const origin = options.scaler.value
    if (!origin) return null
    const rect = element.getBoundingClientRect()
    const base = origin.getBoundingClientRect()
    return {
      x: (rect.left - base.left) / scale.value,
      y: (rect.top - base.top) / scale.value,
      width: rect.width / scale.value,
      height: rect.height / scale.value
    }
  }

  return { background, frameSize, box, hasDevice, body, scale, device, stageRect, boxIn }
}

export type PresentStage = ReturnType<typeof usePresentStage>
