import { expect, test, type Page } from '@playwright/test'
import * as v from 'valibot'

import { CanvasHelper } from '#tests/helpers/canvas'

/**
 * Comments as a person and an agent use them: C pins a thread on a layer, a mention asks the
 * agent, an agent connected over MCP takes the request and answers in the thread, and the panel
 * lists threads open and resolved.
 */

const ToolReply = v.object({ ok: v.literal(true), result: v.unknown() })

async function callAsAgent(page: Page, name: string, args: Record<string, unknown>) {
  const reply = await page.evaluate(
    (call) =>
      window.kalka?.test?.automation?.('tool', {
        ...call,
        agent: { session: 'comment-session', kind: 'mcp', client: 'claude-code' }
      }),
    { name, args }
  )
  return v.parse(ToolReply, reply).result
}

const Threads = v.object({
  threads: v.array(
    v.object({ id: v.string(), asks_agent: v.optional(v.string()), messages: v.array(v.unknown()) })
  )
})

async function open(page: Page) {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  const reply = await page.evaluate(() =>
    window.kalka?.test?.automation?.('tool', {
      name: 'write_html',
      args: {
        html: '<div style="width: 360px; height: 220px; background: #F4EFE6; padding: 24px"><h2 style="margin: 0">Pricing</h2></div>',
        x: 40,
        y: 40
      }
    })
  )
  return v.parse(
    v.object({ result: v.object({ layers: v.array(v.object({ id: v.string() })) }) }),
    reply
  ).result.layers[0].id
}

/** Where a point of the page is on the canvas element, at the current pan and zoom. */
async function canvasPoint(page: Page, x: number, y: number) {
  const view = await page.evaluate(() => {
    const state = window.kalka?.getStore?.()?.state
    return state ? { panX: state.panX, panY: state.panY, zoom: state.zoom } : null
  })
  if (!view) throw new Error('No editor')
  return { x: x * view.zoom + view.panX, y: y * view.zoom + view.panY }
}

async function comment(page: Page, x: number, y: number, text: string) {
  const canvas = new CanvasHelper(page)
  await page.keyboard.press('c')
  await expect(page.locator('[data-slot="comment-placement"]')).toBeVisible()
  const point = await canvasPoint(page, x, y)
  await canvas.click(point.x, point.y)
  const thread = page.locator('[data-slot="comment-thread"]')
  await thread.getByRole('textbox').fill(text)
  await thread.getByRole('textbox').press('ControlOrMeta+Enter')
}

const pins = (page: Page) => page.locator('[data-slot="comment-pin"]')

test('C pins a comment on a layer, which moves with it', async ({ page }) => {
  const cardId = await open(page)
  await comment(page, 120, 100, 'Tighten the spacing under the title')

  await expect(pins(page)).toHaveCount(1)
  await expect(pins(page)).toHaveAttribute('data-state', 'note')
  await expect(page.locator('[data-slot="comment-thread"]')).toContainText(
    'Tighten the spacing under the title'
  )
  // Posting leaves comment mode; Escape closes the thread.
  await expect(page.locator('[data-slot="comment-placement"]')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-slot="comment-thread"]')).toHaveCount(0)

  const before = await pins(page).boundingBox()
  await callAsAgent(page, 'update_node', { id: cardId, x: 140 })
  await expect
    .poll(async () => ((await pins(page).boundingBox())?.x ?? 0) - (before?.x ?? 0))
    .toBeGreaterThan(50)

  // Shift+C hides the pins and shows them again.
  await page.keyboard.press('Shift+C')
  await expect(pins(page)).toHaveCount(0)
  await page.keyboard.press('Shift+C')
  await expect(pins(page)).toHaveCount(1)
})

test('a request to the agent waits on its pin until an MCP agent takes it and answers', async ({
  page
}) => {
  await open(page)
  await comment(page, 120, 100, '@agent make the title warmer')
  await expect(pins(page)).toHaveAttribute('data-state', 'waiting')
  await page.keyboard.press('Escape')

  // The agent's next call brings the request with it, and the pin shows it is being handled.
  const next = v.parse(
    v.object({ comments_for_you: v.object({ threads: v.array(v.object({ id: v.string() })) }) }),
    await callAsAgent(page, 'get_page_tree', {})
  )
  const [request] = next.comments_for_you.threads
  await expect(pins(page)).toHaveAttribute('data-state', 'working')

  await callAsAgent(page, 'reply_to_comment', {
    thread_id: request.id,
    text: 'Title is now warm brown #3F2D10.'
  })
  await expect(pins(page)).toHaveAttribute('data-state', 'answered')
  await pins(page).click()
  const thread = page.locator('[data-slot="comment-thread"]')
  await expect(thread.locator('[data-author="agent"]')).toContainText('#3F2D10')

  // Read again, nothing waits: the request was handed over once.
  const read = v.parse(Threads, await callAsAgent(page, 'get_comments', {}))
  expect(read.threads.map((item) => item.asks_agent)).toEqual(['answered'])
})

test('the panel lists threads open and resolved, and resolving one moves it', async ({ page }) => {
  await open(page)
  await comment(page, 120, 100, 'First note')
  await page.keyboard.press('Escape')
  await comment(page, 300, 200, 'Second note')

  await page.getByTestId('left-panel-comments-tab').click()
  const panel = page.locator('[data-slot="comments-panel"]')
  await expect(panel.locator('[data-slot="comments-panel-thread"]')).toHaveCount(2)

  // The open thread is the second; resolve it from its card.
  const thread = page.locator('[data-slot="comment-thread"]')
  await thread.locator('button').first().click()
  await expect(panel.locator('[data-slot="comments-panel-thread"]')).toHaveCount(1)
  await panel.getByRole('tab').nth(1).click()
  await expect(panel.locator('[data-slot="comments-panel-thread"]')).toContainText('Second note')

  // Choosing a thread in the panel opens it on the canvas.
  await panel.getByRole('tab').nth(0).click()
  await page.keyboard.press('Escape')
  await panel.locator('[data-slot="comments-panel-thread"]').click()
  await expect(thread).toContainText('First note')
})
