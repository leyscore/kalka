import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('publishing without a library ID says what is missing, then publishes once it is given', async ({
  page
}) => {
  const canvas = new CanvasHelper(page)
  await page.goto('/?test')
  await canvas.waitForInit()
  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.graph.createNode('COMPONENT', store.state.currentPageId, {
      name: 'Button',
      componentKey: 'button',
      width: 80,
      height: 32
    })
    store.requestRender()
  })

  await page.getByTestId('left-panel-assets-tab').click()
  await page.getByRole('button', { name: 'Manage libraries' }).click()
  await page.getByRole('button', { name: 'Publish library' }).click()
  const publish = page.getByRole('dialog').filter({ hasText: 'Publish library' })
  await publish.getByLabel('Library ID').fill('')
  await publish.getByLabel('Library name').fill('UI Kit')
  await publish.getByRole('button', { name: 'Publish library' }).click()
  await expect(publish.getByRole('alert')).toBeVisible()
  await expect(publish.getByLabel('Library ID')).toBeVisible()

  await publish.getByLabel('Library ID').fill('ui-kit')
  await publish.getByRole('button', { name: 'Publish library' }).click()
  await expect(publish.getByLabel('Library ID')).toBeHidden()
})
