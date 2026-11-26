import { colorToHex, parseColor } from '@kalka/scene-graph/color'
import type { Color } from '@kalka/scene-graph/primitives'

import type { EditorStore } from '@/app/editor/active-store'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'
import { writeTauriClipboardText } from '@/app/tauri/clipboard'
import { isTauri } from '@/app/tauri/env'
import { IS_BROWSER } from '@/constants'

/** Whether this browser has the EyeDropper API: Chromium-based browsers and the desktop app. */
export function canPickScreenColor(): boolean {
  return IS_BROWSER && screenEyeDropper() !== undefined
}

function screenEyeDropper() {
  // eslint-disable-next-line compat/compat -- feature-detected: Safari and Firefox go without
  return window.EyeDropper
}

/**
 * A colour picked anywhere on the screen, the canvas included, with the system's magnifier; null
 * when the person cancels or the browser has no eyedropper, which it then says.
 */
export async function pickScreenColor(): Promise<Color | null> {
  const EyeDropperAPI = IS_BROWSER ? screenEyeDropper() : undefined
  if (!EyeDropperAPI) {
    toast.info(notificationMessages.get().eyedropperUnavailable)
    return null
  }
  try {
    const { sRGBHex } = await new EyeDropperAPI().open()
    return parseColor(sRGBHex)
  } catch {
    // Escape or a click elsewhere cancels the pick.
    return null
  }
}

/**
 * Figma's Pick color (I): the colour picked becomes the first solid fill of each selected layer,
 * in one undo step, keeping that fill's opacity. Without a selection it is copied as hex.
 */
export async function pickColorForSelection(store: EditorStore): Promise<void> {
  const color = await pickScreenColor()
  if (!color) return
  const nodes = store.selectedNodes.value.filter((node) => node.type !== 'GROUP')
  if (nodes.length === 0) {
    const hex = colorToHex(color)
    if (isTauri()) await writeTauriClipboardText(hex)
    else await navigator.clipboard.writeText(hex).catch(() => undefined)
    toast.info(notificationMessages.get().copiedAs({ format: hex }))
    return
  }
  store.undo.runBatch('Pick color', () => {
    for (const node of nodes) {
      const index = node.fills.findIndex((fill) => fill.type === 'SOLID')
      const fills =
        index === -1
          ? [{ type: 'SOLID' as const, color, opacity: 1, visible: true }, ...node.fills]
          : node.fills.map((fill, at) => (at === index ? { ...fill, color } : fill))
      store.updateNodeWithUndo(node.id, { fills }, 'Pick color')
    }
  })
}
