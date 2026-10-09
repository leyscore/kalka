import { expect, test } from '#tests/helpers/chat/fixture'

test('Generate on Home opens a new document and sends the prompt to its chat', async ({
  configuredChat: chat
}) => {
  const { page } = chat
  await page.getByTestId('tabbar-new').click()
  await expect(page.getByTestId('recent-files-home')).toBeVisible()

  await page.getByTestId('home-prompt-input').fill('A pricing page for a coffee shop')
  await page.getByTestId('home-prompt-submit').click()

  await expect(page.getByTestId('recent-files-home')).toBeHidden()
  await expect(chat.chatTab).toHaveAttribute('data-state', 'active')
  await expect(chat.userMessage()).toHaveText('A pricing page for a coffee shop')
  await expect(chat.assistantMessage()).toContainText('A pricing page for a coffee shop')
})

test('Generate on Home without a model offers AI setup and keeps the prompt', async ({ chat }) => {
  const { page } = chat
  await page.getByTestId('tabbar-new').click()
  await expect(page.getByTestId('recent-files-home')).toBeVisible()

  await page.getByTestId('home-prompt-input').fill('A portfolio for a photographer')
  await page.getByTestId('home-prompt-submit').click()

  await expect(page.getByTestId('ai-setup-dialog')).toBeVisible()
  await expect(page.getByTestId('home-prompt-input')).toHaveValue('A portfolio for a photographer')
})
