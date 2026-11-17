import { expect, test, type Page } from '@playwright/test'
import * as v from 'valibot'

import { CanvasHelper } from '#tests/helpers/canvas'

/**
 * Watching an agent work: a frame where its work will land before it has any, what it says it is
 * doing listed as tasks, and the view going to what it makes for a request.
 */

const ToolReply = v.object({ ok: v.literal(true), result: v.unknown() })

async function callAsAgent(page: Page, name: string, args: Record<string, unknown>) {
  const reply = await page.evaluate(
    (call) =>
      window.kalka?.test?.automation?.('tool', {
        ...call,
        agent: { session: 'work-session', kind: 'mcp', client: 'claude-code' }
      }),
    { name, args }
  )
  return v.parse(ToolReply, reply).result
}

async function open(page: Page) {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
}

const Layers = v.object({ layers: v.array(v.object({ id: v.string() })) })

test('a frame shows where an agent will work until it touches its first layer', async ({
  page
}) => {
  await open(page)
  await callAsAgent(page, 'write_html', {
    html: '<div style="width: 300px; height: 200px; background: #eee"></div>'
  })
  // A new session that has said what it does but touched nothing yet.
  const ghost = page.locator('[data-slot="agent-ghost-frame"]')
  await page.evaluate(() =>
    window.kalka?.test?.automation?.('tool', {
      name: 'set_status',
      args: { text: 'Composing the hero' },
      agent: { session: 'fresh-session', kind: 'mcp', client: 'codex' }
    })
  )
  await expect(ghost).toBeVisible()
  await expect(ghost).toContainText('Composing the hero')

  await page.evaluate(() =>
    window.kalka?.test?.automation?.('tool', {
      name: 'write_html',
      args: {
        html: '<section style="width: 390px; height: 120px; background: #F0B429"></section>'
      },
      agent: { session: 'fresh-session', kind: 'mcp', client: 'codex' }
    })
  )
  await expect(ghost).toHaveCount(0)
})

test('what an agent says it works on is listed as its tasks, and leads back to where it worked', async ({
  page
}) => {
  await open(page)
  await callAsAgent(page, 'set_status', { text: 'Composing the hero' })
  await callAsAgent(page, 'write_html', {
    html: '<section style="width: 600px; height: 300px; background: #FFFBF5"><h1>Hero</h1></section>',
    x: 0,
    y: 0
  })
  await callAsAgent(page, 'set_status', { text: 'Checking the phone layout' })

  await page.getByTestId('left-panel-comments-tab').click()
  const panel = page.locator('[data-slot="comments-panel"]')
  await panel.getByRole('tab').nth(2).click()
  const tasks = panel.locator('[data-slot="agent-task"]')
  await expect(tasks).toHaveCount(2)
  await expect(tasks.first()).toContainText('Checking the phone layout')
  await expect(tasks.first()).toHaveAttribute('data-running', 'true')
  await expect(tasks.nth(1)).toContainText('Composing the hero')
  await expect(tasks.nth(1)).not.toHaveAttribute('data-running', 'true')
})

test('the view goes to what an agent makes for a request, when it lands out of view', async ({
  page
}) => {
  await open(page)
  const shell = v.parse(
    Layers,
    await callAsAgent(page, 'write_html', {
      html: '<div style="width: 300px; height: 200px; background: #eee"></div>',
      x: 0,
      y: 0
    })
  )
  // Ask the agent in a comment on what is on screen.
  await page.keyboard.press('c')
  const box = await page.locator('[data-slot="comment-placement"]').boundingBox()
  const view = await page.evaluate(() => {
    const state = window.kalka?.getStore?.()?.state
    return state ? { panX: state.panX, panY: state.panY, zoom: state.zoom } : null
  })
  if (!box || !view) throw new Error('No canvas')
  await page.mouse.click(box.x + 40 * view.zoom + view.panX, box.y + 40 * view.zoom + view.panY)
  const thread = page.locator('[data-slot="comment-thread"]')
  await thread.getByRole('textbox').fill('@agent add a footer')
  await thread.getByRole('textbox').press('ControlOrMeta+Enter')
  expect(shell.layers).toHaveLength(1)

  // The agent builds far to the right of what is on screen.
  await callAsAgent(page, 'write_html', {
    html: '<footer style="width: 300px; height: 100px; background: #3F2D10"></footer>',
    x: 6000,
    y: 0
  })
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.kalka?.getStore?.()?.state
        if (!state) return null
        // Where page x 6150 (the footer's middle) is on screen.
        return 6150 * state.zoom + state.panX
      })
    )
    .toBeLessThan(1400)
})
