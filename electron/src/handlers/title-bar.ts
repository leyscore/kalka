import type { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import * as v from 'valibot'

/**
 * The editor window has no title bar of its own: the app's tab bar runs to the top edge and is
 * the window's title bar, as in Chrome. Its height is the tab bar's (`src/theme/tab-bar.ts`).
 */
export const TITLE_BAR_HEIGHT = 40

/**
 * The caption buttons Windows and Linux draw over the tab bar, in the colors of the backdrop
 * behind it and of its text (`--color-canvas` and `--color-surface` in `src/app.css`).
 */
const OVERLAY_COLORS = {
  dark: { color: '#0f0f12', symbolColor: '#ededf0' },
  light: { color: '#e2e3df', symbolColor: '#121214' }
} as const

export const TitleBarTheme = v.nullable(v.picklist(['dark', 'light']))
export type TitleBarTheme = v.InferOutput<typeof TitleBarTheme>

/** The traffic lights, centred in the tab bar's height and inset from its start like a tab. */
const TRAFFIC_LIGHTS = { x: 14, y: 13 }

/** What repainting the caption buttons needs of a window. */
type OverlaidWindow = Pick<BrowserWindow, 'isDestroyed' | 'setTitleBarOverlay'>

const overlaid = new WeakSet<OverlaidWindow>()

/**
 * The window options that hide the native title bar. Every platform gets an overlay, which turns
 * on the page's `titlebar-area-*` CSS variables: the tab bar pads itself out of the controls'
 * way with them, on the left for the traffic lights and on the right for caption buttons.
 */
export function titleBarOptions(
  platform: NodeJS.Platform = process.platform
): BrowserWindowConstructorOptions {
  if (platform === 'darwin') {
    return {
      titleBarStyle: 'hidden',
      trafficLightPosition: TRAFFIC_LIGHTS,
      titleBarOverlay: { height: TITLE_BAR_HEIGHT }
    }
  }
  return {
    titleBarStyle: 'hidden',
    titleBarOverlay: { height: TITLE_BAR_HEIGHT, ...OVERLAY_COLORS.dark }
  }
}

/** Marks a window created with `titleBarOptions`, whose caption buttons follow the app's theme. */
export function trackTitleBar(window: OverlaidWindow): void {
  overlaid.add(window)
}

/**
 * Repaints the caption buttons for the app's light or dark theme.
 * macOS draws its traffic lights the same in both, so only Windows and Linux repaint.
 */
export function applyTitleBarTheme(
  window: OverlaidWindow,
  theme: 'dark' | 'light',
  platform: NodeJS.Platform = process.platform
): void {
  if (platform === 'darwin' || !overlaid.has(window) || window.isDestroyed()) return
  window.setTitleBarOverlay({ height: TITLE_BAR_HEIGHT, ...OVERLAY_COLORS[theme] })
}
