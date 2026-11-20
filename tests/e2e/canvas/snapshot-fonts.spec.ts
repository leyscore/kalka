import { readFile } from 'node:fs/promises'

import { expect, test, type Page } from '@playwright/test'
import { fromUint8Array } from 'js-base64'

import { CanvasHelper } from '#tests/helpers/canvas'
import { comparePixels } from '#tests/helpers/claude-design/fidelity'
import { testPath } from '#tests/helpers/paths'

const SNAPSHOT_MODULE = '/packages/vue/src/canvas/dom-scene/snapshot.ts'
const WIDTH = 480
const HEIGHT = 160

/** An artboard snapshot as the canvas makes one: text in fonts the image embeds. */
async function snapshotSVG(words: string): Promise<string> {
  // Several faces, as an artboard embeds every font its text names, fallbacks included.
  const files = ['InterVariable-Latin.ttf', 'NotoNaskhArabic-Regular.ttf', 'NotoSansCJK-Test.otf']
  const faces = await Promise.all(
    files.map(async (file, index) => {
      const data = fromUint8Array(
        new Uint8Array(await readFile(testPath('fixtures', 'fonts', file)))
      )
      return `@font-face{font-family:"Snapshot ${index}";src:url(data:font/ttf;base64,${data})}`
    })
  )
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"><foreignObject width="${WIDTH}" height="${HEIGHT}"><html xmlns="http://www.w3.org/1999/xhtml"><head><style>${faces.join('')}body{margin:0;background:#fff}</style></head><body><p style="margin:0;padding:24px;font:600 56px 'Snapshot 0','Snapshot 1','Snapshot 2';color:#141414">${words}</p></body></html></foreignObject></svg>`
}

/** What the canvas shows for a snapshot image, screenshot. */
async function drawSnapshot(page: Page, svg: string) {
  await page.evaluate(
    async ({ text, module, width, height }) => {
      const { rasterizeSnapshot } = await import(module)
      const bitmap = await rasterizeSnapshot({ svg: text, width, height })
      if (!bitmap) throw new Error('No snapshot')
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647'
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
      document.querySelector('[data-snapshot-test]')?.remove()
      canvas.dataset.snapshotTest = ''
      document.body.append(canvas)
    },
    { text: svg, module: SNAPSHOT_MODULE, width: WIDTH, height: HEIGHT }
  )
  return page.screenshot({ clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } })
}

test('a snapshot draws its text in the fonts its image embeds', async ({ page }) => {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  // The words first, while the image's fonts have not loaded yet.
  const withWords = await drawSnapshot(page, await snapshotSVG('Every word'))
  const without = await drawSnapshot(page, await snapshotSVG(''))
  const { mismatch } = await comparePixels(page, without, withWords)
  expect(mismatch).toBeGreaterThan(0.02)
})
