import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { expect, test, type Page } from '@playwright/test'
import { zipSync } from 'fflate'

import { CanvasHelper } from '#tests/helpers/canvas'
import { testPath } from '#tests/helpers/paths'
import { getArtboardContents } from '#tests/helpers/store'

const FIXTURE = testPath('fixtures', 'claude-design')

/** The fixture project as the `.zip` Claude Design exports. */
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

/** Drops a file on the window the way a drag from the desktop delivers it. */
async function dropFile(page: Page, name: string, bytes: number[]) {
  await page.getByTestId('canvas-element').evaluate(
    (canvas, dropped) => {
      const transfer = new DataTransfer()
      transfer.items.add(new File([new Uint8Array(dropped.bytes)], dropped.name))
      const options = { bubbles: true, cancelable: true, dataTransfer: transfer }
      canvas.dispatchEvent(new DragEvent('dragover', options))
      canvas.dispatchEvent(new DragEvent('drop', options))
    },
    { name, bytes }
  )
}

test('a dropped Claude Design export opens as a document of its artboards', async ({ page }) => {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  const tabs = page.getByRole('tablist').filter({ has: page.getByTestId('tabbar-tab') })

  await dropFile(page, 'bakery.zip', await exportedProject())

  await expect(tabs.getByRole('tab').last()).toContainText('Bakery landing', { timeout: 30_000 })

  const artboards = await getArtboardContents(page)
  const home = artboards.find((artboard) => artboard.name === 'Home')
  const card = artboards.find((artboard) => artboard.name === 'Offer card')
  expect(home).toMatchObject({ type: 'FRAME', x: 0, y: 0, width: 800, height: 600, images: 1 })
  expect(card).toMatchObject({ type: 'FRAME', x: 880, y: 0, width: 320, height: 200 })
  // Holes, loops, imports with their props, and what the design shows once its timers ran.
  expect(home?.texts).toEqual(
    expect.arrayContaining([
      'Bread, every morning',
      'Loaf club',
      'Family box',
      'Open today until seven'
    ])
  )
  expect(card?.texts).toEqual(['Weekly bread'])
  // The canvas title note.
  expect(artboards.flatMap((artboard) => artboard.texts)).toContain('Bakery pages')
})
