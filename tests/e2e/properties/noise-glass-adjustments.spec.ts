import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

/** Creates an artboard holding one rectangle, selects it, and returns both ids. */
async function setup(page: Page, image = false) {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  return page.evaluate(async (withImage) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Editor unavailable')
    const pageId = store.state.currentPageId
    const frame = store.graph.createNode('FRAME', pageId, {
      name: 'Board',
      x: 40,
      y: 40,
      width: 400,
      height: 300
    })
    const fill = { type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.9, a: 1 }, opacity: 1 } as const
    let fills = [{ ...fill, visible: true }]
    if (withImage) {
      const canvas = document.createElement('canvas')
      canvas.width = 8
      canvas.height = 8
      const context = canvas.getContext('2d')
      if (!context) throw new Error('No 2D context')
      context.fillStyle = '#c05030'
      context.fillRect(0, 0, 8, 8)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
      if (!blob) throw new Error('No image')
      const imageHash = store.storeImage(new Uint8Array(await blob.arrayBuffer()))
      fills = [
        { ...fill, type: 'IMAGE', imageHash, imageScaleMode: 'FILL', visible: true } as never
      ]
    }
    const node = store.graph.createNode('RECTANGLE', frame.id, {
      name: 'Card',
      x: 40,
      y: 40,
      width: 200,
      height: 120,
      fills
    })
    store.select([node.id])
    return { frame: frame.id, node: node.id }
  }, image)
}

/**
 * The filters the canvas draws an artboard's layers with, read from its document: the canvas
 * does not tag layer elements with their ids, and the artboard holds one layer.
 */
async function canvasStyle(page: Page, frame: string) {
  return page.evaluate((frame) => {
    const doc = document.querySelector<HTMLIFrameElement>(
      `iframe[data-kalka-artboard="${frame}"]`
    )?.contentDocument
    const view = doc?.defaultView
    const styles = [...(doc?.querySelectorAll<HTMLElement>('body *') ?? [])].flatMap(
      (element) => view?.getComputedStyle(element) ?? []
    )
    const listed = (values: string[]) => values.filter((value) => value !== 'none').join(' ')
    return {
      filter: listed(styles.map((style) => style.filter)),
      backdrop: listed(styles.map((style) => style.backdropFilter))
    }
  }, frame)
}

function effectsOf(page: Page, id: string) {
  return page.evaluate((id) => window.kalka?.getStore?.().graph.getNode(id)?.effects, id)
}

test('noise, glass and progressive blur are set from the effects panel and drawn as CSS', async ({
  page
}) => {
  const { frame, node } = await setup(page)
  const section = page.getByRole('region', { name: 'Effects', exact: true })
  await section.getByRole('button', { name: 'Add effect' }).click()
  await section.getByRole('combobox', { name: 'Effects', exact: true }).click()
  await page.getByRole('option', { name: 'Noise', exact: true }).click()
  await expect
    .poll(async () => (await effectsOf(page, node))?.[0])
    .toMatchObject({ type: 'NOISE', noiseType: 'MONOTONE', density: 0.5 })
  await expect.poll(async () => (await canvasStyle(page, frame)).filter).toContain('url(')

  if ((await section.locator('[data-slot="effect-settings"]').count()) === 0)
    await section.getByRole('button', { name: 'Expand effect settings' }).click()
  await section.getByRole('combobox', { name: 'Noise type' }).click()
  await page.getByRole('option', { name: 'Duotone', exact: true }).click()
  await expect
    .poll(async () => (await effectsOf(page, node))?.[0])
    .toMatchObject({ noiseType: 'DUOTONE', secondaryColor: { r: 1, g: 1, b: 1, a: 1 } })

  await section.getByRole('combobox', { name: 'Effects', exact: true }).click()
  await page.getByRole('option', { name: 'Glass', exact: true }).click()
  await expect
    .poll(async () => (await effectsOf(page, node))?.[0])
    .toMatchObject({ type: 'GLASS', radius: 4, refraction: 0.8 })
  await expect.poll(async () => (await effectsOf(page, node))?.[0].noiseType).toBeUndefined()
  await expect.poll(async () => (await canvasStyle(page, frame)).backdrop).toContain('blur(4px)')

  await section.getByRole('combobox', { name: 'Effects', exact: true }).click()
  await page.getByRole('option', { name: 'Layer blur', exact: true }).click()
  await section.getByRole('combobox', { name: 'Blur type' }).click()
  await page.getByRole('option', { name: 'Progressive', exact: true }).click()
  await expect
    .poll(async () => (await effectsOf(page, node))?.[0])
    .toMatchObject({ type: 'LAYER_BLUR', blurType: 'PROGRESSIVE', startRadius: 0 })
  await expect.poll(async () => (await canvasStyle(page, frame)).filter).toContain('url(')

  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z')
  await expect.poll(async () => (await effectsOf(page, node))?.[0].blurType).not.toBe('PROGRESSIVE')
})

