import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('settings tabs associate panels and support vertical keyboard navigation', async ({
  page
}) => {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  await page.getByTestId('app-settings-trigger').click()
  const dialog = page.getByTestId('app-settings')
  const general = dialog.getByRole('tab', { name: 'General', exact: true })
  for (const tab of await dialog.getByRole('tab').all()) {
    await expect(tab).toHaveCSS('cursor', 'pointer')
  }
  await expect(general).toHaveAttribute('aria-selected', 'true')
  await expect(dialog).toHaveScreenshot('settings-tabs-general.png')
  await general.focus()
  await general.press('ArrowDown')
  const storage = page.getByTestId('settings-section-storage')
  await expect(storage).toBeFocused()
  await expect(storage).toHaveAttribute('aria-selected', 'true')
  await expect(dialog.getByRole('tabpanel')).toHaveCount(1)
  await expect(page.getByTestId('settings-storage-panel')).toBeVisible()
  await expect(dialog.getByRole('tabpanel')).toHaveAttribute(
    'aria-labelledby',
    (await storage.getAttribute('id')) ?? ''
  )
  await storage.press('Home')
  await expect(general).toBeFocused()
  await expect(page.getByTestId('settings-general-panel')).toBeVisible()
  await general.press('End')
  await expect(dialog.getByRole('tab').last()).toBeFocused()
  await page.getByTestId('app-settings-back').click()
  await expect(dialog).not.toBeVisible()
})
