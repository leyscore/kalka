import { expect, test } from '#tests/e2e/fixtures'
import { CanvasHelper } from '#tests/helpers/canvas'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Editor unavailable')
    store.createShape('RECTANGLE', 100, 100, 100, 100)
  })
  await expect(
    page.getByRole('tab').filter({ has: page.getByRole('img', { name: 'Unsaved changes' }) })
  ).toBeVisible()
})

test('Cancel retains the dirty document and recovery does not mark it saved', async ({ page }) => {
  await page.evaluate(async () => {
    await window.kalka?.getStore?.().persistRecoveryNow()
  })
  await page.getByTestId('tabbar-close').click()
  const dialog = page.getByRole('alertdialog', { name: /Save changes to/ })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeFocused()
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('img', { name: 'Unsaved changes' })).toBeVisible()
  expect(await page.evaluate(() => window.kalka?.getStore?.().hasUnsavedChanges())).toBe(true)
})

test('Escape cancels the close and keeps focus inside the dialog', async ({ page }) => {
  await page.getByTestId('tabbar-close').click()
  const dialog = page.getByRole('alertdialog', { name: /Save changes to/ })
  await expect(dialog).toBeVisible()
  // Focus stays trapped among the dialog's answers.
  for (let step = 0; step < 4; step++) {
    await page.keyboard.press('Tab')
    await expect(dialog.locator(':focus')).toHaveCount(1)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('img', { name: 'Unsaved changes' })).toBeVisible()
})

test('Return answers Save', async ({ page }) => {
  const picker = await page.evaluateHandle(() => {
    const original = window.showSaveFilePicker
    const state = {
      calls: 0,
      restore: () => {
        window.showSaveFilePicker = original
      }
    }
    window.showSaveFilePicker = async () => {
      state.calls++
      throw new DOMException('Cancelled', 'AbortError')
    }
    return state
  })
  try {
    await page.getByTestId('tabbar-close').click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.keyboard.press('Enter')
    await expect.poll(() => picker.evaluate((state) => state.calls)).toBe(1)
  } finally {
    await picker.evaluate((handle) => handle.restore())
    await picker.dispose()
  }
})

test('Don’t Save closes the document', async ({ page }) => {
  await page.getByTestId('tabbar-close').click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Don’t Save', exact: true })
    .click()
  await expect(page.getByTestId('recent-files-home')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Unsaved changes' })).not.toBeVisible()
})

test('cancelling the Save file picker keeps the dirty document open', async ({ page }) => {
  const picker = await page.evaluateHandle(() => {
    const original = window.showSaveFilePicker
    const state = {
      calls: 0,
      restore: () => {
        window.showSaveFilePicker = original
      }
    }
    window.showSaveFilePicker = async () => {
      state.calls++
      throw new DOMException('Cancelled', 'AbortError')
    }
    return state
  })
  try {
    await page.getByTestId('tabbar-close').click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Save', exact: true }).click()
    await expect.poll(() => picker.evaluate((state) => state.calls)).toBe(1)
    await expect(page.getByRole('alertdialog')).not.toBeVisible()
    await expect(page.getByRole('img', { name: 'Unsaved changes' })).toBeVisible()
  } finally {
    await picker.evaluate((handle) => handle.restore())
    await picker.dispose()
  }
})

test('Save downloads the document before closing when the file API is unavailable', async ({
  page
}) => {
  const picker = await page.evaluateHandle(() => {
    const original = window.showSaveFilePicker
    window.showSaveFilePicker = undefined
    return {
      restore: () => {
        window.showSaveFilePicker = original
      }
    }
  })
  try {
    await page.getByTestId('tabbar-close').click()
    page.once('dialog', (dialog) => dialog.accept('Saved-before-close.fig'))
    const download = page.waitForEvent('download')
    await page.getByRole('alertdialog').getByRole('button', { name: 'Save', exact: true }).click()
    expect((await download).suggestedFilename()).toBe('Saved-before-close.fig')
    await expect(page.getByTestId('recent-files-home')).toBeVisible()
  } finally {
    await picker.evaluate((handle) => handle.restore())
    await picker.dispose()
  }
})

test('browser reload warns about unsaved work', async ({ page }) => {
  // Browsers require a trusted interaction before showing a beforeunload prompt.
  await page.getByTestId('tabbar-close').click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).click()
  const dialogPromise = page.waitForEvent('dialog')
  const reload = page.evaluate(() => window.location.reload())
  const dialog = await dialogPromise
  expect(dialog.type()).toBe('beforeunload')
  await dialog.dismiss()
  await reload
  await expect(page.getByRole('img', { name: 'Unsaved changes' })).toBeVisible()
})
