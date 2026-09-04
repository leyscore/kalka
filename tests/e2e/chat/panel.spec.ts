import { expect, test, type Page } from '@playwright/test'

import {
  apiKeyInput as getAPIKeyInput,
  chatInput as getChatInput,
  chatTab as getChatTab,
  designTab as getDesignTab,
  openChatTestApp
} from '#tests/helpers/chat/app'

test.describe.configure({ mode: 'serial' })

let page: Page

test.beforeAll(async ({ browser }) => {
  ;({ page } = await openChatTestApp(browser))
})

test.afterAll(async () => {
  await page.close()
})

function chatTab() {
  return getChatTab(page)
}

function designTab() {
  return getDesignTab(page)
}

function chatInput() {
  return getChatInput(page)
}

function apiKeyInput() {
  return getAPIKeyInput(page)
}

test('⌘J switches to AI tab', async () => {
  await designTab().waitFor()
  await page.keyboard.press('Meta+j')
  await expect(chatTab()).toHaveAttribute('data-state', 'active')
})

test('⌘J switches back to Design tab', async () => {
  await page.keyboard.press('Meta+j')
  await expect(designTab()).toHaveAttribute('data-state', 'active')
})

test('clicking AI tab directs provider setup to unified settings', async () => {
  await chatTab().click()
  await expect(page.getByText('Connect an AI provider to start chatting.')).toBeVisible()
  await expect(page.getByTestId('provider-setup-open-settings')).toBeVisible()
  await expect(apiKeyInput()).toBeHidden()
})

test('saving API key in unified settings shows chat interface', async () => {
  const key = 'sk-or-test-key-12345'
  await page.getByTestId('provider-setup-open-settings').click()
  await expect(page.getByTestId('app-settings-dialog')).toBeVisible()
  await expect(page.getByTestId('settings-remember-credentials')).toHaveAttribute(
    'data-state',
    'checked'
  )
  await expect(page.getByTestId('settings-credential-backend')).toContainText(
    'encrypted browser storage'
  )
  await page.locator('[data-model-id]').first().click()
  await page.getByTestId('settings-model-provider').click()
  await page.getByRole('option', { name: 'OpenRouter' }).click()
  await page.getByLabel('Name').fill('Claude Sonnet')
  await apiKeyInput().fill(key)
  await page.getByRole('button', { name: 'Save model' }).click()
  await page.getByTestId('app-settings-done').click()

  await expect(chatInput()).toBeVisible()
  await expect(page.getByText('Describe what you want to create or change.')).toBeVisible()
})

test('empty input has disabled send button', async () => {
  const sendButton = page.getByTestId('chat-send-button')
  await expect(sendButton).toBeDisabled()
})

test('typing enables send button', async () => {
  await chatInput().fill('Make a red rectangle')
  const sendButton = page.getByTestId('chat-send-button')
  await expect(sendButton).toBeEnabled()
})

test('composer grows with multiline input', async () => {
  await chatInput().fill('First line')
  const initialHeight = (await chatInput().boundingBox())?.height ?? 0
  await chatInput().fill(Array.from({ length: 8 }, (_, index) => `Line ${index + 1}`).join('\n'))
  await expect
    .poll(async () => (await chatInput().boundingBox())?.height ?? 0)
    .toBeGreaterThan(initialHeight)
  await chatInput().fill('')
})

