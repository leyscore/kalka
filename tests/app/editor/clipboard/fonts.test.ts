import { describe, expect, test } from 'bun:test'

import { fromUint8Array } from 'js-base64'

import { pastedFontFaces } from '@/app/editor/clipboard/fonts'

const bytes = new Uint8Array([119, 79, 70, 50, 0, 1])
const data = `data:font/woff2;base64,${fromUint8Array(bytes)}`

describe('pastedFontFaces', () => {
  test('reads the family, weights and file of a face carried as data', () => {
    const [face] = pastedFontFaces(
      `<style>@font-face { font-family: "Brand Sans"; src: url("${data}") format("woff2"); font-weight: 300 800; }</style><p>Hi</p>`
    )
    expect(face?.family).toBe('Brand Sans')
    expect(face?.weights).toEqual([300, 800])
    expect(face?.italic).toBe(false)
    expect(new Uint8Array(face?.data ?? new ArrayBuffer(0))).toEqual(bytes)
  })

  test('tells italic faces apart', () => {
    const [face] = pastedFontFaces(
      `<style>@font-face { font-family: Serif; src: url(${data}); font-style: italic; font-weight: bold; }</style>`
    )
    expect(face?.italic).toBe(true)
    expect(face?.weights).toEqual([700, 700])
  })

  test('leaves out faces that only link their file', () => {
    expect(
      pastedFontFaces(
        '<style>@font-face { font-family: Linked; src: url("https://example.com/a.woff2"); }</style>'
      )
    ).toEqual([])
  })
})

describe('pastedFontFaces with script subsets', () => {
  test('keeps the Latin file of a family split by script', () => {
    const faces = pastedFontFaces(
      `<style>@font-face { font-family: Split; src: url(${data}); unicode-range: U+0400-045F; }` +
        `@font-face { font-family: Split; src: url(${data}); unicode-range: U+0000-00FF, U+0131; }</style>`
    )
    expect(faces).toHaveLength(1)
  })
})
