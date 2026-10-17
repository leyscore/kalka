import { describe, expect, test } from 'bun:test'

import { bytesToHex, hexToBytes } from '#fig/node-change/bytes'
import { figImageEntries, nameImagesForFigma } from '#fig/node-change/images'

import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { computeImageHash } from '@kalka/scene-graph'

const STILL = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])
/** A name from before images were named by their SHA-1. */
const STILL_NAME = 'aa'.repeat(20)
const FIGMA_NAME = computeImageHash(STILL)

function imagePaint(name: string) {
  return { type: 'IMAGE' as const, image: { hash: hexToBytes(name) } }
}

/** A layer whose fill is an image, and a text style override that paints the same image. */
function records(): NodeChange[] {
  return [
    {
      fillPaints: [imagePaint(STILL_NAME)],
      textData: { characters: '', styleOverrideTable: [{ fillPaints: [imagePaint(STILL_NAME)] }] }
    }
  ]
}

function paintName(paint: { image?: { hash?: Uint8Array | string } } | undefined): string {
  const hash = paint?.image?.hash
  return hash instanceof Uint8Array ? bytesToHex(hash) : String(hash)
}

describe('nameImagesForFigma', () => {
  test('points every paint at the SHA-1 of its image, however deep', () => {
    const changes = records()
    const names = nameImagesForFigma(changes, new Map([[STILL_NAME, STILL]]))
    const [layer] = changes

    expect(names).toEqual(new Map([[STILL_NAME, FIGMA_NAME]]))
    expect(paintName(layer.fillPaints?.[0])).toBe(FIGMA_NAME)
    expect(paintName(layer.textData?.styleOverrideTable?.[0]?.fillPaints?.[0])).toBe(FIGMA_NAME)
  })

  test('leaves references to images it does not have as they are', () => {
    const changes = records()
    expect(nameImagesForFigma(changes, new Map())).toEqual(new Map())
    expect(paintName(changes[0].fillPaints?.[0])).toBe(STILL_NAME)
  })
})

describe('figImageEntries', () => {
  test('names an image no record references by its SHA-1 too', () => {
    const images = new Map([[STILL_NAME, STILL]])
    expect(figImageEntries(images, new Map())).toEqual([
      { name: `images/${FIGMA_NAME}`, data: STILL }
    ])
  })

  test('writes each image once under its new name', () => {
    const other = 'bb'.repeat(20)
    const images = new Map([
      [STILL_NAME, STILL],
      [other, STILL]
    ])
    const names = new Map([
      [STILL_NAME, FIGMA_NAME],
      [other, FIGMA_NAME]
    ])

    expect(figImageEntries(images, names)).toEqual([{ name: `images/${FIGMA_NAME}`, data: STILL }])
  })
})
