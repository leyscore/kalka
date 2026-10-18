import { describe, expect, test } from 'bun:test'
import { parse } from 'opentype.js'

import { SceneGraph } from '@kalka/scene-graph'

import { browserFaceFor, FontManager } from '#core/text/fonts'
import {
  cssFontFamily,
  fontFamilyKey,
  INTER_3_FAMILY,
  inter3FontURL,
  withFontFamilyKeys
} from '#core/text/inter'
import { collectGraphFontKeys } from '#core/text/requirements'
import { exportWebFontFaceAssets } from '#core/text/web-font/assets'

/** Inter 3.x draws on a 2816-unit em, Inter 4 on 2048: the version a file holds. */
function unitsPerEm(data: ArrayBuffer): number {
  return parse(data.slice(0)).unitsPerEm
}

function textGraph(interVersion: SceneGraph['interVersion']) {
  const graph = new SceneGraph()
  graph.interVersion = interVersion
  const page = graph.getPages()[0]
  graph.createNode('TEXT', page.id, { text: 'Working', fontFamily: 'Inter', fontWeight: 600 })
  graph.createNode('TEXT', page.id, { text: 'with', fontFamily: 'Roboto' })
  return { graph, page }
}

describe('Inter version', () => {
  test("loads Inter as Figma's Inter 3.19 only in a document that keeps it", () => {
    expect(fontFamilyKey('Inter', '3.19')).toBe(INTER_3_FAMILY)
    expect(fontFamilyKey('Inter', '4')).toBe('Inter')
    expect(fontFamilyKey('Roboto', '3.19')).toBe('Roboto')
    expect(cssFontFamily(INTER_3_FAMILY)).toBe('Inter')
    expect(cssFontFamily('Roboto')).toBe('Roboto')
  })

  test("collects a document's faces under the family its Inter loads as", () => {
    const figma = textGraph('3.19')
    expect(collectGraphFontKeys(figma.graph, [figma.page.id])).toEqual([
      [INTER_3_FAMILY, 'SemiBold'],
      ['Roboto', 'Regular']
    ])
    const kalka = textGraph('4')
    expect(collectGraphFontKeys(kalka.graph, [kalka.page.id])).toEqual([
      ['Inter', 'SemiBold'],
      ['Roboto', 'Regular']
    ])
  })

  test("names runs' Inter as the document loads it", () => {
    const node = {
      fontFamily: 'Roboto',
      styleRuns: [{ start: 0, length: 2, style: { fontFamily: 'Inter' } }]
    }
    expect(withFontFamilyKeys(node, '4')).toBe(node)
    expect(withFontFamilyKeys(node, '3.19').styleRuns[0].style.fontFamily).toBe(INTER_3_FAMILY)
  })

  test('has a bundled Inter 3.19 file for every weight and slant', async () => {
    const fonts = new FontManager()
    const styles = ['Thin', 'Light', 'Regular', 'SemiBold', 'Black', 'Italic', 'Bold Italic']
    for (const style of styles) {
      const data = await fonts.fetchBundledFont(inter3FontURL(style))
      expect(data && unitsPerEm(data)).toBe(2816)
    }
    expect(inter3FontURL('Regular Italic')).toBe('/fonts/inter-3.19/Inter-Italic.woff')
    expect(inter3FontURL('ExtraBold Italic')).toBe('/fonts/inter-3.19/Inter-ExtraBoldItalic.woff')
  })

  test("loads Figma's Inter from Kalka's files, never an installed or downloaded Inter", async () => {
    const fonts = new FontManager()
    fonts.setOnlineFontProviders({ google: false, fontsource: false, bunny: false })
    const asked: string[] = []
    fonts.setHostFontLoader((family) => {
      asked.push(family)
      return Promise.resolve(new Uint8Array(64).buffer)
    })

    const data = await fonts.loadFont(INTER_3_FAMILY, 'Medium')

    expect(asked).toEqual([])
    expect(data && unitsPerEm(data)).toBe(2816)
    expect(fonts.loadedFontSource(INTER_3_FAMILY, 'Medium')).toBe('bundled')
    expect(await fonts.loadRemoteFont(INTER_3_FAMILY, 'Medium')).toBeNull()
  })

  test("gives a document's pages only its own Inter, named Inter", () => {
    const face = { weight: '400', style: 'normal' as const, data: new ArrayBuffer(8) }
    const inter4 = { ...face, family: 'Inter' }
    const inter3 = { ...face, family: INTER_3_FAMILY }
    const roboto = { ...face, family: 'Roboto' }

    expect(browserFaceFor(inter3, '3.19')).toEqual({ ...inter3, family: 'Inter' })
    expect(browserFaceFor(inter4, '3.19')).toBeNull()
    expect(browserFaceFor(inter4, '4')).toBe(inter4)
    expect(browserFaceFor(inter3, '4')).toBeNull()
    expect(browserFaceFor(roboto, '3.19')).toBe(roboto)
  })

  test("exports Inter for a document from Figma as Kalka's Inter 3.19 files", async () => {
    const { assets } = await exportWebFontFaceAssets({
      fonts: [{ family: 'Inter', weight: 700, style: 'italic' }],
      assetBasePath: 'fonts',
      interVersion: '3.19',
      fetcher: () => Promise.reject(new Error('Inter 3.19 is not downloaded'))
    })

    expect(assets).toHaveLength(1)
    const [asset] = assets
    expect(asset).toMatchObject({
      family: 'Inter',
      weight: 700,
      style: 'italic',
      format: 'woff',
      path: 'fonts/inter-700-italic.woff'
    })
    expect(unitsPerEm(asset.content.slice().buffer)).toBe(2816)
  })
})
