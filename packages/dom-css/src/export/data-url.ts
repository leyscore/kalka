import { fromUint8Array } from 'js-base64'

import { imageExtension } from '@kalka/scene-graph/images'

/**
 * An image's bytes as a data URL. An SVG only draws under its own type; browsers recognise
 * raster formats whatever type they are given.
 */
export function imageDataURL(bytes: Uint8Array): string {
  const type = imageExtension(bytes) === 'svg' ? 'image/svg+xml' : 'image/png'
  return `data:${type};base64,${fromUint8Array(bytes)}`
}
