import type { Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'
import { expect, test } from '#tests/helpers/chat/fixture'

/**
 * The document's own agent and the canvas: / asks it about the selection, and a comment that
 * mentions @agent is sent to it, with its answer landing in the thread.
 */

async function selectCard(page: Page): Promise<string> {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Store not available')
    const node = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Pricing card',
      x: 40,
      y: 40,
      width: 320,
      height: 200
    })
    store.select([node.id])
    return node.id
  })
}

test('/ opens the agent with the selection attached and the field ready', async ({
  configuredChat: chat
}) => {
  await selectCard(chat.page)
  // From the canvas, not the conversation's own field.
  await chat.page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  })
  await chat.page.keyboard.press('/')

  await expect(chat.input).toBeVisible()
  await expect(chat.input).toBeFocused()
  await expect(chat.page.locator('[data-slot="chat-context-chip"]')).toBeVisible()
})

test('a comment mentioning @agent is sent to it, and its answer lands in the thread', async ({
  configuredChat: chat
}) => {
  const page = chat.page
  await selectCard(page)
  await page.evaluate(() => window.kalka?.getStore?.()?.clearSelection())
  const view = await page.evaluate(() => {
    const state = window.kalka?.getStore?.()?.state
    return state ? { panX: state.panX, panY: state.panY, zoom: state.zoom } : null
  })
  if (!view) throw new Error('No editor')

  await page.locator('[data-slot="comment-tool"]').click()
  await new CanvasHelper(page).click(120 * view.zoom + view.panX, 100 * view.zoom + view.panY)
  const thread = page.locator('[data-slot="comment-thread"]')
  await thread.getByRole('textbox').fill('@agent make the title warmer')
  await thread.getByRole('textbox').press('ControlOrMeta+Enter')

  // The agent's conversation shows the request as written; the model gets where and how to answer.
  await expect(chat.userMessage()).toContainText('make the title warmer')
  await expect
    .poll(() => page.locator('html').getAttribute('data-last-chat-request'))
    .toContain('reply_to_comment')

  const pin = page.locator('[data-slot="comment-pin"]')
  await expect(pin).toHaveAttribute('data-state', 'answered')
  // The thread is still open from posting, and shows the answer.
  await expect(thread.locator('[data-author="agent"]')).toContainText('mock response')
})