test('a progressive blur shows its ends on the layer and moves them by dragging', async ({
  page
}) => {
  const { node } = await setup(page)
  const section = page.getByRole('region', { name: 'Effects', exact: true })
  await section.getByRole('button', { name: 'Add effect' }).click()
  await section.getByRole('combobox', { name: 'Effects', exact: true }).click()
  await page.getByRole('option', { name: 'Layer blur', exact: true }).click()
  if ((await section.locator('[data-slot="effect-settings"]').count()) === 0)
    await section.getByRole('button', { name: 'Expand effect settings' }).click()
  await section.getByRole('combobox', { name: 'Blur type' }).click()
  await page.getByRole('option', { name: 'Progressive', exact: true }).click()
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.blurEdit?.index))
    .toBe(0)

  // The end sits at the middle of the card's bottom edge: (40 + 40 + 100, 40 + 40 + 120).
  const toScreen = (x: number, y: number) =>
    page.evaluate(
      ([wx, wy]) => {
        const state = window.kalka?.getStore?.().state
        return state ? { x: wx * state.zoom + state.panX, y: wy * state.zoom + state.panY } : null
      },
      [x, y]
    )
  const end = await toScreen(180, 200)
  const target = await toScreen(240, 200)
  if (!end || !target) throw new Error('No viewport')
  await new CanvasHelper(page).drag(end.x, end.y, target.x, target.y)
  await expect
    .poll(async () => (await effectsOf(page, node))?.[0].endOffset?.x ?? 0)
    .toBeCloseTo(0.8, 1)

  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z')
  await expect
    .poll(async () => (await effectsOf(page, node))?.[0].endOffset)
    .toEqual({ x: 0.5, y: 1 })
})

test('image adjustments filter the picture on the canvas', async ({ page }) => {
  const { frame, node } = await setup(page, true)
  await page.getByTestId('fill-picker-swatch').first().click()
  const exposure = page.getByRole('slider', { name: 'Exposure', exact: true })
  await exposure.focus()
  await exposure.press('End')
  await expect
    .poll(() =>
      page.evaluate((id) => window.kalka?.getStore?.().graph.getNode(id)?.fills[0].filters, node)
    )
    .toEqual({ exposure: 1 })
  await exposure.press('ArrowLeft')
  await expect
    .poll(() =>
      page.evaluate((id) => window.kalka?.getStore?.().graph.getNode(id)?.fills[0].filters, node)
    )
    .toEqual({ exposure: 0.99 })
  await expect.poll(async () => (await canvasStyle(page, frame)).filter).toContain('url(')

  await page.getByTestId('image-adjustments-reset').click()
  await expect
    .poll(() =>
      page.evaluate((id) => window.kalka?.getStore?.().graph.getNode(id)?.fills[0].filters, node)
    )
    .toBeUndefined()
  await expect.poll(async () => (await canvasStyle(page, frame)).filter).toBe('')
})
