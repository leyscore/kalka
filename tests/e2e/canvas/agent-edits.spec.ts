import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

const card =
  '<Frame name="Plan" w={320} h={200} bg="#ffffff" flex="col" p={20} gap={10}><Text size={20}>Pro plan</Text><Text size={14}>Everything you need to ship.</Text><Rect w={120} h={32} bg="#9747ff"/></Frame>'

/** A `render` call as the MCP bridge delivers it from an outside client's session. */
function renderAsAgent(page: Page, x: number) {
  return page.evaluate(
    ({ jsx, left }) =>
      window.kalka?.test?.automation?.('tool', {
        name: 'render',
        args: { jsx, x: left, y: 40 },
        agent: { session: 'session-1', kind: 'mcp', client: 'claude-code' }
      }),
    { jsx: card, left: x }
  )
}

/** What the canvas is replaying now: layers animating in and text still being typed. */
function replaying(page: Page) {
  return page.evaluate(() => {
    const frames = [...document.querySelectorAll<HTMLIFrameElement>('iframe[data-kalka-artboard]')]
    return {
      animations: frames.reduce(
        (count, frame) => count + (frame.contentDocument?.getAnimations().length ?? 0),
        0
      ),
      typing: frames.reduce(
        (count, frame) =>
          count +
          ((frame.contentWindow as (Window & typeof globalThis) | null)?.CSS.highlights.get(
            'kalka-unwritten'
          )?.size ?? 0),
        0
      )
    }
  })
}

async function open(page: Page) {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
}

test("an agent's new layers appear in turn and its text types out, then rest as written", async ({
  page
}) => {
  await open(page)
  await renderAsAgent(page, 40)
  const artboard = page.locator('iframe[data-kalka-artboard]').contentFrame()
  // Read as soon as the new artboard draws, while the replay runs.
  await expect(artboard.getByText('Everything you need to ship.')).toBeAttached()
  const during = await replaying(page)
  expect(during.animations).toBeGreaterThan(0)
  expect(during.typing).toBeGreaterThan(0)

  await expect.poll(() => replaying(page)).toEqual({ animations: 0, typing: 0 })
  await expect(artboard.getByText('Everything you need to ship.')).toBeVisible()
})

test('with reduced motion the edit shows at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page)
  await renderAsAgent(page, 40)
  const artboard = page.locator('iframe[data-kalka-artboard]').contentFrame()
  await expect(artboard.getByText('Everything you need to ship.')).toBeAttached()
  expect(await replaying(page)).toEqual({ animations: 0, typing: 0 })
})
