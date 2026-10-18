import { expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { resolveParagraphFontFamilies } from '#core/canvas/text/font-families'
import { textNeededFallbackScripts } from '#core/text/coverage'
import { FontManager, fontManager } from '#core/text/fonts'

function text(characters: string, fontFamily: string) {
  const graph = new SceneGraph()
  return graph.createNode('TEXT', graph.getPages()[0].id, { text: characters, fontFamily })
}

test('text needs the symbol fallback only for symbols its font lacks', async () => {
  const family = `SymbolCoverage_${Date.now()}`
  const inter = await fontManager.fetchBundledFont('/Inter-Regular.ttf')
  if (!inter) throw new Error('No bundled Inter')
  fontManager.markLoaded(family, 'Regular', inter)
  // Inter draws ◆ and ✓ itself, and has no ✕ or ⚙.
  expect(textNeededFallbackScripts(text('◆ Done ✓', family))).toEqual([])
  expect(textNeededFallbackScripts(text('✕ Close', family))).toEqual(['symbols'])
})

test('symbols fall back to Noto Sans Symbols 2, listed after the fonts text names', async () => {
  const fonts = new FontManager()
  fonts.setOnlineFontProviders({ google: false, fontsource: false, bunny: false })
  fonts.setHostFontLoader((family) =>
    Promise.resolve(family === 'Noto Sans Symbols 2' ? new Uint8Array(64).buffer : null)
  )
  const families = await fonts.ensureFallbackPack(['symbols'], '✕')
  expect(families.symbols).toEqual(['Noto Sans Symbols 2'])
  expect(fonts.fallbackFamilies()).toEqual(['Noto Sans Symbols 2'])
  expect(resolveParagraphFontFamilies('Plex', 'Regular', [], [], fonts.fallbackFamilies())).toEqual(
    ['Plex', 'Inter', 'Noto Sans Symbols 2']
  )
})
