import type { Browser, Page } from '@playwright/test'
import { fromUint8Array, toUint8Array } from 'js-base64'

/** How far a channel may differ before a pixel counts as different: anti-aliasing stays under it. */
const CHANNEL_TOLERANCE = 48

export interface PixelDiff {
  /** Share of the board's pixels that differ, 0 to 1. */
  mismatch: number
  /** The differing pixels in red over a faded original, as a PNG. */
  diff: Buffer
}

/** Compares two screenshots of the same size in a page's canvas. */
export async function comparePixels(page: Page, a: Buffer, b: Buffer): Promise<PixelDiff> {
  const result = await page.evaluate(
    async ({ first, second, tolerance }) => {
      const load = async (base64: string) => {
        const image = new Image()
        image.src = `data:image/png;base64,${base64}`
        await image.decode()
        return image
      }
      const [left, right] = await Promise.all([load(first), load(second)])
      const width = Math.min(left.width, right.width)
      const height = Math.min(left.height, right.height)
      const pixels = (image: HTMLImageElement) => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) throw new Error('No 2D context')
        context.drawImage(image, 0, 0)
        return context.getImageData(0, 0, width, height)
      }
      const original = pixels(left)
      const imported = pixels(right)
      const out = new ImageData(width, height)
      let different = 0
      for (let index = 0; index < original.data.length; index += 4) {
        let delta = 0
        for (let channel = 0; channel < 3; channel++)
          delta = Math.max(
            delta,
            Math.abs((original.data[index + channel] ?? 0) - (imported.data[index + channel] ?? 0))
          )
        const gray =
          ((original.data[index] ?? 0) +
            (original.data[index + 1] ?? 0) +
            (original.data[index + 2] ?? 0)) /
          3
        if (delta > tolerance) {
          different++
          out.data.set([255, 0, 0, 255], index)
        } else out.data.set([gray, gray, gray, 64], index)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')?.putImageData(out, 0, 0)
      const url = canvas.toDataURL('image/png')
      const total = Math.max(left.width, right.width) * Math.max(left.height, right.height)
      return {
        mismatch: (different + total - width * height) / total,
        diff: url.slice(url.indexOf(',') + 1)
      }
    },
    { first: fromUint8Array(a), second: fromUint8Array(b), tolerance: CHANNEL_TOLERANCE }
  )
  return { mismatch: result.mismatch, diff: Buffer.from(toUint8Array(result.diff)) }
}

/** The app's own modules, so the font manager is the one that loaded the document's fonts. */
const VUE_MODULE = '/packages/vue/src/index.ts'
const TEXT_MODULE = '/packages/core/src/text/index.ts'

/** The standalone page an artboard draws as, the way the canvas and raster exports draw it. */
export function artboardPage(page: Page, artboardId: string) {
  return page.evaluate(
    async ({ id, vueModule, textModule }) => {
      const store = window.kalka?.getStore?.()
      if (!store) throw new Error('Kalka store not initialized')
      const vue = await import(vueModule)
      const text = await import(textModule)
      const graph = store.graph
      const drawn = vue.rasterDocument(
        graph,
        [id],
        text.fontManager.browserFacesFor(graph.interVersion)
      )
      if (!drawn) throw new Error('Nothing to draw')
      return { html: String(drawn.html), width: Number(drawn.width), height: Number(drawn.height) }
    },
    { id: artboardId, vueModule: VUE_MODULE, textModule: TEXT_MODULE }
  )
}

/** Screenshots HTML at a size in a page of its own, at rest. */
export async function screenshotHTML(
  browser: Browser,
  html: string,
  width: number,
  height: number
) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
  try {
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    return await page.screenshot({ clip: { x: 0, y: 0, width, height } })
  } finally {
    await page.close()
  }
}
