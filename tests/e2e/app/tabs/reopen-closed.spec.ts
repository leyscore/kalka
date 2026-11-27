import { expect, test } from '#tests/e2e/fixtures'
import { CanvasHelper } from '#tests/helpers/canvas'
import { openAppMenu } from '#tests/helpers/menu'

test('Reopen closed tab brings back a draft closed here', async ({ page }) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  // The editor's menu lives in a document's top bar.
  await page.getByRole('button', { name: 'New design', exact: true }).click()
  await expect(page.getByTestId('app-menu-trigger')).toBeVisible()

  const reopen = async () => {
    const file = await openAppMenu(page, 'File')
    await file.getByRole('menuitem', { name: /^Reopen closed tab/ }).click()
  }
  await reopen()
  await expect(page.getByText('No closed tab to reopen.').first()).toBeVisible()

  await page.evaluate(async () => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = store.createShape('RECTANGLE', 120, 120, 240, 140)
    store.updateNode(id, { name: 'Closed rectangle' })
    store.state.documentName = 'Closed draft'
    await store.persistRecoveryNow()
  })
  const tab = page.locator('[data-slot="tab-item"]').filter({ hasText: 'Closed draft' })
  await tab.getByTestId('tabbar-close').click()
  await expect(tab).toHaveCount(0)

  await reopen()
  await expect(tab).toBeVisible()
  await expect(page.getByText('Closed rectangle')).toBeVisible()
})
