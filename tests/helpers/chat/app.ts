import type { Browser, Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'
import { injectMockChatTransport } from '#tests/helpers/chat/transport'

const USE_REAL_LLM = process.env.TEST_REAL_LLM === '1'
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? ''

export interface ChatTestApp {
  page: Page
  canvas: CanvasHelper
}

export async function openChatTestApp(browser: Browser): Promise<ChatTestApp> {
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
  if (!USE_REAL_LLM) await injectMockChatTransport(page)
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

export async function configureChat(page: Page): Promise<void> {
  const key = USE_REAL_LLM ? OPENROUTER_KEY : 'sk-or-test-key-12345'
  await chatTab(page).click()
  await page.getByTestId('provider-setup-open-settings').click()
  await page.locator('[data-model-id]').first().click()
  await page.getByTestId('settings-model-provider').click()
  await page.getByRole('option', { name: 'OpenRouter' }).click()
  await page.getByLabel('Name').fill('Claude Sonnet')
  await apiKeyInput(page).fill(key)
  await page.getByRole('button', { name: 'Save model' }).click()
  await page.getByTestId('app-settings-done').click()
  await chatInput(page).waitFor()
}

export { USE_REAL_LLM }