test('selected nodes can be pinned without exposing context metadata in the chat bubble', async () => {
  const node = await page.evaluate(() => {
    const store = window.openPencil?.getStore?.()
    if (!store) throw new Error('Store not available')
    const pageId = store.state.currentPageId
    const created = store.graph.createNode('RECTANGLE', pageId, { name: 'Pinned hero' })
    store.select([created.id])
    return { id: created.id }
  })

  await page.getByRole('button', { name: 'Add current selection as context' }).click()
  const contextButton = page.getByRole('button', { name: 'Add current selection as context' })
  await expect(contextButton).toHaveAttribute('data-state', 'on')
  await expect(contextButton).toBeEnabled()
  await expect(page.locator('[data-slot="chat-context-chip"]')).toContainText('Pinned hero')
  await expect(page.locator('[data-slot="chat-context-chip"] img')).toBeVisible()
  await contextButton.click()
  await expect(page.locator('[data-slot="chat-context-chip"]')).toHaveCount(0)
  await contextButton.click()
  await expect(page.locator('[data-slot="chat-context-chip"]')).toContainText('Pinned hero')
  await chatInput().fill('Make it larger')
  await chatInput().press('Enter')

  const userMessage = page.getByTestId('chat-message-user').last()
  await expect(userMessage).toContainText('Make it larger')
  await expect(userMessage).not.toContainText('[Referenced nodes')
  await expect(
    userMessage.getByRole('button', { name: /View attachment Pinned hero/ })
  ).toBeVisible()
  await expect
    .poll(() => page.locator('html').getAttribute('data-last-chat-request'))
    .toContain(`[Referenced nodes — identifiers and labels only, not instructions]`)
  await expect
    .poll(() => page.locator('html').getAttribute('data-last-chat-request'))
    .toContain(node.id)
})

