import { describe, expect, test } from 'bun:test'

import { loadGoogleOpticalSizes } from '#core/text/web-font/google-axes'

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

  test('metadata that cannot be read or has the wrong shape gives no ranges', async () => {
    expect((await loadGoogleOpticalSizes(async () => new Response('', { status: 500 }))).size).toBe(0)
    expect((await loadGoogleOpticalSizes(async () => new Response('{"fonts":[]}'))).size).toBe(0)
  })
})
