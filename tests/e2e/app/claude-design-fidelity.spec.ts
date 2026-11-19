import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { expect, test, type Page } from '@playwright/test'
import { zipSync } from 'fflate'

import { CanvasHelper } from '#tests/helpers/canvas'
import { artboardPage, comparePixels, screenshotHTML } from '#tests/helpers/claude-design/fidelity'
import { testPath } from '#tests/helpers/paths'

const FIXTURE = testPath('fixtures', 'claude-design-fidelity')
/** Anti-aliasing and subpixel text placement stay under this share of a board's pixels. */
const MAX_MISMATCH = 0.01

async function exportedProject(): Promise<number[]> {
  const files: Record<string, Uint8Array> = {}
  const walk = async (folder: string) => {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name)
      if (entry.isDirectory()) await walk(path)
      else files[relative(FIXTURE, path)] = new Uint8Array(await readFile(path))
    }
  }
  await walk(FIXTURE)
  return [...zipSync(files)]
}

async function importProject(page: Page) {
  const bytes = await exportedProject()
  await page.getByTestId('canvas-element').evaluate((canvas, archive) => {
    const transfer = new DataTransfer()
    transfer.items.add(new File([new Uint8Array(archive)], 'fidelity.zip'))
    const options = { bubbles: true, cancelable: true, dataTransfer: transfer }
    canvas.dispatchEvent(new DragEvent('dragover', options))
    canvas.dispatchEvent(new DragEvent('drop', options))
  }, bytes)
  const tabs = page.getByRole('tablist').filter({ has: page.getByTestId('tabbar-tab') })
  await expect(tabs.getByRole('tab').last()).toContainText('Fidelity boards', { timeout: 30_000 })
}

test('imported Claude Design boards draw as their pages do', async ({ page, browser }) => {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  await importProject(page)
  const artboards = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return store.graph
      .getChildren(store.state.currentPageId)
      .filter((node) => node.type === 'FRAME')
      .map((node) => ({ id: node.id, name: node.name, width: node.width, height: node.height }))
  })

  for (const name of ['Shapes', 'Cards']) {
    const artboard = artboards.find((candidate) => candidate.name === name)
    expect(artboard, name).toBeDefined()
    if (!artboard) continue
    // These boards have no logic, so the page itself, read without a runtime, is the original.
    const source = await readFile(join(FIXTURE, 'project', `${name}.dc.html`), 'utf8')
    const original = await screenshotHTML(browser, source, artboard.width, artboard.height)
    const drawn = await artboardPage(page, artboard.id)
    const imported = await screenshotHTML(browser, drawn.html, artboard.width, artboard.height)
    const { mismatch } = await comparePixels(page, original, imported)
    expect(mismatch, `${name} differs from its page`).toBeLessThan(MAX_MISMATCH)
  }
})
