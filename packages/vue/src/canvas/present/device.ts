import type { PrototypeDevice } from '@kalka/scene-graph'
import { colorToCSS } from '@kalka/scene-graph/color'

/**
 * The body a presented prototype's device is drawn in: a plain rounded case around the screen,
 * drawn here rather than taken from any maker's artwork, sized by the kind of device the preset
 * names. A custom size has no body, as Figma shows a bare screen for it.
 */
export interface DeviceBody {
  /** The case's width around the screen, in screen points. */
  bezel: number
  /** The case's corner radius, in screen points. */
  radius: number
  /** A laptop's base below its screen, in screen points; 0 for others. */
  base: number
}

const PHONE: DeviceBody = { bezel: 14, radius: 62, base: 0 }
const TABLET: DeviceBody = { bezel: 24, radius: 40, base: 0 }
const LAPTOP: DeviceBody = { bezel: 18, radius: 22, base: 28 }

export function deviceBody(device: PrototypeDevice | null | undefined): DeviceBody | null {
  const id = (device?.presetIdentifier ?? '').toUpperCase()
  if (/IPAD|TABLET|SURFACE|ANDROID_MEDIUM|GALAXY_TAB/.test(id)) return TABLET
  if (/IPHONE|ANDROID|PIXEL|GALAXY/.test(id)) return PHONE
  if (/MACBOOK|LAPTOP/.test(id)) return LAPTOP
  return null
}

/** The room a body takes around its screen, in screen points. */
export function deviceOutset(body: DeviceBody | null): { width: number; height: number } {
  return body
    ? { width: body.bezel * 2, height: body.bezel * 2 + body.base }
    : { width: 0, height: 0 }
}

type Style = Record<string, string>

const CASE_SHADOW = colorToCSS({ r: 0, g: 0, b: 0, a: 0.45 })

/** Styles of the case, the screen inside it and a laptop's base, at the presenter's scale. */
export function deviceStyles(
  body: DeviceBody | null,
  screen: { width: number; height: number },
  scale: number
): { body: Style; screen: Style; base: Style | null } {
  if (!body) return { body: {}, screen: {}, base: null }
  const px = (value: number) => `${value * scale}px`
  return {
    body: {
      padding: px(body.bezel),
      borderRadius: px(body.radius),
      background: '#1d1d1f',
      boxShadow: `inset 0 0 0 ${px(2)} #3a3a3c, 0 ${px(24)} ${px(60)} ${CASE_SHADOW}`
    },
    screen: { borderRadius: px(Math.max(0, body.radius - body.bezel)) },
    base: body.base
      ? {
          width: px((screen.width + body.bezel * 2) * 1.16),
          height: px(body.base),
          background: '#2c2c2e',
          borderRadius: `0 0 ${px(body.base)} ${px(body.base)}`
        }
      : null
  }
}
