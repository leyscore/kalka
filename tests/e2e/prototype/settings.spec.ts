import type { Page } from '@playwright/test'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

async function createScreens(page: Page) {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const home = store.graph.createNode('FRAME', pageId, { name: 'Home', width: 390, height: 844 })
    const button = store.graph.createNode('RECTANGLE', home.id, {
      name: 'Button',
      x: 40,
      y: 40,
      width: 120,
      height: 40
    })
    const far = store.graph.createNode('FRAME', pageId, {
      name: 'Far',
      x: 3000,
      width: 390,
      height: 844
    })
    store.select([button.id])
    store.zoomToFit()
    return { homeId: home.id, buttonId: button.id, farId: far.id }
  })
}

test('the prototype settings choose a device, its rotation and the background', async () => {
  const { page } = editor
  const { homeId } = await createScreens(page)
  await page.getByRole('tab', { name: 'Prototype' }).click()
  await page.evaluate(() => window.kalka?.getStore?.().clearSelection())
  const panel = page.getByTestId('prototype-panel')
  await panel.locator('[data-property="prototype-device"]').click()
  await page.getByRole('option', { name: 'iPhone 16', exact: true }).click()
  await panel.getByTestId('prototype-rotate').click()
  const device = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    return store?.graph.getNode(store.state.currentPageId)?.prototypeDevice
  })
  expect(device).toMatchObject({ presetIdentifier: 'IPHONE_16', rotation: 'CCW_90' })

  const hex = panel.locator('[data-property="prototype-background"] input').first()
  await hex.fill('FFEEDD')
  await hex.press('Enter')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const store = window.kalka?.getStore?.()
        return store?.graph.getNode(store.state.currentPageId)?.prototypeBackground
      })
    )
    .toMatchObject({ r: 1, a: 1 })

  await page.evaluate((id) => {
    const store = window.kalka?.getStore?.()
    store?.graph.updateNode(id, {
      prototypeStartingPoint: { name: 'Flow 1', description: '', position: 'a' }
    })
    store?.select([id])
  }, homeId)
  await page.getByTestId('canvas-element').focus()
  await page.keyboard.press('ControlOrMeta+Alt+Enter')
  const presenter = page.getByTestId('prototype-presenter')
  await expect(presenter).toBeVisible()
  await expect(presenter).toHaveCSS('background-color', 'rgb(255, 238, 221)')
  // The phone's case is drawn around its turned screen.
  const body = presenter.getByTestId('prototype-device')
  await expect(body).toHaveAttribute('data-device', 'true')
  const box = await body.boundingBox()
  expect(box && box.width > box.height).toBe(true)
  await page.keyboard.press('Escape')
})

test('dragging a connection to the canvas edge pans towards frames out of view', async () => {
  const { page } = editor
  const { buttonId } = await createScreens(page)
  await page.getByRole('tab', { name: 'Prototype' }).click()
  const start = await page.evaluate((id) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const { zoom, panX, panY } = store.state
    const a = store.graph.getAbsoluteBounds(id)
    return {
      x: (a.x + a.width) * zoom + panX + 10,
      y: (a.y + a.height / 2) * zoom + panY,
      panX
    }
  }, buttonId)
  const canvas = page.getByTestId('canvas-element')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('no canvas')
  await page.mouse.move(box.x + start.x, box.y + start.y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - 10, box.y + start.y, { steps: 8 })
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.panX ?? 0))
    .toBeLessThan(start.panX - 100)
  await page.mouse.up()
  const panned = await page.evaluate(() => window.kalka?.getStore?.().state.panX ?? 0)
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => window.kalka?.getStore?.().state.panX ?? 0)).toBe(panned)
})

test('a manual overlay takes its position from the triggering layer', async () => {
  const { page } = editor
  const { buttonId, farId } = await createScreens(page)
  await page.evaluate(
    ({ buttonId, farId }) => {
      const store = window.kalka?.getStore?.()
      store?.graph.updateNode(farId, { overlayPositionType: 'MANUAL' })
      store?.setReactions(buttonId, [
        {
          trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] },
          actions: [
            {
              type: 'NODE',
              destinationId: farId,
              navigation: 'OVERLAY',
              transition: null,
              preserveScrollPosition: false,
              resetScrollPosition: false,
              overlayRelativePosition: null
            }
          ]
        }
      ])
      store?.select([buttonId])
    },
    { buttonId, farId }
  )
  await page.getByRole('tab', { name: 'Prototype' }).click()
  const offset = page
    .getByTestId('prototype-panel')
    .locator('[data-property="prototype-overlay-offset"]')
  await expect(offset).toBeVisible()
  const field = offset.getByRole('spinbutton', { name: 'Position X' })
  await field.click()
  // The field turns into its input when clicked.
  const x = offset.getByRole('spinbutton', { name: 'Position X' })
  await x.fill('24')
  await x.press('Enter')
  await expect
    .poll(() =>
      page.evaluate((id) => {
        const action = window.kalka?.getStore?.().graph.getNode(id)?.reactions[0]?.actions[0]
        return action?.type === 'NODE' ? action.overlayRelativePosition : null
      }, buttonId)
    )
    .toEqual({ x: 24, y: 40 })
})

