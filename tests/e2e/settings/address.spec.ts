import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('Settings has an address that Back, Forward and a typed link follow', async ({ page }) => {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  const settings = page.getByTestId('app-settings')

  await page.getByTestId('app-settings-trigger').click()
  await expect(settings).toBeVisible()
  await expect(page).toHaveURL(/\/settings\/general\?test/)

  await page.getByTestId('settings-section-ai').click()
  await expect(page).toHaveURL(/\/settings\/ai\?test/)

  await page.goBack()
  await expect(settings).toBeHidden()
  await expect(page).not.toHaveURL(/\/settings/)

  await page.goForward()
  await expect(settings).toBeVisible()
  await expect(page.getByTestId('settings-ai-panel')).toBeVisible()

  await page.getByTestId('app-settings-back').click()
  await expect(settings).toBeHidden()
  await expect(page).not.toHaveURL(/\/settings/)

  await page.goto('/settings/media?test')
  await new CanvasHelper(page).waitForInit()
  await expect(settings).toBeVisible()
  await expect(page.getByTestId('settings-section-media')).toHaveAttribute('data-state', 'active')
})
