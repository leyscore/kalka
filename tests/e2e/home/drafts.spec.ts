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
  // Its card shows the document, not an empty picture, and offers Duplicate, not Delete.
  await expect(draft.locator('[data-slot="preview"] img')).toHaveAttribute('src', /^blob:/)
  await draft.getByRole('button', { name: /^Actions for / }).click()
  await expect(page.getByRole('menuitem', { name: 'Delete draft' })).toHaveCount(0)
  await page.getByRole('menuitem', { name: 'Duplicate', exact: true }).click()
  await expect(draft).toHaveCount(2)
  await expect(draft.filter({ hasText: 'Untitled copy' })).toHaveCount(1)
  await draft.filter({ hasNotText: 'Untitled copy' }).locator('[data-slot="trigger"]').click()
  await expect(page.getByText('Draft rectangle')).toBeVisible()

  // After a reload, closing the recovery dialog keeps the draft, and Home restores it.
  page.once('dialog', (dialog) => dialog.accept())
  await page.reload()
  const recovery = page.getByRole('alertdialog', {
    name: 'Recover unsaved work'
  })
  await expect(recovery).toBeVisible()
  await recovery.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click()
  await expect(home.getByTestId('home-draft')).toHaveCount(2)
  await expect(
    home.getByTestId('home-draft').filter({ hasText: 'Untitled copy' }).locator('img')
  ).toHaveAttribute('src', /^blob:/)
  await home
    .getByTestId('home-draft')
    .filter({ hasNotText: 'Untitled copy' })
    .locator('[data-slot="trigger"]')
    .click()
  await expect(page.getByText('Draft rectangle')).toBeVisible()

  await context.close()
})

test('a kept draft is deleted from its menu, and Undo brings it back', async ({
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
    store.createShape('RECTANGLE', 120, 120, 240, 140)
    await store.persistRecoveryNow()
  })
  page.once('dialog', (dialog) => dialog.accept())
  await page.reload()
  const recovery = page.getByRole('alertdialog', {
    name: 'Recover unsaved work'
  })
  await recovery.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click()

  const home = page.getByTestId('recent-files-home')
  const draft = home.getByTestId('home-draft')
  await expect(draft).toHaveCount(1)
  await draft.getByRole('button', { name: /^Actions for / }).click()
  await page.getByRole('menuitem', { name: 'Delete draft' }).click()
  await expect(draft).toHaveCount(0)

  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(draft).toHaveCount(1)

  // Duplicate, as on Figma's file cards, lists a second draft named after the first.
  await draft.getByRole('button', { name: /^Actions for / }).click()
  await page.getByRole('menuitem', { name: 'Duplicate', exact: true }).click()
  await expect(draft).toHaveCount(2)
  const copy = draft.filter({ hasText: 'Untitled copy' })
  await expect(copy).toHaveCount(1)

  // The copy deleted in turn comes back too.
  await copy.getByRole('button', { name: /^Actions for / }).click()
  await page.getByRole('menuitem', { name: 'Delete draft' }).click()
  await expect(copy).toHaveCount(0)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(copy).toHaveCount(1)
  await context.close()
})
