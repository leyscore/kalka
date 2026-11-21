import { describe, expect, test } from 'bun:test'

import {
  downloadCatalogueFont,
  downloadInstallableFont,
  findCatalogueFont,
  searchFontCatalogue
} from '#core/text/project-fonts/catalogue'
import { fakeFontCatalogue, type FakeCatalogueFamily } from '#core-tests/helpers/font-catalogue'

const FAMILIES: FakeCatalogueFamily[] = [
  { id: 'inter', family: 'Inter' },
  { id: 'inter-tight', family: 'Inter Tight', variable: true, styles: ['normal', 'italic'] },
  { id: 'tinos', family: 'Tinos', license: 'Apache-2.0' },
  { id: 'closed', family: 'Interstate', license: 'proprietary' }
]

describe('font catalogue search', () => {
  test('lists the closest names first and only open-licence families', async () => {
    const { fetch } = fakeFontCatalogue(FAMILIES)
    const found = await searchFontCatalogue('inter', { fetch })
    expect(found.map((font) => font.family)).toEqual(['Inter', 'Inter Tight'])
  })

  test('reads the catalogue once for every search', async () => {
    const { fetch, requests } = fakeFontCatalogue(FAMILIES)
    await searchFontCatalogue('in', { fetch })
    await searchFontCatalogue('ti', { fetch })
    expect(requests.filter((url) => url.endsWith('/v1/fonts'))).toHaveLength(1)
  })

  test('finds a family by its name whatever its case', async () => {
    const { fetch } = fakeFontCatalogue(FAMILIES)
    expect((await findCatalogueFont('inter tight', { fetch }))?.id).toBe('inter-tight')
    expect(await findCatalogueFont('Interstate', { fetch })).toBeNull()
  })
})

describe('font catalogue download', () => {
  test('a variable family comes as one file per script and style, with its licence', async () => {
    const { fetch } = fakeFontCatalogue([
      {
        id: 'inter-tight',
        family: 'Inter Tight',
        variable: true,
        styles: ['normal', 'italic'],
        subsets: { latin: 'U+0000-00FF', cyrillic: 'U+0400-045F', devanagari: 'U+0900-097F' }
      }
    ])
    const font = await downloadCatalogueFont('inter-tight', { fetch })
    expect(font).toMatchObject({ family: 'Inter Tight', license: 'OFL-1.1', source: 'fontsource' })
    expect(font.licenseText).toContain('SIL OPEN FONT LICENSE')
    expect(font.faces.map(({ file, weight, unicodeRange }) => ({ file, weight, unicodeRange })))
      .toEqual([
        { file: 'latin-wght-normal.woff2', weight: '100 900', unicodeRange: 'U+0000-00FF' },
        { file: 'cyrillic-wght-normal.woff2', weight: '100 900', unicodeRange: 'U+0400-045F' },
        { file: 'latin-wght-italic.woff2', weight: '100 900', unicodeRange: 'U+0000-00FF' },
        { file: 'cyrillic-wght-italic.woff2', weight: '100 900', unicodeRange: 'U+0400-045F' }
      ])
  })

  test('a script the text uses comes too', async () => {
    const { fetch } = fakeFontCatalogue([
      { id: 'mukta', family: 'Mukta', subsets: { latin: 'U+0000-00FF', devanagari: 'U+0900-097F' } }
    ])
    const font = await downloadCatalogueFont('mukta', { fetch, characters: 'नमस्ते' })
    expect(font.faces.map((face) => face.file)).toContain('devanagari-400-normal.woff2')
  })

  test('a static family comes as a file per weight', async () => {
    const { fetch } = fakeFontCatalogue([{ id: 'inter', family: 'Inter', weights: [400, 700] }])
    const font = await downloadCatalogueFont('inter', { fetch })
    expect(font.faces.map((face) => [face.file, face.weight])).toEqual([
      ['latin-400-normal.woff2', '400'],
      ['latin-700-normal.woff2', '700']
    ])
  })

  test('a family whose licence file cannot be read keeps a note naming its licence', async () => {
    const { fetch } = fakeFontCatalogue([
      { id: 'tinos', family: 'Tinos', license: 'Apache-2.0', licenseFile: false }
    ])
    const font = await downloadCatalogueFont('tinos', { fetch })
    expect(font.license).toBe('Apache-2.0')
    expect(font.licenseText).toContain('https://spdx.org/licenses/Apache-2.0.html')
  })

  test('a family under a licence that is not open is refused', async () => {
    const { fetch, requests } = fakeFontCatalogue([
      { id: 'closed', family: 'Interstate', license: 'proprietary' }
    ])
    await expect(downloadCatalogueFont('closed', { fetch })).rejects.toThrow('open licence')
    expect(requests.some((url) => url.includes('cdn.jsdelivr.net'))).toBe(false)
  })

  test('installing on a computer takes TrueType files of each weight and style', async () => {
    const { fetch } = fakeFontCatalogue([
      { id: 'inter', family: 'Inter', weights: [400, 700], styles: ['normal', 'italic'] }
    ])
    const files = await downloadInstallableFont('inter', { fetch })
    expect(files.map((file) => file.name)).toEqual([
      'Inter-400.ttf',
      'Inter-400Italic.ttf',
      'Inter-700.ttf',
      'Inter-700Italic.ttf'
    ])
  })
})
