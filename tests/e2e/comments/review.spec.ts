import { expect, test, type Page } from '@playwright/test'
import * as v from 'valibot'

import { CanvasHelper } from '#tests/helpers/canvas'

/**
 * Reviewing what agents made: a frame marked ready for development goes back to needing review
 * when an agent changes it, and an agent's change can be put back from its list, undoably.
 */

const ToolReply = v.object({ ok: v.literal(true), result: v.unknown() })

async function callAsAgent(page: Page, name: string, args: Record<string, unknown>) {
  const reply = await page.evaluate(
    (call) =>
      window.kalka?.test?.automation?.('tool', {
        ...call,
        agent: { session: 'review-session', kind: 'mcp', client: 'claude-code' }
      }),
    { name, args }
  )
  return v.parse(ToolReply, reply).result
}

const Layers = v.object({ layers: v.array(v.object({ id: v.string() })) })

async function open(page: Page) {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
}

async function screenPoint(page: Page, x: number, y: number) {
  const box = await page.getByTestId('canvas-element').boundingBox()
  const view = await page.evaluate(() => {
    const state = window.kalka?.getStore?.()?.state
    return state ? { panX: state.panX, panY: state.panY, zoom: state.zoom } : null
  })
  if (!box || !view) throw new Error('No canvas')
  return { x: box.x + x * view.zoom + view.panX, y: box.y + y * view.zoom + view.panY }
}

test('a frame marked ready needs review again once an agent changes it', async ({ page }) => {
  await open(page)
  const frame = v.parse(
    Layers,
    await callAsAgent(page, 'write_html', {
      html: '<div style="width: 320px; height: 200px; background: #F4EFE6; padding: 20px"><h2 style="margin: 0">Pricing</h2></div>',
      x: 40,
      y: 40
    })
  ).layers[0].id

  const point = await screenPoint(page, 200, 160)
  // Anything inside the frame offers to approve the frame.
  await page.mouse.click(point.x, point.y, { button: 'right' })
  await page.getByTestId('context-frame-review').click()

  const badge = page.locator('[data-slot="frame-review-badge"]')
  await expect(badge).toHaveAttribute('data-status', 'ready')
  const reviews = v.object({
    frames: v.array(v.object({ id: v.string(), status: v.string() }))
  })
  expect(v.parse(reviews, await callAsAgent(page, 'get_frame_reviews', {})).frames).toEqual(
    [{ id: frame, status: 'ready' }].map((item) => expect.objectContaining(item))
  )

  await callAsAgent(page, 'write_html', { parent_id: frame, html: '<p>New line</p>' })
  await expect(badge).toHaveAttribute('data-status', 'review')
})

test("an agent's change can be put back from its list, and undo takes that back", async ({
  page
}) => {
  await open(page)
  const written = v.parse(
    Layers,
    await callAsAgent(page, 'write_html', {
      html: '<section style="width: 400px; height: 160px; background: #3F2D10"></section>',
      x: 0,
      y: 0
    })
  ).layers[0].id

  await page.getByTestId('left-panel-comments-tab').click()
  const panel = page.locator('[data-slot="comments-panel"]')
  await panel.getByRole('tab').nth(3).click()
  const change = panel.locator('[data-slot="agent-change"]')
  await expect(change).toHaveCount(1)

  const exists = () =>
    page.evaluate((id) => !!window.kalka?.getStore?.()?.graph.getNode(id), written)
  await change.getByRole('button').click()
  await expect.poll(exists).toBe(false)

  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(exists).toBe(true)
})
