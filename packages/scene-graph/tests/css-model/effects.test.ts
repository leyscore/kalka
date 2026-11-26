import { describe, expect, test } from 'bun:test'

import { SceneGraph, imageFilterMatrix, type Effect } from '@kalka/scene-graph'
import { effectsToCSS, writeLayerStyle } from '@kalka/scene-graph/css-model'

const base = {
  color: { r: 0, g: 0, b: 0, a: 1 },
  offset: { x: 0, y: 0 },
  radius: 0,
  spread: 0,
  visible: true
}
const size = { width: 200, height: 100 }

/** The SVG a filter `url()` draws with. */
function filterSVG(css: string | undefined, at = 0): string {
  const urls = [...(css ?? '').matchAll(/url\("data:image\/svg\+xml,([^"#]*)#f"\)/g)]
  return decodeURIComponent(urls[at]?.[1] ?? '')
}

describe('effects CSS has no function for', () => {
  test('a uniform blur stays a blur(); a progressive one blends two blurs along its ramp', () => {
    expect(effectsToCSS([{ ...base, type: 'LAYER_BLUR', radius: 8 }], size).filter).toBe(
      'blur(8px)'
    )
    const progressive: Effect = {
      ...base,
      type: 'LAYER_BLUR',
      radius: 12,
      blurType: 'PROGRESSIVE',
      startRadius: 2,
      startOffset: { x: 0, y: 0.5 },
      endOffset: { x: 1, y: 0.5 }
    }
    const svg = filterSVG(effectsToCSS([progressive], size).filter)
    expect(svg).toContain("stdDeviation='2'")
    expect(svg).toContain("stdDeviation='12'")
    // The ramp runs across the layer's width, from the start offset to the end offset.
    expect(decodeURIComponent(svg)).toContain("x1='0' y1='50' x2='200' y2='50'")
  })

  test('a progressive background blur goes to backdrop-filter', () => {
    const style = effectsToCSS(
      [{ ...base, type: 'BACKGROUND_BLUR', radius: 10, blurType: 'PROGRESSIVE' }],
      size
    )
    expect(style.filter).toBeUndefined()
    expect(filterSVG(style['backdrop-filter'])).toContain('feGaussianBlur')
  })

  test('noise draws grains of its colors over the layer, clipped to it', () => {
    const mono = filterSVG(
      effectsToCSS([{ ...base, type: 'NOISE', noiseType: 'MONOTONE', density: 0.5 }], size).filter
    )
    expect(mono).toContain('feTurbulence')
    expect(mono).toContain("flood-color='#000000'")
    expect(mono).toContain("in2='SourceAlpha' operator='in'")
    const duo = filterSVG(
      effectsToCSS(
        [
          {
            ...base,
            type: 'NOISE',
            noiseType: 'DUOTONE',
            secondaryColor: { r: 1, g: 0, b: 0, a: 1 }
          }
        ],
        size
      ).filter
    )
    expect(duo).toContain("flood-color='#FF0000'")
    expect(effectsToCSS([{ ...base, type: 'NOISE', density: 0 }], size).filter).toBeUndefined()
  })

  test('texture scatters the layer by its radius', () => {
    const svg = filterSVG(effectsToCSS([{ ...base, type: 'TEXTURE', radius: 6 }], size).filter)
    expect(svg).toContain("feDisplacementMap in='SourceGraphic'")
    expect(svg).toContain("scale='12'")
  })

  test('glass refracts and frosts what lies behind and lights its rim', () => {
    const style = effectsToCSS(
      [
        {
          ...base,
          type: 'GLASS',
          radius: 4,
          refraction: 0.5,
          depth: 10,
          lightAngle: 90,
          lightIntensity: 1
        }
      ],
      size
    )
    expect(filterSVG(style['backdrop-filter'])).toContain('feDisplacementMap')
    expect(style['backdrop-filter']).toEndWith('blur(4px)')
    expect(style['box-shadow']).toContain('inset')
  })

  test('effects keep their order in one filter list', () => {
    const style = effectsToCSS(
      [
        { ...base, type: 'NOISE' },
        { ...base, type: 'LAYER_BLUR', radius: 3 }
      ],
      size
    )
    expect(style.filter).toMatch(/^url\(.*\) blur\(3px\)$/)
  })
})

describe('image adjustments', () => {
  test('no adjustment is the identity matrix', () => {
    expect(imageFilterMatrix({})).toEqual([
      1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0
    ])
  })

  test('each adjustment moves the image its way', () => {
    // Exposure scales every channel; temperature warms red against blue; saturation -1 is grey.
    expect(imageFilterMatrix({ exposure: 1 })[0]).toBeCloseTo(2)
    const warm = imageFilterMatrix({ temperature: 1 })
    expect(warm[0]).toBeGreaterThan(1)
    expect(warm[12]).toBeLessThan(1)
    const grey = imageFilterMatrix({ saturation: -1 })
    expect(grey.slice(0, 3)).toEqual(grey.slice(5, 8))
  })

  test('an image layer is filtered by its adjustments before its other effects', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const node = graph.createNode('RECTANGLE', page.id, {
      width: 100,
      height: 100,
      fills: [
        {
          type: 'IMAGE',
          imageHash: 'ab'.repeat(20),
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          filters: { contrast: 0.5 }
        }
      ],
      effects: [{ ...base, type: 'LAYER_BLUR', radius: 2 }]
    })
    const style = writeLayerStyle(node, { parent: page, css: (_field, value) => value })
    expect(filterSVG(style.filter)).toContain('feColorMatrix')
    expect(style.filter).toEndWith('blur(2px)')
  })
})