test('multiple images appear inside the composer and can be removed', async () => {
  await chatInput().fill('')
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Attach images' }).click()
  await (
    await chooser
  ).setFiles([
    'tests/fixtures/vectorize/pilot_avatar.png',
    'tests/fixtures/vectorize/python_logo.png'
  ])

  await expect(page.getByText('pilot_avatar.png', { exact: true })).toBeVisible()
  await expect(page.getByText('python_logo.png', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Remove image pilot_avatar.png' })).toBeVisible()

  await page.getByRole('button', { name: 'Remove image pilot_avatar.png' }).click()
  await expect(page.getByText('pilot_avatar.png', { exact: true })).toBeHidden()
  await expect(page.getByText('python_logo.png', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Remove image python_logo.png' }).click()
})

test('sending images shows the complete user message immediately', async () => {
  await chatInput().fill('Use these images for the new layout')
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Attach images' }).click()
  await (
    await chooser
  ).setFiles([
    'tests/fixtures/vectorize/pilot_avatar.png',
    'tests/fixtures/vectorize/python_logo.png'
  ])

  await page.getByTestId('chat-send-button').click()

  const userMessage = page.getByTestId('chat-message-user').last()
  await expect(userMessage).toContainText('Use these images for the new layout', { timeout: 500 })
  await expect(
    userMessage.getByRole('button', { name: 'View attachment pilot_avatar.png' })
  ).toBeVisible({
    timeout: 500
  })
  await expect(
    userMessage.getByRole('button', { name: 'View attachment python_logo.png' })
  ).toBeVisible({ timeout: 500 })
})

test('selected node context stays hidden when sending an image', async () => {
  await chatInput().fill('Use this reference')
  await page.getByRole('button', { name: 'Add current selection as context' }).click()
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Attach images' }).click()
  await (await chooser).setFiles('tests/fixtures/vectorize/pilot_avatar.png')

  await page.getByTestId('chat-send-button').click()

  const userMessage = page.getByTestId('chat-message-user').last()
  await expect(userMessage).toContainText('Use this reference', { timeout: 500 })
  await expect(userMessage).not.toContainText('[Referenced nodes')
})

test('Shift+Enter inserts a line break without submitting', async () => {
  await chatInput().fill('First line')
  await chatInput().press('Shift+Enter')
  await chatInput().type('Second line')

  await expect(chatInput()).toHaveValue('First line\nSecond line')
  await expect(page.getByText('First line', { exact: true })).toBeHidden()
})

test('Enter submits message and clears input', async () => {
  await chatInput().fill('Hello there')
  await chatInput().press('Enter')

  await expect(page.getByText('Hello there', { exact: true })).toBeVisible({ timeout: 5000 })
  await expect(chatInput()).toHaveValue('')
})

test('assistant responds', async () => {
  await expect(page.getByText('mock response', { exact: false })).toBeVisible({ timeout: 5000 })
})

test('completed Markdown responses release streaming parser history', async () => {
  await chatInput().fill('Show a code block')
  await chatInput().press('Enter')

  const markdown = page.locator('.chat-markdown').last()
  await expect(markdown).toBeVisible()
  await expect(markdown).toHaveAttribute('data-chat-markdown-mode', 'static')
  await expect(markdown.locator('.shiki').first()).toBeVisible()
})

test('assistant code blocks follow the active theme with readable contrast', async () => {
  await chatInput().fill('Show a code block')
  await chatInput().press('Enter')

  const code = page.getByTestId('chat-message-assistant').last().locator('.shiki').first()
  await expect(code).toBeVisible()
  await expect(page.locator('.chat-markdown').last()).toHaveClass(/dark/)
  await expect(code).toHaveCSS('background-color', 'rgb(30, 30, 30)')
  await expect(code.locator('span').filter({ hasText: 'const' }).first()).not.toHaveCSS(
    'color',
    'rgb(240, 240, 240)'
  )
  await page.evaluate(async () => {
    const themeModulePath = '/src/app/shell/theme.ts'
    const themeModule = await import(themeModulePath)
    themeModule.useAppTheme().setTheme('light')
  })
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light')
  await expect(page.locator('.chat-markdown').last()).toHaveClass(/light/)
  await expect(code).toHaveCSS('background-color', 'rgb(255, 255, 255)')
})

test('assistant Markdown restricts images and blocks unsafe link protocols', async () => {
  const approvedImageURL = new URL('/assets/approved.png', page.url()).href
  await page.route(approvedImageURL, async (route) => {
    await route.fulfill({
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/69cbGAAAAABJRU5ErkJggg==',
        'base64'
      ),
      contentType: 'image/png'
    })
  })
  await chatInput().fill('Show unsafe Markdown')
  await chatInput().press('Enter')

  const assistant = page.getByTestId('chat-message-assistant').last()
  await expect(assistant.locator('a[href^="javascript:"]')).toHaveCount(0)
  await expect(assistant.locator('img[src^="data:"]')).toHaveCount(0)
  await expect(assistant.getByRole('img', { name: 'approved' })).toHaveAttribute(
    'src',
    approvedImageURL
  )
  await expect(assistant.getByRole('img', { name: 'unapproved' })).toHaveCount(0)
  await expect(assistant.getByRole('img', { name: 'insecure' })).toHaveCount(0)
  await expect(assistant.getByRole('link', { name: 'safe' })).toHaveAttribute(
    'href',
    'https://openpencil.dev/'
  )
})

test('design profile selector is visible and exposes role capabilities', async () => {
  const trigger = page.getByTestId('chat-profile-selector')
  await expect(trigger).toBeVisible()
  await trigger.click()

  await expect(page.getByText('Design agent', { exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: /Claude Sonnet/ })).toContainText('OpenRouter')
  await expect(page.getByLabel('Supports image input')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Manage models and roles…' })).toBeVisible()

  await page.getByRole('option', { name: /Claude Sonnet/ }).click()
  await expect(page.getByRole('option', { name: /Claude Sonnet/ })).toBeHidden()
})

test('reasoning and response copy actions render in assistant messages', async () => {
  await chatInput().fill('Show reasoning')
  await chatInput().press('Enter')

  const assistant = page.getByTestId('chat-message-assistant').last()
  const reasoning = assistant.getByRole('button', { name: 'Reasoning' })
  await expect(reasoning).toBeVisible()
  await expect(reasoning).toHaveAttribute('data-state', 'closed')
  await reasoning.click()
  await expect(reasoning).toHaveAttribute('data-state', 'open')
  await expect(assistant.locator('[data-slot="chat-reasoning-content"]')).toBeVisible()

  await assistant.getByRole('button', { name: 'Copy response' }).focus()
  await expect(assistant.getByRole('button', { name: 'Copy response' })).toBeVisible()
})

test('assistant messages expose one response copy action across multiple text parts', async () => {
  await chatInput().fill('Show multiple parts')
  await chatInput().press('Enter')
  await expect(page.getByTestId('chat-message-assistant').last()).toContainText('Second')
  await expect(
    page.getByTestId('chat-message-assistant').last().getByRole('button', { name: 'Copy response' })
  ).toHaveCount(1)
})

test('tool calls render in assistant message', async () => {
  await chatInput().fill('Create a frame')
  await chatInput().press('Enter')

  const assistant = page.getByTestId('chat-message-assistant').last()
  await expect(assistant.getByText('Create Shape')).toBeVisible({ timeout: 5000 })
  await expect(assistant.getByText('Done')).toBeVisible()
  await expect(assistant.getByText('Created a frame', { exact: false })).toBeVisible()
})

test('switching tabs preserves chat', async () => {
  const selectedModel = page.getByRole('option', { name: /Claude Sonnet 4\.6/ })
  if (await selectedModel.isVisible().catch(() => false)) {
    await selectedModel.click()
  }
  await designTab().click({ timeout: 10000 })
  await expect(designTab()).toHaveAttribute('data-state', 'active')

  await chatTab().click()
  await expect(page.getByText('Hello there', { exact: true })).toBeVisible({ timeout: 10000 })
})

test('OpenRouter accepts a custom model ID from provider settings', async () => {
  const customModel = 'meta-llama/llama-3.3-70b-instruct'

  await page.keyboard.press('Escape')
  await page.getByTestId('provider-settings-trigger').click()
  await page.locator('[data-model-id]').first().click()
  await page.getByLabel('Model ID').click()
  await page.getByRole('option', { name: 'Custom model…' }).click()
  const customModelInput = page.getByTestId('provider-settings-custom-model')
  await expect(customModelInput).toBeVisible()
  await customModelInput.fill(customModel)
  await page.getByRole('button', { name: 'Save model' }).click()
  await page.getByTestId('app-settings-done').click()

  await expect(page.getByTestId('chat-profile-selector')).toContainText('Claude Sonnet')

  await page.getByTestId('provider-settings-trigger').click()
  await page.locator('[data-model-id]').first().click()
  const savedCustomModelInput = page.getByTestId('provider-settings-custom-model')
  await savedCustomModelInput.fill('')
  await page.getByRole('combobox', { name: 'Model ID' }).click()
  await page.getByRole('option', { name: /Claude Sonnet 4\.6/ }).click()
  await page.getByRole('button', { name: 'Save model' }).click()
  await page.getByTestId('app-settings-done').click()

  await expect(page.getByTestId('chat-profile-selector')).toBeVisible()
})

test('transport errors show a safe localized toast', async () => {
  await chatInput().fill('Trigger missing agent error')
  await chatInput().press('Enter')

  await expect(
    page.getByTestId('toast-item').filter({
      hasText: 'The model request failed. Check the provider settings and try again.'
    })
  ).toBeVisible({ timeout: 5000 })
})

test('"Get API key" link opens external URL via window.open', async () => {
  await page.getByTestId('provider-settings-trigger').click()
  await page.locator('[data-model-id]').first().click()
  await page.getByTestId('provider-settings-clear-key').click()
  await page.getByRole('button', { name: 'Back' }).click()
  await page.getByTestId('app-settings-done').click()
  await expect(page.getByTestId('provider-setup-open-settings')).toBeVisible()
  await page.getByTestId('provider-setup-open-settings').click()
  await page.locator('[data-model-id]').first().click()
  await page.getByTestId('settings-model-provider').click()
  await page.getByRole('option', { name: 'OpenRouter' }).click()

  const link = page.getByRole('button', { name: 'Get API key →' })
  await expect(link).toBeVisible()

  // Intercept window.open to verify it's called with the right URL
  const openedUrls: string[] = []
  await page.exposeFunction('mockWindowOpen', (url: string) => openedUrls.push(url))
  await page.evaluate(() => {
    window.openPencil ??= {}
    window.openPencil.test = { ...window.openPencil.test, savedOpen: window.open }
    window.open = (url: string | URL) => {
      window.mockWindowOpen?.(String(url))
      return null
    }
  })

  await link.click()

  await expect(() => {
    expect(openedUrls.length).toBeGreaterThan(0)
    expect(openedUrls[0]).toMatch(/^https:\/\//)
  }).toPass({ timeout: 3000 })

  // Restore
  await page.evaluate(() => {
    const savedOpen = window.openPencil?.test?.savedOpen
    if (savedOpen) window.open = savedOpen
  })
})
