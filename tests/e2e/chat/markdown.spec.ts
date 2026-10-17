import { toUint8Array } from 'js-base64'

import { expect, test } from '#tests/helpers/chat/fixture'

test('completed responses release streaming parser history', async ({ configuredChat: chat }) => {
  await chat.submit('Show a code block')

  const markdown = chat.page.locator('[data-slot="chat-markdown"] .markdown-content').last()
  await expect(markdown).toHaveAttribute('data-markdown-mode', 'static')
  await expect(markdown.locator('.shiki').first()).toBeVisible()
})

test('code blocks follow light and dark themes', async ({ configuredChat: chat }) => {
  await chat.submit('Show a code block')
  const code = chat.assistantMessage().locator('.shiki').first()
  const keyword = code.locator('span').filter({ hasText: 'const' }).first()
  /** The app's field color in the current theme, which code blocks sit on instead of Shiki's. */
  const fieldColor = () =>
    chat.page.evaluate(() => {
      const probe = document.createElement('div')
      probe.style.backgroundColor = 'var(--color-input)'
      document.body.append(probe)
      const color = getComputedStyle(probe).backgroundColor
      probe.remove()
      return color
    })
  const colors = async () => ({
    background: await code.evaluate((element) => getComputedStyle(element).backgroundColor),
    keyword: await keyword.evaluate((element) => getComputedStyle(element).color)
  })

  await expect(code).toHaveCSS('background-color', await fieldColor())
  const dark = await colors()

  await chat.page.evaluate(async () => {
    const themeModulePath = '/src/app/shell/theme.ts'
    const themeModule = await import(themeModulePath)
    themeModule.useAppTheme().setTheme('light')
  })
  await chat.page.waitForFunction(() => document.documentElement.dataset.theme === 'light')
  await expect(
    chat.page.locator('[data-slot="chat-markdown"] .markdown-content').last()
  ).toHaveClass(/light/)
  await expect(code).toHaveCSS('background-color', await fieldColor())
  const light = await colors()
  expect(light.background).not.toBe(dark.background)
  expect(light.keyword).not.toBe(dark.keyword)
})

test('Markdown blocks unsafe links and cross-origin images', async ({ configuredChat: chat }) => {
  const approvedImageURL = new URL('/assets/approved.png', chat.page.url()).href
  await chat.page.route(approvedImageURL, async (route) => {
    await route.fulfill({
      body: Buffer.from(
        toUint8Array(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/69cbGAAAAABJRU5ErkJggg=='
        )
      ),
      contentType: 'image/png'
    })
  })
  await chat.submit('Show unsafe Markdown')

  const assistant = chat.assistantMessage()
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
    'https://kalka.design/'
  )
})

test('tables read as part of the reply, with copy as their only action', async ({
  configuredChat: chat
}) => {
  await chat.submit('Show a markdown table')
  const assistant = chat.assistantMessage()
  const cell = assistant.getByRole('cell', { name: 'Hover', exact: true })
  await expect(cell).toHaveCSS('font-weight', '400')
  await expect(cell).toHaveCSS('font-size', '11px')
  const controls = assistant.locator('[data-stream-markdown="table-controls"] button')
  await expect(controls).toHaveCount(1)
  // Links show no favicon: that would request `/favicon.ico` from every linked site.
  await expect(assistant.getByRole('link', { name: 'the guide' })).toBeVisible()
  await expect(assistant.locator('[data-stream-markdown="link-favicon"]')).toHaveCount(0)
})
