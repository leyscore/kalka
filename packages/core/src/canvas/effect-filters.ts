import type { ImageFilter } from 'canvaskit-wasm'

import type { Effect, SceneNode } from '@kalka/scene-graph'

import type { SkiaRenderer } from './renderer'

/**
 * Skia filters for the effects CSS draws with SVG filters (`@kalka/scene-graph/css-model`), so a
 * raster export matches the canvas: a progressive blur, and a glass's refraction with its
 * dispersion. Their coordinates are the layer's own, as the canvas is at the layer's origin when
 * its filter layer is saved.
 */
export interface MadeFilter {
  filter: ImageFilter
  /** Releases what was made for this draw; cached filters stay. */
  release(): void
}

/**
 * A blur from `startRadius` at its start point to `radius` at its end point: the layer blurred
 * both ways and blended along a ramp between the points, as the SVG filter does.
 */
export function progressiveBlurFilter(
  r: SkiaRenderer,
  effect: Effect,
  width: number,
  height: number
): MadeFilter {
  const ck = r.ck
  const start = effect.startOffset ?? { x: 0.5, y: 0 }
  const end = effect.endOffset ?? { x: 0.5, y: 1 }
  const ramp = ck.Shader.MakeLinearGradient(
    [start.x * width, start.y * height],
    [end.x * width, end.y * height],
    [ck.Color4f(0, 0, 0, 0), ck.Color4f(0, 0, 0, 1)],
    null,
    ck.TileMode.Clamp
  )
  const mask = ck.ImageFilter.MakeShader(ramp)
  ramp.delete()
  const startSigma = Math.max(0, effect.startRadius ?? 0) / 2
  const weak = startSigma > 0 ? r.getCachedBlur(startSigma) : null
  const strong = r.getCachedBlur(Math.max(0, effect.radius) / 2)
  const strongPart = ck.ImageFilter.MakeBlend(ck.BlendMode.DstIn, strong, mask)
  const weakPart = ck.ImageFilter.MakeBlend(ck.BlendMode.DstOut, weak, mask)
  const filter = ck.ImageFilter.MakeBlend(ck.BlendMode.Plus, weakPart, strongPart)
  return {
    filter,
    release: () => {
      for (const made of [mask, strongPart, weakPart, filter]) made.delete()
    }
  }
}

const CHANNELS = {
  r: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  g: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  b: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
} as const

/**
 * A glass's refraction of what lies behind it, or null when it does not bend it: pulled in from
 * the edges over a band as deep as the glass, each colour by its own amount when it disperses.
 */
export function glassRefractionFilter(
  r: SkiaRenderer,
  effect: Effect,
  width: number,
  height: number
): MadeFilter | null {
  const ck = r.ck
  const refraction = Math.max(0, Math.min(1, effect.refraction ?? 0))
  if (refraction === 0 || width <= 0 || height <= 0) return null
  const band = Math.max(1, Math.min(effect.depth ?? 20, width / 2, height / 2))
  const made: { delete(): void }[] = []
  // Red rises towards the left edge and green towards the top: a displacement of 0.5 is none.
  const ramp = (length: number, vertical: boolean) => {
    const color = (value: number) =>
      vertical ? ck.Color4f(0, value, 0, 1) : ck.Color4f(value, 0, 0, 1)
    return ck.Shader.MakeLinearGradient(
      [0, 0],
      vertical ? [0, length] : [length, 0],
      [color(1), color(0.5), color(0.5), color(0)],
      [0, band / length, 1 - band / length, 1],
      ck.TileMode.Clamp
    )
  }
  const x = ramp(width, false)
  const y = ramp(height, true)
  const map = ck.Shader.MakeBlend(ck.BlendMode.Plus, x, y)
  x.delete()
  y.delete()
  const mapFilter = ck.ImageFilter.MakeShader(map)
  map.delete()
  made.push(mapFilter)
  const scale = band * 2 * refraction
  const displace = (amount: number) => {
    const filter = ck.ImageFilter.MakeDisplacementMap(
      ck.ColorChannel.Red,
      ck.ColorChannel.Green,
      amount,
      mapFilter,
      null
    )
    made.push(filter)
    return filter
  }
  const dispersion = Math.max(0, Math.min(1, effect.dispersion ?? 0))
  let filter: ImageFilter
  if (dispersion === 0) {
    filter = displace(scale)
  } else {
    const spread = 0.5 * dispersion
    const channel = (name: keyof typeof CHANNELS, amount: number) => {
      const matrix = ck.ColorFilter.MakeMatrix([...CHANNELS[name]])
      const result = ck.ImageFilter.MakeColorFilter(matrix, displace(amount))
      matrix.delete()
      made.push(result)
      return result
    }
    const red = channel('r', scale * (1 - spread))
    const green = channel('g', scale)
    const blue = channel('b', scale * (1 + spread))
    const redGreen = ck.ImageFilter.MakeBlend(ck.BlendMode.Plus, red, green)
    filter = ck.ImageFilter.MakeBlend(ck.BlendMode.Plus, redGreen, blue)
    made.push(redGreen, filter)
  }
  return {
    filter,
    release: () => {
      for (const object of made) object.delete()
    }
  }
}

/** A filter that keeps what `filter` draws inside the layer's own pixels, as clip to shape does. */
export function clippedToSource(r: SkiaRenderer, filter: ImageFilter): ImageFilter {
  return r.ck.ImageFilter.MakeBlend(r.ck.BlendMode.DstIn, filter, null)
}

/** Whether a layer's blur draws through `progressiveBlurFilter`. */
export function isProgressiveBlur(effect: Effect, node: SceneNode): boolean {
  return effect.blurType === 'PROGRESSIVE' && node.width > 0 && node.height > 0
}
