import type { Canvas, ImageFilter, MaskFilter } from 'canvaskit-wasm'

import type { SceneNode } from '@kalka/scene-graph'

import { clippedToSource, isProgressiveBlur, progressiveBlurFilter } from './effect-filters'
import type { SkiaRenderer } from './renderer'

export function getCachedDropShadow(
  r: SkiaRenderer,
  dx: number,
  dy: number,
  sigma: number,
  color: Float32Array
): ImageFilter {
  const key = `ds:${dx},${dy},${sigma},${color[0]},${color[1]},${color[2]},${color[3]}`
  let filter = r.imageFilterCache.get(key)
  if (!filter) {
    filter = r.ck.ImageFilter.MakeDropShadowOnly(dx, dy, sigma, sigma, color, null)
    r.imageFilterCache.set(key, filter)
  }
  return filter
}

export function getCachedBlur(r: SkiaRenderer, sigma: number): ImageFilter {
  const key = `blur:${sigma}`
  let filter = r.imageFilterCache.get(key)
  if (!filter) {
    filter = r.ck.ImageFilter.MakeBlur(sigma, sigma, r.ck.TileMode.Clamp, null)
    r.imageFilterCache.set(key, filter)
  }
  return filter
}

export function getCachedDecalBlur(r: SkiaRenderer, sigma: number): ImageFilter {
  const key = `dblur:${sigma}`
  let filter = r.imageFilterCache.get(key)
  if (!filter) {
    filter = r.ck.ImageFilter.MakeBlur(sigma, sigma, r.ck.TileMode.Decal, null)
    r.imageFilterCache.set(key, filter)
  }
  return filter
}

export function getCachedMaskBlur(r: SkiaRenderer, sigma: number): MaskFilter {
  let filter = r.maskFilterCache.get(sigma)
  if (!filter) {
    filter = r.ck.MaskFilter.MakeBlur(r.ck.BlurStyle.Normal, sigma, true)
    r.maskFilterCache.set(sigma, filter)
  }
  return filter
}

export function applyClippedBlur(
  r: SkiaRenderer,
  canvas: Canvas,
  node: SceneNode,
  rect: Float32Array,
  hasRadius: boolean,
  sigma: number
): void {
  applyClippedBackdrop(r, canvas, node, rect, hasRadius, r.getCachedBlur(sigma))
}

/** Draws what lies behind a layer, inside its shape, through `backdrop`. */
export function applyClippedBackdrop(
  r: SkiaRenderer,
  canvas: Canvas,
  node: SceneNode,
  rect: Float32Array,
  hasRadius: boolean,
  backdrop: ImageFilter
): void {
  // Entry guard: reset shared paint to known state
  r.effectLayerPaint.setImageFilter(null)
  r.effectLayerPaint.setColorFilter(null)
  r.effectLayerPaint.setBlendMode(r.ck.BlendMode.SrcOver)

  canvas.save()
  r.clipNodeShape(canvas, node, rect, hasRadius)
  canvas.saveLayer(undefined, rect, backdrop, undefined, r.ck.TileMode.Clamp)
  canvas.restore()
  // Exit guard: ensure shared paint is in clean state
  r.effectLayerPaint.setImageFilter(null)
  r.effectLayerPaint.setColorFilter(null)
  r.effectLayerPaint.setBlendMode(r.ck.BlendMode.SrcOver)
  canvas.restore()
}

/** A layer drawn through filters: what they are and how far past the layer they reach. */
export interface LayerEffectFilter {
  filter: ImageFilter
  padding: number
  /** Releases what was made for this draw; cached filters stay. */
  release(): void
}

/**
 * The filter a layer is drawn through for its layer blur and texture, or null when it has
 * neither: a texture kept to the layer's pixels unless it is not clipped to its shape, and a
 * progressive blur blended along its ramp, as the canvas's SVG filters draw them.
 */
export function layerEffectFilter(r: SkiaRenderer, node: SceneNode): LayerEffectFilter | null {
  const blur = node.effects.find(
    (effect) =>
      effect.visible && (effect.type === 'LAYER_BLUR' || effect.type === 'FOREGROUND_BLUR')
  )
  const texture = node.effects.find(
    (effect) => effect.visible && effect.type === 'TEXTURE' && effect.radius > 0
  )
  if (!blur && !texture) return null
  const made: { delete(): void }[] = []
  let filter: ImageFilter | null = null
  let padding = 0
  if (texture) {
    const frequency = 1 / (2 * Math.max(0.25, texture.noiseSize ?? 0.5))
    const noise = r.ck.Shader.MakeFractalNoise(frequency, frequency, 1, 1, 0, 0)
    const map = r.ck.ImageFilter.MakeShader(noise)
    noise.delete()
    filter = r.ck.ImageFilter.MakeDisplacementMap(
      r.ck.ColorChannel.Red,
      r.ck.ColorChannel.Green,
      texture.radius * 2,
      map,
      null
    )
    made.push(map, filter)
    if (texture.clipToShape !== false) {
      filter = clippedToSource(r, filter)
      made.push(filter)
    }
    padding += texture.radius
  }
  if (blur) {
    const radius = Math.max(blur.radius, blur.startRadius ?? 0)
    let blurFilter = r.getCachedBlur(radius / 2)
    if (isProgressiveBlur(blur, node)) {
      const progressive = progressiveBlurFilter(r, blur, node.width, node.height)
      blurFilter = progressive.filter
      made.push({ delete: () => progressive.release() })
    }
    if (filter) {
      filter = r.ck.ImageFilter.MakeCompose(blurFilter, filter)
      made.push(filter)
    } else filter = blurFilter
    padding += radius * 2
  }
  if (!filter) return null
  return {
    filter,
    padding,
    release: () => {
      for (const object of made) object.delete()
    }
  }
}
