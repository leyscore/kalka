import { expect, test } from '#tests/e2e/fixtures'
import { CanvasHelper } from '#tests/helpers/canvas'

test('an unsaved document is a draft in Recent, open or after a reload', async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  await page.evaluate(async () => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = store.createShape('RECTANGLE', 120, 120, 240, 140)
    store.updateNode(id, { name: 'Draft rectangle' })
    await store.persistRecoveryNow()
  })

  // From Home, the open draft switches back to its tab.
  await page.keyboard.press('ControlOrMeta+t')
  const home = page.getByTestId('recent-files-home')
  const draft = home.getByTestId('home-draft')
  await expect(draft).toHaveCount(1)
  await expect(draft.locator('[data-slot="badge"]')).toBeVisible()
  await draft.getByRole('button').click()
  await expect(page.getByText('Draft rectangle')).toBeVisible()

  // After a reload, closing the recovery dialog keeps the draft, and Home restores it.
  page.once('dialog', (dialog) => dialog.accept())
  await page.reload()
  const recovery = page.getByRole('alertdialog', { name: 'Recover unsaved work' })
  await expect(recovery).toBeVisible()
  await recovery.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click()
  await expect(home.getByTestId('home-draft')).toHaveCount(1)
  await home.getByTestId('home-draft').getByRole('button').click()
  await expect(page.getByText('Draft rectangle')).toBeVisible()

  await context.close()
})
