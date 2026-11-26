import { describe, expect, test } from 'bun:test'

import {
  convertEffects,
  convertFills,
  fillToKiwiPaint,
  kiwiEffectKindFields,
  kiwiEffectType
} from '#fig/node-change/paint'

import type { Effect as KiwiEffect, Paint } from '@kalka/kiwi/fig/codec'

const black = { r: 0, g: 0, b: 0, a: 1 }

describe('.fig effects', () => {
  test('noise, grain (texture), glass and progressive blur import with their settings', () => {
    const effects: KiwiEffect[] = [
      {
        type: 'NOISE',
        visible: true,
        color: black,
        secondaryColor: { r: 1, g: 1, b: 1, a: 1 },
        noiseType: 'DUOTONE',
        noiseSize: { x: 0.5, y: 0.5 },
        density: 0.4
      },
      { type: 'GRAIN', visible: true, radius: 8, noiseSize: { x: 2, y: 2 }, clipToShape: false },
      {
        type: 'GLASS',
        visible: true,
        radius: 8,
        refractionIntensity: 0.3,
        refractionRadius: 2,
        specularAngle: 45,
        specularIntensity: 0.5,
        chromaticAberration: 0.2
      },
      {
        type: 'FOREGROUND_BLUR',
        visible: true,
        radius: 12,
        blurOpType: 'PROGRESSIVE',
        startRadius: 2,
        startOffset: { x: 0, y: 0.5 },
        endOffset: { x: 1, y: 0.5 }
      },
      { type: 'REPEAT', visible: true }
    ]
    const [noise, texture, glass, blur, ...rest] = convertEffects(effects)
    expect(rest).toEqual([])
    expect(noise).toMatchObject({
      type: 'NOISE',
      noiseType: 'DUOTONE',
      noiseSize: 0.5,
      density: 0.4,
      secondaryColor: { r: 1, g: 1, b: 1, a: 1 }
    })
    expect(texture).toMatchObject({
      type: 'TEXTURE',
      radius: 8,
      noiseSize: 2,
      clipToShape: false
    })
    expect(glass).toMatchObject({
      type: 'GLASS',
      radius: 8,
      refraction: 0.3,
      depth: 2,
      lightAngle: 45,
      lightIntensity: 0.5,
      dispersion: 0.2
    })
    expect(blur).toMatchObject({
      type: 'FOREGROUND_BLUR',
      blurType: 'PROGRESSIVE',
      startRadius: 2,
      startOffset: { x: 0, y: 0.5 },
      endOffset: { x: 1, y: 0.5 }
    })
  })

  test('each effect is written back with the names .fig files use', () => {
    const [noise, texture, glass, blur] = convertEffects([
      { type: 'NOISE', noiseType: 'MULTITONE', opacity: 0.7, noiseSize: { x: 1, y: 1 } },
      { type: 'GRAIN', radius: 4, noiseSize: { x: 1, y: 1 } },
      { type: 'GLASS', radius: 6, refractionIntensity: 0.8, specularAngle: -45 },
      { type: 'BACKGROUND_BLUR', radius: 10, blurOpType: 'PROGRESSIVE', startRadius: 0 }
    ])
    expect(kiwiEffectType(texture.type)).toBe('GRAIN')
    expect(kiwiEffectKindFields(noise)).toMatchObject({
      noiseType: 'MULTITONE',
      opacity: 0.7,
      noiseSize: { x: 1, y: 1 }
    })
    expect(kiwiEffectKindFields(texture)).toMatchObject({ clipToShape: true })
    expect(kiwiEffectKindFields(glass)).toMatchObject({
      refractionIntensity: 0.8,
      specularAngle: -45
    })
    expect(kiwiEffectKindFields(blur)).toMatchObject({
      blurOpType: 'PROGRESSIVE',
      startRadius: 0
    })
    expect(kiwiEffectType('LAYER_BLUR')).toBe('FOREGROUND_BLUR')
  })
})

describe('.fig image adjustments', () => {
  const image = (extra: Partial<Paint>): Paint => ({
    type: 'IMAGE',
    visible: true,
    opacity: 1,
    image: { hash: 'aa'.repeat(20) },
    imageScaleMode: 'FILL',
    ...extra
  })

  test('paintFilter imports as the panel names them; vibrance is saturation', () => {
    const [fill] = convertFills([
      image({
        paintFilter: {
          exposure: 0.25,
          contrast: 0.3,
          vibrance: -0.4,
          temperature: 0.5,
          tint: 1,
          highlights: -0.6,
          shadows: 0.7,
          vignette: 0.3
        }
      })
    ])
    expect(fill.filters).toEqual({
      exposure: 0.25,
      contrast: 0.3,
      saturation: -0.4,
      temperature: 0.5,
      tint: 1,
      highlights: -0.6,
      shadows: 0.7
    })
  })

  test('the older filterColorAdjust imports; neutral adjustments leave none', () => {
    expect(convertFills([image({ filterColorAdjust: { exposure: 0.8 } })])[0].filters).toEqual({
      exposure: 0.8
    })
    expect(convertFills([image({ paintFilter: { exposure: 0 } })])[0].filters).toBeUndefined()
  })

  test('adjustments are written back as paintFilter', () => {
    const [fill] = convertFills([image({ paintFilter: { vibrance: 0.5, tint: -0.2 } })])
    expect(fillToKiwiPaint(fill).paintFilter).toMatchObject({ vibrance: 0.5, tint: -0.2 })
    expect(fillToKiwiPaint({ ...fill, filters: undefined }).paintFilter).toBeUndefined()
  })
})
