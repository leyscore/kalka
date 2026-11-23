// A picture taken from the screen is opaque, and a canvas often is not: a WebGL scene drawn over
// a page's text would cover it in the copy. Two pictures of the canvas, one over white and one
// over black, say how much of each pixel is the canvas's own.

/** Below this a pixel shows nothing of its own; above the other it hides all behind it. */
const CLEAR = 3
const SOLID = 252

function channel(value: number | undefined): number {
  return value ?? 0
}

/**
 * The pixels of something see-through, as RGBA with straight alpha, from the RGBA pixels of two
 * pictures of it: over white, and over black. A pixel as bright over black as over white is
 * opaque; one that takes the backdrop's color is clear. Where the two disagree the other way,
 * because the thing moved between the pictures, the pixel is kept opaque as the second shows it.
 */
export function seeThrough(
  onWhite: Uint8ClampedArray,
  onBlack: Uint8ClampedArray
): Uint8ClampedArray<ArrayBuffer> {
  const pixels = new Uint8ClampedArray(onBlack.length)
  for (let index = 0; index + 3 < onBlack.length; index += 4) {
    const red = channel(onBlack[index])
    const green = channel(onBlack[index + 1])
    const blue = channel(onBlack[index + 2])
    const shown =
      (channel(onWhite[index]) - red + channel(onWhite[index + 1]) - green) / 3 +
      (channel(onWhite[index + 2]) - blue) / 3
    const alpha = Math.min(255, Math.max(0, Math.round(255 - shown)))
    if (alpha < CLEAR) continue
    const solid = alpha >= SOLID
    const scale = solid ? 1 : 255 / alpha
    pixels[index] = red * scale
    pixels[index + 1] = green * scale
    pixels[index + 2] = blue * scale
    pixels[index + 3] = solid ? 255 : alpha
  }
  return pixels
}
