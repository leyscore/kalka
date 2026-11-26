import { beforeAll, describe, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { SceneGraph, type Effect, type Fill } from '@kalka/scene-graph'

import { SkiaRenderer } from '#core/canvas/renderer'
import { getCanvasKit } from '#core/canvaskit'
import { renderNodesToImage } from '#core/io/formats/raster/render'

let ck: Awaited<ReturnType<typeof getCanvasKit>>

beforeAll(async () => {
  ck = await getCanvasKit()
})

const solid = (value: number): Fill => ({
  type: 'SOLID',
  color: { r: value, g: value, b: value, a: 1 },
  opacity: 1,
  visible: true
})

const effectBase = {
  color: { r: 0, g: 0, b: 0, a: 1 },
  offset: { x: 0, y: 0 },
  radius: 0,
  spread: 0,
  visible: true
}

/** The layer exported at 1x, as RGBA bytes with its width. */
function exportPixels(graph: SceneGraph, nodeId: string): { pixels: Uint8Array; width: number } {
  const surface = expectDefined(ck.MakeSurface(1, 1), 'surface')
  const renderer = new SkiaRenderer(ck, surface)
  try {
    const png = expectDefined(
      renderNodesToImage(ck, renderer, graph, graph.getPages()[0].id, [nodeId], {
        scale: 1,
        format: 'PNG'
      }),
      'png'
    )
    const image = expectDefined(ck.MakeImageFromEncoded(png), 'image')
    const width = image.width()
    const pixels = expectDefined(
      image.readPixels(0, 0, {
        alphaType: ck.AlphaType.Unpremul,
        colorType: ck.ColorType.RGBA_8888,
        colorSpace: ck.ColorSpace.SRGB,
        width,
        height: image.height()
      }),
      'pixels'
    )
    image.delete()
    return { pixels: new Uint8Array(pixels), width }
  } finally {
    surface.delete()
  }
}

function pixel(image: { pixels: Uint8Array; width: number }, x: number, y: number) {
  const at = (y * image.width + x) * 4
  return {
    r: image.pixels[at] ?? 0,
    g: image.pixels[at + 1] ?? 0,
    b: image.pixels[at + 2] ?? 0,
    a: image.pixels[at + 3] ?? 0
  }
}

/** A white frame with black vertical stripes 10 pixels wide. */
function stripes(graph: SceneGraph, parentId: string): void {
  for (let x = 0; x < 100; x += 20)
    graph.createNode('RECTANGLE', parentId, { x, y: 0, width: 10, height: 100, fills: [solid(0)] })
}

describe('raster export of the newer effects', () => {
  test('a progressive layer blur grows from its start point to its end point', () => {
    const graph = new SceneGraph()
    const progressive: Effect = {
      ...effectBase,
      type: 'LAYER_BLUR',
      radius: 24,
      blurType: 'PROGRESSIVE',
      startRadius: 0,
      startOffset: { x: 0.5, y: 0 },
      endOffset: { x: 0.5, y: 1 }
    }
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
      width: 100,
      height: 100,
      fills: [solid(1)],
      effects: [progressive]
    })
    stripes(graph, frame.id)
    const image = exportPixels(graph, frame.id)
    // Within a stripe, away from the frame's edges: black near the sharp start, grey near the
    // blurred end.
    expect(pixel(image, 45, 4).r).toBeLessThan(40)
    expect(pixel(image, 45, 50).r).toBeGreaterThan(pixel(image, 45, 4).r)
    expect(pixel(image, 45, 92).r).toBeGreaterThan(60)
  })

  test('glass dispersion splits colours at its edges', () => {
    const graph = new SceneGraph()
    const board = graph.createNode('FRAME', graph.getPages()[0].id, {
      width: 100,
      height: 100,
      fills: [solid(1)]
    })
    stripes(graph, board.id)
    const glass: Effect = {
      ...effectBase,
      type: 'GLASS',
      radius: 0,
      refraction: 1,
      depth: 20,
      dispersion: 1,
      lightIntensity: 0,
      lightAngle: -45
    }
    graph.createNode('FRAME', board.id, { width: 100, height: 100, fills: [], effects: [glass] })
    const image = exportPixels(graph, board.id)
    let fringe = 0
    for (let y = 0; y < 100; y += 2) {
      for (let x = 0; x < 100; x++) {
        const { r, b } = pixel(image, x, y)
        fringe = Math.max(fringe, Math.abs(r - b))
      }
    }
    expect(fringe).toBeGreaterThan(60)
  })

  test('a texture clipped to its shape stays inside the layer', () => {
    const textured = (clipToShape: boolean) => {
      const graph = new SceneGraph()
      const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
        width: 100,
        height: 100,
        fills: []
      })
      const texture: Effect = {
        ...effectBase,
        type: 'TEXTURE',
        radius: 12,
        noiseSize: 1,
        clipToShape
      }
      graph.createNode('RECTANGLE', frame.id, {
        x: 30,
        y: 30,
        width: 40,
        height: 40,
        fills: [solid(0)],
        effects: [texture]
      })
      const image = exportPixels(graph, frame.id)
      let outside = 0
      for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
          const inside = x >= 30 && x < 70 && y >= 30 && y < 70
          if (!inside && pixel(image, x, y).a > 0) outside++
        }
      }
      return outside
    }
    expect(textured(true)).toBe(0)
    expect(textured(false)).toBeGreaterThan(0)
  })

  test('a glass lights its rim as the canvas does', () => {
    const lit = (lightIntensity: number) => {
      const graph = new SceneGraph()
      const board = graph.createNode('FRAME', graph.getPages()[0].id, {
        width: 100,
        height: 100,
        fills: [solid(0)]
      })
      const glass: Effect = {
        ...effectBase,
        type: 'GLASS',
        refraction: 0,
        lightIntensity,
        lightAngle: -45
      }
      graph.createNode('FRAME', board.id, {
        x: 20,
        y: 20,
        width: 60,
        height: 60,
        fills: [],
        effects: [glass]
      })
      return exportPixels(graph, board.id)
    }
    const dark = lit(0)
    const bright = lit(1)
    // As the canvas's `box-shadow` insets: at -45° the bright rim runs along the bottom and
    // right edges, a fainter one along the top and left.
    expect(pixel(dark, 50, 79).r).toBe(0)
    expect(pixel(bright, 50, 79).r).toBeGreaterThan(120)
    expect(pixel(bright, 79, 50).r).toBeGreaterThan(120)
    expect(pixel(bright, 50, 20).r).toBeGreaterThan(20)
    expect(pixel(bright, 50, 20).r).toBeLessThan(pixel(bright, 50, 79).r)
    expect(pixel(bright, 50, 50).r).toBe(0)
  })
})
