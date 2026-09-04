import { expect, test } from '@playwright/test'

import { chatInput, chatTab, configureOpenRouter, openChatTestApp } from '#tests/helpers/chat/app'

const apiKey = process.env.OPENROUTER_API_KEY ?? ''

test.describe('OpenRouter chat @real-llm', () => {
  test.skip(!apiKey, 'OPENROUTER_API_KEY is required for real LLM smoke tests')

  test('streams a Markdown response from the configured Design model', async ({ browser }) => {
    const { page } = await openChatTestApp(browser, { mockTransport: false })
    try {
      await chatTab(page).click()
      await configureOpenRouter(page, apiKey)
      await chatInput(page).fill(
        'Reply with a short Markdown heading and a TypeScript code block declaring const ready = true. Do not call tools.'
      )
      await chatInput(page).press('Enter')

      const assistant = page.getByTestId('chat-message-assistant').last()
      await expect(assistant.locator('.chat-markdown')).toBeVisible({ timeout: 60_000 })
      await expect(assistant.locator('.shiki')).toContainText('const ready = true', {
        timeout: 60_000
      })
      await expect(assistant.locator('.chat-markdown')).toHaveAttribute(
        'data-chat-markdown-mode',
        'static'
      )
    } finally {
      await page.close()
    }
  })
})
