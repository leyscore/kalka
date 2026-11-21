import { describe, expect, test } from 'bun:test'

import { fontsFromFiles, mergeProjectFont } from '#core/text/project-fonts/files'
import { fakeFontBytes } from '#core-tests/helpers/font-catalogue'
import { sampleProjectFont } from '#core-tests/helpers/project-fonts'

async function fixture(name: string) {
  return { name, data: new Uint8Array(await Bun.file(`tests/fixtures/fonts/${name}`).arrayBuffer()) }
}

describe('fonts someone adds', () => {
  test('a TrueType file names its own family and weights', async () => {
    const { fonts, rejected } = fontsFromFiles([await fixture('InterVariable-Latin.ttf')])
    expect(rejected).toEqual([])
    expect(fonts.map((font) => ({ family: font.family, source: font.source }))).toEqual([
      { family: 'Inter Variable', source: 'file' }
    ])
    expect(fonts[0].faces[0]).toMatchObject({ weight: '100 900', style: 'normal' })
    // Nobody vouched for the licence, so the person has to check it.
    expect(fonts[0].license).toBeNull()
  })

  test('a WOFF2 file is named after its file name', () => {
    const { fonts } = fontsFromFiles([
      { name: 'BrandSans-SemiBoldItalic.woff2', data: fakeFontBytes('x') }
    ])
    expect(fonts[0].family).toBe('Brand Sans')
    expect(fonts[0].faces[0]).toMatchObject({
      file: 'BrandSans-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic'
    })
  })

  test('a licence file added with them is kept and read', () => {
    const { fonts } = fontsFromFiles([
      { name: 'Brand-Regular.woff2', data: fakeFontBytes('x') },
      { name: 'OFL.txt', data: new TextEncoder().encode('SIL OPEN FONT LICENSE Version 1.1') }
    ])
    expect(fonts[0]).toMatchObject({ license: 'OFL-1.1', licenseText: 'SIL OPEN FONT LICENSE Version 1.1' })
  })

  test('a file that is no font is refused by name', () => {
    const { fonts, rejected } = fontsFromFiles([
      { name: 'notes.pdf', data: new TextEncoder().encode('%PDF-1.7') }
    ])
    expect(fonts).toEqual([])
    expect(rejected).toEqual(['notes.pdf'])
  })

  test('files added to a family the document keeps join it', () => {
    const added = fontsFromFiles([{ name: 'Brand-Bold.woff2', data: fakeFontBytes('bold') }]).fonts[0]
    const kept = fontsFromFiles([{ name: 'Brand-Regular.woff2', data: fakeFontBytes('x') }]).fonts[0]
    expect(mergeProjectFont(kept, added).faces.map((face) => face.file)).toEqual([
      'Brand-Regular.woff2',
      'Brand-Bold.woff2'
    ])
    // A downloaded family is replaced whole by a file of the same name rather than mixed.
    expect(mergeProjectFont(sampleProjectFont('Brand'), added)).toBe(added)
  })
})
