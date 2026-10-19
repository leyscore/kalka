import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { chromium } from '@playwright/test'

/**
 * Draws the macOS installer window's background from `background.html` at 1× and 2×, and merges
 * them into the HiDPI TIFF that electron-builder hands to the DMG (`electron/build/background.tiff`).
 * Run on a Mac (`tiffutil`): `bun electron/scripts/dmg/render.ts`. The output is committed, so
 * packaging needs neither Chromium nor this script.
 */
const here = fileURLToPath(new URL('.', import.meta.url))
const page = pathToFileURL(join(here, 'background.html')).href
const output = join(here, '..', '..', 'build', 'background.tiff')
const WIDTH = 660
const HEIGHT = 448

const dir = mkdtempSync(join(tmpdir(), 'kalka-dmg-'))
const browser = await chromium.launch()
try {
  const files: string[] = []
  for (const scale of [1, 2]) {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: scale
    })
    const tab = await context.newPage()
    await tab.goto(page)
    await tab.evaluate('document.fonts.ready')
    const file = join(dir, scale === 1 ? 'background.png' : 'background@2x.png')
    await tab.screenshot({ path: file })
    files.push(file)
    await context.close()
  }
  execFileSync('tiffutil', ['-cathidpicheck', ...files, '-out', output])
  console.info(`Wrote ${output}`)
} finally {
  await browser.close()
  rmSync(dir, { recursive: true, force: true })
}