test("a manual overlay's preview on the canvas drags where it opens", async () => {
  const { page } = editor
  const { buttonId, farId } = await createScreens(page)
  await page.evaluate(
    ({ buttonId, farId }) => {
      const store = window.kalka?.getStore?.()
      store?.graph.updateNode(farId, { overlayPositionType: 'MANUAL', width: 200, height: 120 })
      store?.setReactions(buttonId, [
        {
          trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] },
          actions: [
            {
              type: 'NODE',
              destinationId: farId,
              navigation: 'OVERLAY',
              transition: null,
              preserveScrollPosition: false,
              resetScrollPosition: false,
              overlayRelativePosition: null
            }
          ]
        }
      ])
      store?.select([buttonId])
    },
    { buttonId, farId }
  )
  await page.getByRole('tab', { name: 'Prototype' }).click()
  const offsetOf = () =>
    page.evaluate((id) => {
      const action = window.kalka?.getStore?.().graph.getNode(id)?.reactions[0]?.actions[0]
      return action?.type === 'NODE' ? action.overlayRelativePosition : null
    }, buttonId)

  // Without an offset the overlay opens just below the button, at (40, 80) in Home.
  const box = await editor.canvas.canvas.boundingBox()
  const view = await page.evaluate(() => {
    const state = window.kalka?.getStore?.().state
    return { zoom: state?.zoom ?? 1, panX: state?.panX ?? 0, panY: state?.panY ?? 0 }
  })
  const screen = (x: number, y: number) => ({
    x: (box?.x ?? 0) + x * view.zoom + view.panX,
    y: (box?.y ?? 0) + y * view.zoom + view.panY
  })
  const setSnapping = (objects: boolean) =>
    page.evaluate((on) => {
      const state = window.kalka?.getStore?.().state
      if (state) state.snappingPreferences = { ...state.snappingPreferences, objects: on }
    }, objects)
  // Moved freely first; snapping is checked below.
  await setSnapping(false)
  const start = screen(140, 140)
  const end = screen(190, 170)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move((start.x + end.x) / 2, (start.y + end.y) / 2)
  await page.mouse.move(end.x, end.y)
  await page.mouse.up()
  // Moved by (50, 30) from just below the button, give or take a screen pixel at this zoom.
  await expect.poll(offsetOf).not.toBeNull()
  const offset = await offsetOf()
  const pixel = 1 / view.zoom
  expect(Math.abs((offset?.x ?? 0) - 50)).toBeLessThanOrEqual(pixel)
  expect(Math.abs((offset?.y ?? 0) - 70)).toBeLessThanOrEqual(pixel)
  // The layer stays selected and in place: the drag moved only the overlay.
  expect(
    await page.evaluate((id) => {
      const store = window.kalka?.getStore?.()
      const node = store?.graph.getNode(id)
      return { selected: [...(store?.state.selectedIds ?? [])], x: node?.x, y: node?.y }
    }, buttonId)
  ).toEqual({ selected: [buttonId], x: 40, y: 40 })

  // Escape during a drag puts the overlay back.
  const before = await offsetOf()
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(end.x, end.y)
  await page.keyboard.press('Escape')
  await page.mouse.up()
  expect(await offsetOf()).toEqual(before)

  // With snapping, the overlay's left edge dropped near the button's right edge meets it.
  await setSnapping(true)
  await page.evaluate((id) => window.kalka?.getStore?.().select([id]), buttonId)
  const near = screen(190 + 73, 170)
  await page.mouse.move(end.x, end.y)
  await page.mouse.down()
  await page.mouse.move((end.x + near.x) / 2, near.y)
  await page.mouse.move(near.x, near.y)
  // While snapped, the canvas shows the guide along the button's right edge, as a move does.
  const guides = () =>
    page.evaluate(() =>
      (window.kalka?.getStore?.().state.snapGuides ?? []).map((guide) => ({
        axis: guide.axis,
        position: guide.position
      }))
    )
  expect(await guides()).toContainEqual({ axis: 'x', position: 160 })
  await page.mouse.up()
  await expect.poll(async () => (await offsetOf())?.x).toBe(120)
  expect(await guides()).toEqual([])
  await editor.canvas.undo()

  await editor.canvas.undo()
  await expect.poll(offsetOf).toBeNull()
  editor.canvas.assertNoErrors()
})

test("a frame's overlay settings show and change it", async () => {
  const { page } = editor
  const { farId } = await createScreens(page)
  await page.evaluate((id) => window.kalka?.getStore?.().select([id]), farId)
  await page.getByRole('tab', { name: 'Prototype' }).click()
  const section = page.getByTestId('prototype-panel').getByRole('region', { name: 'Overlay' })
  await expect(section.locator('[data-property="prototype-overlay-position"]')).toBeVisible()
  const closeOutside = section.getByRole('checkbox', { name: 'Close when clicking outside' })
  await expect(closeOutside).toBeVisible()
  await closeOutside.click()
  await expect
    .poll(() =>
      page.evaluate(
        (id) => window.kalka?.getStore?.().graph.getNode(id)?.overlayBackgroundInteraction,
        farId
      )
    )
    .toBe('CLOSE_ON_CLICK_OUTSIDE')
})
