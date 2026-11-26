import { createEventHook } from '@vueuse/core'
import * as v from 'valibot'

import { IS_BROWSER } from '@kalka/core/constants'

const EDITOR_LAYOUT_KEY = 'kalka:editor-layout'
export const DEFAULT_EDITOR_LAYOUT: readonly [number, number, number] = [17, 64, 19]
const EditorLayoutJSON = v.pipe(
  v.string(),
  v.parseJson(),
  v.strictTuple([v.number(), v.number(), v.number()])
)

export function loadEditorLayout(): number[] {
  if (!IS_BROWSER) return [...DEFAULT_EDITOR_LAYOUT]
  try {
    const parsed = v.safeParse(EditorLayoutJSON, window.localStorage.getItem(EDITOR_LAYOUT_KEY))
    return parsed.success ? parsed.output : [...DEFAULT_EDITOR_LAYOUT]
  } catch {
    return [...DEFAULT_EDITOR_LAYOUT]
  }
}

export function saveEditorLayout(layout: number[]): void {
  if (!IS_BROWSER) return
  window.localStorage.setItem(EDITOR_LAYOUT_KEY, JSON.stringify(layout))
}

const panelWidthsReset = createEventHook<readonly [number, number, number]>()

/** Runs `handler` with the layout each time the side panels go back to their first widths. */
export const onPanelWidthsReset = panelWidthsReset.on

/** Puts the layers and properties panels back to their first widths, as Figma's Reset panel widths. */
export function resetPanelWidths(): void {
  saveEditorLayout([...DEFAULT_EDITOR_LAYOUT])
  void panelWidthsReset.trigger(DEFAULT_EDITOR_LAYOUT)
}

/**
 * The narrowest the side panels get, in CSS pixels. The editor layout is stored in percent so the
 * panels scale with the window, but on a laptop a percent floor leaves too little room for their
 * labels, so each side panel also keeps this width.
 */
export const SIDE_PANEL_MIN_WIDTH = { layers: 216, properties: 240 } as const

const SIDE_PANEL_MIN_SIZE = 10
const SIDE_PANEL_MAX_SIZE = 30

/** Percent bounds of a side panel that keeps `minWidth` pixels in a group `groupWidth` wide. */
export function sidePanelSizeLimits(
  minWidth: number,
  groupWidth: number
): { minSize: number; maxSize: number } {
  if (groupWidth <= 0) return { minSize: SIDE_PANEL_MIN_SIZE, maxSize: SIDE_PANEL_MAX_SIZE }
  const minSize = Math.max(SIDE_PANEL_MIN_SIZE, (minWidth / groupWidth) * 100)
  return { minSize, maxSize: Math.max(SIDE_PANEL_MAX_SIZE, minSize) }
}
