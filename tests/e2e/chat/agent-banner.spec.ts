import { expect, test } from '#tests/helpers/chat/fixture'

test('the agent says it is not connected until a provider is, then that it is ready', async ({
  chat
}) => {
  await chat.chatTab.click()
  const banner = chat.page.locator('[data-slot="chat-agent-banner"]')
  await expect(banner).toHaveAttribute('data-state', 'offline')
  await expect(banner).toContainText('Not connected')

  // Setup opens the AI panel itself.
  await chat.page.getByRole('tab', { name: 'Layers' }).click()
  await chat.configureOpenRouter('sk-or-test-key-12345')
  await expect(banner).toHaveAttribute('data-state', 'ready')
  await expect(banner).toContainText('Ready')
})
