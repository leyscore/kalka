import { describe, expect, test } from 'bun:test'

import { loadGoogleOpticalSizes } from '#core/text/web-font/google-axes'
import { fontsourceVariableURL } from '#core/text/web-fonts'

const metadata = {
  familyMetadataList: [
    { family: 'Bricolage Grotesque', axes: [{ tag: 'opsz', min: 12, max: 96 }, { tag: 'wght', min: 200, max: 800 }] },
    { family: 'Geist', axes: [{ tag: 'wght', min: 100, max: 900 }] },
    { family: 'Roboto Slab' }
  ]
}

describe('Google Fonts optical sizes', () => {
  test('families with an optical size axis get its range, others none', async () => {
    const ranges = await loadGoogleOpticalSizes(async () => new Response(JSON.stringify(metadata)))
    expect([...ranges]).toEqual([['Bricolage Grotesque', ['12', '96']]])
  })

  test('metadata that cannot be read gives the families known to have the axis', async () => {
    const unreadable = [
      async () => new Response('', { status: 500 }),
      async () => new Response('{"fonts":[]}'),
      // A browser cannot read Google's metadata across origins.
      async () => {
        throw new TypeError('Failed to fetch')
      }
    ]
    for (const fetcher of unreadable) {
      const ranges = await loadGoogleOpticalSizes(fetcher)
      expect(ranges.get('Bricolage Grotesque')).toEqual(['12', '96'])
    }
  })
})

describe('Fontsource variable files', () => {
  test('a static file of a family maps to its variable file of the same subset and style', () => {
    expect(
      fontsourceVariableURL(
        'https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@5.3.0/latin-ext-600-normal.ttf'
      )
    ).toBe(
      'https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque:vf@latest/latin-ext-standard-normal.woff2'
    )
    expect(fontsourceVariableURL('https://fonts.gstatic.com/s/inter/v1/abc.ttf')).toBeNull()
  })
})
