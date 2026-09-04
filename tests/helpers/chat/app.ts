import type { Browser, Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'
import { injectMockChatTransport } from '#tests/helpers/chat/transport'

export interface ChatTestApp {
  page: Page
  canvas: CanvasHelper
}

export async function openChatTestApp(
  browser: Browser,
  options: { mockTransport?: boolean } = {}
): Promise<ChatTestApp> {
  const page = await browser.newPage()
  await page.goto('/')
  await page.evaluate(async () => {
    const themeModulePath = '/src/app/shell/theme.ts'
    const themeModule = await import(themeModulePath)
    themeModule.useAppTheme().setTheme('dark')
  })
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  if (options.mockTransport !== false) await injectMockChatTransport(page)
  return { page, canvas }
}

export function chatInput(page: Page) {
  return page.getByRole('textbox', { name: 'Describe a change' })
}

export function chatTab(page: Page) {
  return page.getByRole('tab', { name: 'AI' })
}

export function designTab(page: Page) {
  return page.getByRole('tab', { name: 'Design' })
}

export function apiKeyInput(page: Page) {
  return page.getByTestId('provider-settings-api-key')
}

export async function configureOpenRouter(page: Page, apiKey: string): Promise<void> {
  await chatTab(page).click()
  await page.getByTestId('provider-setup-open-settings').click()
  await page.locator('[data-model-id]').first().click()
  await page.getByTestId('settings-model-provider').click()
  await page.getByRole('option', { name: 'OpenRouter' }).click()
  await page.getByLabel('Name').fill('Claude Sonnet')
  await apiKeyInput(page).fill(apiKey)
  await page.getByRole('button', { name: 'Save model' }).click()
  await page.getByTestId('app-settings-done').click()
  await chatInput(page).waitFor()
}
