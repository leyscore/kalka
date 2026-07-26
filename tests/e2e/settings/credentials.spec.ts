import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('remembered browser credentials survive reload and clear centrally', async ({ page }) => {
  await page.goto('/?test')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()

  await page.getByRole('tab', { name: 'AI' }).click()
  await page.getByTestId('provider-setup-open-settings').click()

  const remember = page.getByTestId('settings-remember-credentials')
  await expect(remember).toHaveAttribute('data-state', 'unchecked')
  await remember.click()
  await expect(remember).toHaveAttribute('data-state', 'checked')
  await expect(page.getByTestId('settings-credential-backend')).toContainText(
    'encrypted browser storage'
  )

  await page.getByTestId('settings-ai-provider').click()
  await page.getByRole('option', { name: 'OpenRouter' }).click()
  await page.getByTestId('provider-settings-api-key').fill('sk-or-remembered-test-key')
  await page.getByTestId('app-settings-done').click()
  await expect(page.getByTestId('chat-input')).toBeVisible()

  await page.reload()
  await canvas.waitForInit()
  await page.getByRole('tab', { name: 'AI' }).click()
  await expect(page.getByTestId('chat-input')).toBeVisible()

  await page.getByTestId('app-settings-trigger').click()
  await page.getByTestId('provider-settings-clear-key').click()
  await page.getByTestId('settings-remember-credentials').click()
  await page.getByTestId('app-settings-done').click()

  await page.reload()
  await canvas.waitForInit()
  await page.getByRole('tab', { name: 'AI' }).click()
  await expect(page.getByTestId('provider-setup-open-settings')).toBeVisible()
})
