import { expect, test } from 'bun:test'

import { invalidateInheritedTextData } from '#fig/instance-overrides/text-provenance'

import type { NodeChange } from '@kalka/kiwi/fig/codec'

for (const patch of [
  { fontSize: 20 },
  { fontName: { family: 'Other', style: 'Regular' } },
  { styleIdForText: { guid: { sessionID: 1, localID: 2 } } },
  { textData: { characters: 'Same', characterStyleIDs: [1] } }
]) {
  test(`invalidates inherited glyphs for ${Object.keys(patch)[0]} changes`, () => {
    const source: NodeChange = {
      textData: { characters: 'Same' },
      fontSize: 14,
      derivedTextData: { layoutSize: { x: 40, y: 20 } }
    }
    invalidateInheritedTextData(source, patch)
    expect(source.derivedTextData).toBeUndefined()
  })
}
test('preserves caches for identical shaping, paint-only patches and explicit replacement data', () => {
  const source: NodeChange = {
    textData: { characters: 'Same' },
    fontSize: 14,
    derivedTextData: { layoutSize: { x: 40, y: 20 } }
  }
  for (const patch of [
    { fontSize: 14 },
    { fillPaints: [] },
    { textData: { characters: 'Other' }, derivedTextData: { layoutSize: { x: 80, y: 20 } } }
  ]) {
    invalidateInheritedTextData(source, patch)
    expect(source.derivedTextData?.layoutSize).toEqual({ x: 40, y: 20 })
  }
})

test('forgets the layout older files keep in textData when the font changes', () => {
  const source: NodeChange = {
    textData: {
      characters: 'Same',
      layoutSize: { x: 40, y: 18 },
      baselines: [
        {
          firstCharacter: 0,
          endCharacter: 4,
          position: { x: 0, y: 13 },
          width: 39,
          lineHeight: 18,
          lineAscent: 11
        }
      ]
    },
    fontSize: 14
  }
  invalidateInheritedTextData(source, { fontName: { family: 'Other', style: 'Regular' } })
  expect(source.textData).toEqual({ characters: 'Same' })
})
