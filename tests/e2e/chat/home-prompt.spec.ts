import type { Page } from '@playwright/test'

import { expect, test } from '#tests/helpers/chat/fixture'

async function openHomePrompt(page: Page) {
  await page.getByTestId('tabbar-new').click()
  const home = page.getByTestId('recent-files-home')
  await expect(home).toBeVisible()
  return {
    home,
    prompt: home.getByRole('textbox', { name: 'Ask your agent for a design' }),
    generate: home.getByRole('button', { name: 'Generate' })
  }
}

test('Generate on Home opens a new document and sends the prompt to its chat', async ({
  configuredChat: chat
}) => {
  const { home, prompt, generate } = await openHomePrompt(chat.page)

  await prompt.fill('A pricing page for a coffee shop')
  await generate.click()

  await expect(home).toBeHidden()
  await expect(chat.chatTab).toHaveAttribute('data-state', 'active')
  await expect(chat.userMessage()).toHaveText('A pricing page for a coffee shop')
  await expect(chat.assistantMessage()).toBeVisible()
})

test('Generate on Home without a model offers AI setup and keeps the prompt', async ({ chat }) => {
  const { prompt, generate } = await openHomePrompt(chat.page)

  await prompt.fill('A portfolio for a photographer')
  await generate.click()

  const setup = chat.page.getByTestId('ai-setup-dialog')
  await expect(setup).toBeVisible()
  await chat.page.keyboard.press('Escape')
  await expect(setup).toBeHidden()
  await expect(prompt).toHaveValue('A portfolio for a photographer')
})
