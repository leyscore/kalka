import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

/**
 * Comments between people: a reaction on a message, a mention of someone, and what is unread for
 * whoever is mentioned or answered, on the pin, the comment tool and the panel's For you tab.
 */

async function open(page: Page) {
  await page.addInitScript(() => {
    // oxlint-disable-next-line kalka/no-direct-storage-access -- Names this person before the app loads.
    localStorage.setItem('op-collab-name', 'Ada')
  })
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
}

async function comment(page: Page, text: string) {
  await page.keyboard.press('c')
  const box = await page.locator('[data-slot="comment-placement"]').boundingBox()
  if (!box) throw new Error('No comment placement')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  const thread = page.locator('[data-slot="comment-thread"]')
  await thread.getByRole('textbox').fill(text)
  await thread.getByRole('textbox').press('Enter')
  return thread
}

/** Someone else answers in the first thread, as a room would bring their message. */
async function replyAsGrace(page: Page, text: string, mentions: string[]) {
  await page.evaluate(
    ({ text, mentions }) => {
      const store = window.kalka?.getStore?.()
      if (!store) throw new Error('No editor')
      const root = store.graph.getNode(store.graph.rootId)
      const [first, ...rest] = root?.comments ?? []
      if (!first) throw new Error('No thread')
      const message = {
        id: 'grace-reply',
        author: { kind: 'person' as const, name: 'Grace' },
        text,
        createdAt: Date.now(),
        mentions
      }
      store.graph.updateNode(store.graph.rootId, {
        comments: [{ ...first, messages: [...first.messages, message] }, ...rest]
      })
    },
    { text, mentions }
  )
}

test('a reaction is given and taken back from the thread', async ({ page }) => {
  await open(page)
  const thread = await comment(page, 'Shall we use the warmer beige?')

  await thread.getByTestId('comment-add-reaction').click()
  await thread.locator('[data-slot="comment-reaction-picker"] [data-emoji="👍"]').click()
  const reaction = thread.locator('[data-slot="comment-reaction"][data-emoji="👍"]')
  await expect(reaction).toHaveAttribute('aria-pressed', 'true')
  await expect(reaction).toContainText('1')

  await reaction.click()
  await expect(reaction).toHaveCount(0)
})

test('a mention of someone reaches them as unread until they open the thread', async ({ page }) => {
  await open(page)
  const thread = await comment(page, 'Pricing title feels heavy')
  await page.keyboard.press('Escape')
  await expect(thread).toHaveCount(0)

  await replyAsGrace(page, '@Ada agreed, lighter weight?', ['Ada'])

  await expect(page.getByText('Grace mentioned you', { exact: false })).toBeVisible()
  const pin = page.locator('[data-slot="comment-pin"]')
  await expect(pin).toHaveAttribute('data-unread', 'true')
  await expect(page.locator('[data-slot="comment-tool-unread"]')).toBeVisible()

  await page.getByTestId('left-panel-comments-tab').click()
  const panel = page.locator('[data-slot="comments-panel"]')
  await panel.getByRole('tab', { name: 'For you' }).click()
  await expect(panel.locator('[data-slot="comments-panel-thread"]')).toHaveCount(1)

  await panel.locator('[data-slot="comments-panel-thread"]').click()
  await expect(page.locator('[data-slot="comment-thread"]')).toContainText('lighter weight')
  await expect(pin).not.toHaveAttribute('data-unread', 'true')
  await expect(page.locator('[data-slot="comment-tool-unread"]')).toHaveCount(0)
})

test('typing @ offers the people of the document to mention', async ({ page }) => {
  await open(page)
  await comment(page, 'First note')
  await replyAsGrace(page, 'Seen it', [])
  const thread = page.locator('[data-slot="comment-thread"]')
  await thread.getByRole('textbox').fill('@Gr')
  await thread.locator('[data-slot="comment-people"] [data-person="Grace"]').click()
  await expect(thread.getByRole('textbox')).toHaveValue('@Grace ')
})
