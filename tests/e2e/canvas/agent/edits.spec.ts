import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

const card =
  '<Frame name="Plan" w={320} h={200} bg="#ffffff" flex="col" p={20} gap={10}><Text size={20}>Pro plan</Text><Text size={14}>Everything you need to ship.</Text><Rect w={120} h={32} bg="#9747ff"/></Frame>'

/** A tool call as the MCP bridge delivers it from an outside client's session. */
function callAsAgent(page: Page, name: string, args: Record<string, unknown>) {
  return page.evaluate(
    (call) =>
      window.kalka?.test?.automation?.('tool', {
        ...call,
        agent: { session: 'session-1', kind: 'mcp', client: 'claude-code' }
      }),
    { name, args }
  )
}

function renderAsAgent(page: Page, x: number) {
  return callAsAgent(page, 'render', { jsx: card, x, y: 40 })
}

/** The dashed outlines the overlay draws around layers an agent is still building. */
function workingMarks(page: Page) {
  return page.getByTestId('svg-overlay').locator('polygon[stroke-dasharray="4 3"]')
}

/**
 * Samples, every frame from now on until stopped, how opaque the card's heading shows: its
 * opacity times its ancestors' in the artboard, and the artboard's own, however long the edit
 * takes to arrive.
 */
async function sampleHeadingOpacity(page: Page) {
  const sampler = await page.evaluateHandle(() => {
    const state = { samples: [] as number[], stopped: false }
    const sample = () => {
      if (state.stopped) return
      // The next frame is asked for first: reading an artboard that is still replacing its first,
      // empty document can throw, and that must not end the sampling.
      requestAnimationFrame(sample)
      for (const frame of document.querySelectorAll<HTMLIFrameElement>(
        'iframe[data-kalka-artboard]'
      )) {
        const doc = frame.contentDocument
        const view = frame.contentWindow
        const heading = doc
          ? [...doc.querySelectorAll('*')].find((element) => element.textContent === 'Pro plan')
          : undefined
        if (!heading || !view) continue
        let opacity = Number(getComputedStyle(frame).opacity)
        for (let element: Element | null = heading; element; element = element.parentElement)
          opacity *= Number(view.getComputedStyle(element).opacity)
        state.samples.push(opacity)
      }
    }
    requestAnimationFrame(sample)
    return state
  })
  return {
    /** What each frame drew so far. */
    read: () => sampler.evaluate((state) => [...state.samples]),
    async stop() {
      await sampler.evaluate((state) => {
        state.stopped = true
      })
      await sampler.dispose()
    }
  }
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

test('new layers stay hidden until they animate in, instead of showing first', async ({ page }) => {
  await open(page)
  const samples = await sampleHeadingOpacity(page)
  try {
    await renderAsAgent(page, 40)
    // A held layer is attached at no opacity before its reveal starts, so wait for the heading
    // to show whole rather than for the replay to be idle.
    await expect.poll(async () => (await samples.read()).at(-1)).toBe(1)
    // The first frame that drew the heading drew it hidden or fading in, never whole.
    expect((await samples.read())[0]).toBeLessThan(1)
  } finally {
    await samples.stop()
  }
})

test("an agent's new layers keep its mark until it finishes working on them", async ({ page }) => {
  await open(page)
  await renderAsAgent(page, 40)
  await expect(workingMarks(page)).toHaveCount(1)
  const second = await renderAsAgent(page, 420)
  await expect(workingMarks(page)).toHaveCount(2)

  const id = (second as { result?: { id?: string } } | undefined)?.result?.id
  expect(id).toBeTruthy()
  const released = await callAsAgent(page, 'finish_working_on_nodes', { node_ids: [id] })
  expect(released).toMatchObject({ result: { released: [id] } })
  await expect(workingMarks(page)).toHaveCount(1)

  await callAsAgent(page, 'finish_working_on_nodes', {})
  await expect(workingMarks(page)).toHaveCount(0)
})

test('Reduce agent animations shows the edit at once, with nothing left hidden', async ({
  page
}) => {
  await open(page)
  await page.getByTestId('app-settings-trigger').click()
  await page.getByRole('switch', { name: 'Reduce agent animations' }).click()
  await page.getByTestId('app-settings-done').click()

  await renderAsAgent(page, 40)
  const artboard = page.locator('iframe[data-kalka-artboard]').contentFrame()
  await expect(artboard.getByText('Everything you need to ship.')).toBeVisible()
  expect(await replaying(page)).toEqual({ animations: 0, typing: 0 })
  // Still marked as work in progress: only the animation is reduced.
  await expect(workingMarks(page)).toHaveCount(1)
})
