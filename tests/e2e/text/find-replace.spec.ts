import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('⌘F finds text on every page and replaces it in one undo step', async ({ page }) => {
  await page.goto('/')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  canvas.errors.length = 0
  await canvas.clearCanvas()

  const ids = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const graph = store.graph
    const card = graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Card',
      width: 400,
      height: 200
    })
    const title = graph.createNode('TEXT', card.id, {
      name: 'Title',
      text: 'Sign up today',
      width: 300,
      height: 30,
      styleRuns: [{ start: 0, length: 7, style: { fontWeight: 700 } }]
    })
    const other = graph.addPage('Second')
    const footer = graph.createNode('TEXT', other.id, {
      name: 'Footer',
      text: 'Sign up below',
      width: 300,
      height: 30
    })
    store.requestRender()
    return { title: title.id, footer: footer.id }
  })
  await canvas.waitForRender()

  await canvas.click(600, 500)
  await page.keyboard.press('ControlOrMeta+KeyF')
  const panel = page.getByTestId('find-panel')
  const search = panel.getByRole('searchbox')
  await expect(search).toBeFocused()
  await search.fill('sign up')

  const results = panel.getByTestId('find-result')
  await expect(results).toHaveCount(1)

  // Enter goes to the result: the layer is selected.
  await search.press('Enter')
  await expect(results.first()).toHaveAttribute('aria-current', 'true')
  await expect
    .poll(() => page.evaluate(() => [...(window.kalka?.getStore?.().state.selectedIds ?? [])]))
    .toEqual([ids.title])

  await panel.getByTestId('find-filters-toggle').click()
  await panel
    .getByTestId('find-filters')
    .getByRole('group')
    .first()
    .getByRole('button')
    .nth(1)
    .click()
  await expect(results).toHaveCount(2)

  await panel.getByTestId('find-replace-toggle').click()
  await panel.getByTestId('find-replacement').fill('Start')
  await panel.getByTestId('find-replace-all').click()
  await expect(results).toHaveCount(0)

  const texts = () =>
    page.evaluate(
      (nodeIds) => {
        const store = window.kalka?.getStore?.()
        return nodeIds.map((id) => {
          const node = store?.graph.getNode(id)
          return { text: node?.text, runs: node?.styleRuns }
        })
      },
      [ids.title, ids.footer]
    )
  expect(await texts()).toEqual([
    { text: 'Start today', runs: [{ start: 0, length: 5, style: { fontWeight: 700 } }] },
    { text: 'Start below', runs: [] }
  ])

  await canvas.click(600, 500)
  await page.keyboard.press('ControlOrMeta+KeyZ')
  await expect
    .poll(async () => (await texts()).map((node) => node.text))
    .toEqual(['Sign up today', 'Sign up below'])
  canvas.assertNoErrors()
})
