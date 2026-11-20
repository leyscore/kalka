/**
 * Device pixels per CSS pixel inside an artboard: the canvas zoom times the screen's pixel
 * ratio. Strokes thinner than a device pixel draw only the colour they cover by it, as Figma
 * draws them (`hairlineStyle` in `@kalka/dom-css`).
 */
const DEVICE_SCALE_PROPERTY = '--kalka-device-scale'

/** The scale as artboard CSS reads it; 1 until the canvas sets it. */
export const HAIRLINE_SCALE = `var(${DEVICE_SCALE_PROPERTY}, 1)`

/** The scale rounded so a zoom that barely moves does not restyle every artboard. */
export function deviceScale(zoom: number, pixelRatio: number): number {
  return Math.round(zoom * pixelRatio * 100) / 100
}

export function setDeviceScale(doc: Document, scale: number): void {
  doc.documentElement.style.setProperty(DEVICE_SCALE_PROPERTY, String(scale))
}
