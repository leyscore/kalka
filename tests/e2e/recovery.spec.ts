import { expect, test } from '#tests/e2e/fixtures'
import { CanvasHelper } from '#tests/helpers/canvas'

test('a draft closes without asking and recovery keeps it', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()
  await page.goto('/')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()

  await page.evaluate(async () => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = store.createShape('RECTANGLE', 120, 120, 240, 140)
    await store.persistRecoveryNow()
    store.updateNode(id, { name: 'Retained recovery rectangle' })
    await store.persistRecoveryNow()
  })

  await page.keyboard.press('ControlOrMeta+t')
  await expect(page.getByTestId('recent-files-home')).toBeVisible()
  await expect(page.getByTestId('tabbar-tab')).toHaveCount(1)
  // As in Figma, closing a draft's tab asks nothing: the draft stays on Home.
  await page.locator('[data-slot="tab-item"]').first().getByTestId('tabbar-close').click()
  await expect(page.getByTestId('tabbar-tab')).toHaveCount(0)
  await expect(page.getByRole('alertdialog', { name: /Save changes to/ })).toHaveCount(0)
  await expect(page.getByTestId('recent-files-home').getByTestId('home-draft')).toHaveCount(1)
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const request = indexedDB.open('kalka-recovery')
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
        const transaction = database.transaction('meta')
        const countRequest = transaction.objectStore('meta').count()
        return new Promise<number>((resolve, reject) => {
          countRequest.onsuccess = () => resolve(countRequest.result)
          countRequest.onerror = () => reject(countRequest.error)
        })
      })
    )
    .toBe(1)

  page.once('dialog', (dialog) => dialog.accept())
  await page.reload()
  await expect(page.getByRole('alertdialog', { name: 'Recover unsaved work' })).toBeVisible()
  await page.getByRole('button', { name: 'Restore' }).click()
  await expect(page.getByText('Retained recovery rectangle')).toBeVisible()

  await context.close()
})

test('a document discarded from the recovery dialog can be put back', async ({
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
  const recovery = page.getByRole('alertdialog', { name: 'Recover unsaved work' })
  await recovery.getByRole('button', { name: 'Discard' }).click()
  // The dialog stays with an Undo instead of losing the document on one click.
  await recovery.getByRole('button', { name: 'Undo' }).click()
  await recovery.getByRole('button', { name: 'Close', exact: true }).click()

  page.once('dialog', (dialog) => dialog.accept())
  await page.reload()
  await expect(
    page.getByRole('alertdialog', { name: 'Recover unsaved work' }).getByRole('button', {
      name: 'Restore'
    })
  ).toHaveCount(1)
  await context.close()
})
