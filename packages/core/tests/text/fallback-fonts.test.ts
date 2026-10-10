import { expect, test } from 'bun:test'

import { FontManager } from '#core/text/fonts'

test('reads each installed CJK fallback face once however many texts need it', async () => {
  const fonts = new FontManager()
  fonts.setFallbackUserAgent('Macintosh')
  fonts.setOnlineFontProviders({ google: false, fontsource: false, bunny: false })
  const reads: string[] = []
  fonts.setHostFontLoader((family) => {
    reads.push(family)
    return Promise.resolve(family === 'Hiragino Sans' ? new Uint8Array(64).buffer : null)
  })

  for (const characters of ['比較', '機能', 'よくある質問']) {
    const families = await fonts.ensureFallbackPack(['cjk-jp'], characters)
    expect(families['cjk-jp']).toContain('Hiragino Sans')
  }

  expect(reads.sort()).toEqual(['Hiragino Sans', 'PingFang SC', 'PingFang TC'])
})

test('texts asking for a CJK fallback at once share one read of each face', async () => {
  const fonts = new FontManager()
  fonts.setFallbackUserAgent('Macintosh')
  fonts.setOnlineFontProviders({ google: false, fontsource: false, bunny: false })
  const reads: string[] = []
  fonts.setHostFontLoader(async (family) => {
    reads.push(family)
    await Bun.sleep(5)
    return family === 'Hiragino Sans' ? new Uint8Array(64).buffer : null
  })

  await Promise.all(
    ['比較', '機能', 'よくある質問'].map((characters) =>
      fonts.ensureFallbackPack(['cjk-jp'], characters)
    )
  )

  expect(reads.sort()).toEqual(['Hiragino Sans', 'PingFang SC', 'PingFang TC'])
})
