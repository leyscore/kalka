import type { Page } from '@playwright/test'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

/** Two screens side by side: Home with a Button, and Details. */
async function createScreens(page: Page) {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const graph = store.graph
    const pageId = store.state.currentPageId
    const solid = (r: number, g: number, b: number) => [
      { type: 'SOLID' as const, color: { r, g, b, a: 1 }, opacity: 1, visible: true }
    ]
    const home = graph.createNode('FRAME', pageId, {
      name: 'Home',
      x: 0,
      y: 0,
      width: 300,
      height: 400,
      fills: solid(1, 1, 1)
    })
    const button = graph.createNode('RECTANGLE', home.id, {
      name: 'Button',
      x: 40,
      y: 40,
      width: 120,
      height: 40,
      fills: solid(0.1, 0.4, 1)
    })
    const details = graph.createNode('FRAME', pageId, {
      name: 'Details',
      x: 500,
      y: 0,
      width: 300,
      height: 400,
      fills: solid(0.95, 0.9, 0.8)
    })
    store.select([button.id])
    store.zoomToFit()
    return { homeId: home.id, buttonId: button.id, detailsId: details.id }
  })
}

function frame(page: Page, id: string) {
  return page.locator(`[data-present-frame="${id}"]`)
}

test('a layer connected in the Prototype tab navigates when presented, and Back returns', async () => {
  const { page } = editor
  const { homeId, buttonId, detailsId } = await createScreens(page)

  await page.getByRole('tab', { name: 'Prototype' }).click()
  const panel = page.getByTestId('prototype-panel')
  await panel.getByRole('button', { name: 'Add interaction' }).click()
  await panel.locator('[data-property="prototype-destination"]').click()
  await page.getByRole('option', { name: 'Details' }).click()
  await expect
    .poll(() =>
      page.evaluate((id) => {
        const action = window.kalka?.getStore?.().graph.getNode(id)?.reactions[0]?.actions[0]
        return action?.type === 'NODE' ? action.destinationId : null
      }, buttonId)
    )
    .toBe(detailsId)

  // The canvas draws the connection while the Prototype tab is open.
  await expect(page.getByTestId('svg-overlay').locator('path[d*=" C "]').first()).toBeAttached()

  // Details goes back on click.
  await page.evaluate((id) => {
    const store = window.kalka?.getStore?.()
    store?.setReactions(id, [
      { trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] }, actions: [{ type: 'BACK' }] }
    ])
  }, detailsId)

  await page.evaluate((id) => window.kalka?.getStore?.().select([id]), homeId)
  await page.getByTestId('canvas-element').focus()
  await page.keyboard.press('ControlOrMeta+Alt+Enter')
  const presenter = page.getByTestId('prototype-presenter')
  await expect(presenter).toBeVisible()
  await expect(frame(page, homeId)).toBeVisible()

  await frame(page, homeId).locator('[data-layer="Button"]').click()
  await expect(frame(page, detailsId)).toBeVisible()
  await expect(frame(page, homeId)).toHaveCount(0)

  await frame(page, detailsId)
    .locator('[data-layer=""]')
    .click({ position: { x: 150, y: 300 } })
  await expect(frame(page, homeId)).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(presenter).toHaveCount(0)
})

test('dragging the connection handle onto a frame connects the layer', async () => {
  const { page } = editor
  const { buttonId, detailsId } = await createScreens(page)
  await page.getByRole('tab', { name: 'Prototype' }).click()

  const points = await page.evaluate(
    ({ source, target }) => {
      const store = window.kalka?.getStore?.()
      if (!store) throw new Error('Kalka store not initialized')
      const { zoom, panX, panY } = store.state
      const a = store.graph.getAbsoluteBounds(source)
      const b = store.graph.getAbsoluteBounds(target)
      return {
        handle: { x: (a.x + a.width) * zoom + panX + 10, y: (a.y + a.height / 2) * zoom + panY },
        drop: { x: (b.x + b.width / 2) * zoom + panX, y: (b.y + b.height / 2) * zoom + panY }
      }
    },
    { source: buttonId, target: detailsId }
  )
  const canvas = page.getByTestId('canvas-element')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('no canvas')
  await page.mouse.move(box.x + points.handle.x, box.y + points.handle.y)
  await page.mouse.down()
  await page.mouse.move(box.x + points.drop.x, box.y + points.drop.y, { steps: 8 })
  await page.mouse.up()

  await expect
    .poll(() =>
      page.evaluate((id) => {
        const reaction = window.kalka?.getStore?.().graph.getNode(id)?.reactions[0]
        const action = reaction?.actions[0]
        return reaction && action?.type === 'NODE'
          ? `${reaction.trigger.type}:${action.navigation}:${action.destinationId}`
          : null
      }, buttonId)
    )
    .toBe(`ON_CLICK:NAVIGATE:${detailsId}`)
})

test('an overlay opens over the screen, dissolving in, and a click outside closes it', async () => {
  const { page } = editor
  const { homeId, buttonId, detailsId } = await createScreens(page)
  await page.evaluate(
    ({ button, details }) => {
      const store = window.kalka?.getStore?.()
      if (!store) throw new Error('Kalka store not initialized')
      store.graph.updateNode(details, {
        width: 200,
        height: 120,
        overlayBackground: { r: 0, g: 0, b: 0, a: 0.4 },
        overlayBackgroundInteraction: 'CLOSE_ON_CLICK_OUTSIDE'
      })
      store.setReactions(button, [
        {
          trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] },
          actions: [
            {
              type: 'NODE',
              destinationId: details,
              navigation: 'OVERLAY',
              transition: {
                type: 'DISSOLVE',
                direction: 'LEFT',
                matchLayers: false,
                duration: 0.2,
                easing: { type: 'EASE_OUT', bezier: null, spring: null }
              },
              preserveScrollPosition: false,
              resetScrollPosition: false,
              overlayRelativePosition: null
            }
          ]
        }
      ])
      store.startPlay({ startId: store.graph.getNode(button)?.parentId ?? '' })
    },
    { button: buttonId, details: detailsId }
  )
  await expect(frame(page, homeId)).toBeVisible()
  await frame(page, homeId).locator('[data-layer="Button"]').click()
  const overlay = page.getByTestId('prototype-overlay')
  await expect(overlay).toBeVisible()
  await expect(frame(page, detailsId)).toBeVisible()
  // The screen stays under the overlay.
  await expect(frame(page, homeId)).toBeVisible()

  await overlay.click({ position: { x: 4, y: 4 } })
  await expect(overlay).toHaveCount(0)
  await expect(frame(page, homeId)).toBeVisible()
})
