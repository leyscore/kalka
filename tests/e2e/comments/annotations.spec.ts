import { expect, test, type Page } from '@playwright/test'
import * as v from 'valibot'

import { CanvasHelper } from '#tests/helpers/canvas'

/**
 * Handoff without a Dev Mode: Shift+T annotates a layer and opens its note in the Code tab, where
 * a frame's dev status, kept measurements and dev resources live too; the canvas shows the
 * callout, the measurement and the status, and the comments panel lists them.
 */

const ToolReply = v.object({ ok: v.literal(true), result: v.unknown() })
const Layers = v.object({ layers: v.array(v.object({ id: v.string() })) })

async function writeHTML(page: Page, html: string): Promise<string> {
  const reply = await page.evaluate(
    (args) =>
      window.kalka?.test?.automation?.('tool', {
        name: 'write_html',
        args,
        agent: { session: 'handoff-session', kind: 'mcp', client: 'claude-code' }
      }),
    { html, x: 40, y: 40 }
  )
  return v.parse(Layers, v.parse(ToolReply, reply).result).layers[0].id
}

async function select(page: Page, ids: string[]) {
  await page.evaluate((selected) => window.kalka?.getStore?.()?.select(selected), ids)
}

async function childIds(page: Page, id: string): Promise<string[]> {
  return page.evaluate(
    (parent) => window.kalka?.getStore?.()?.graph.getNode(parent)?.childIds ?? [],
    id
  )
}

test('annotate a layer, mark its frame ready and keep a measurement and a link', async ({
  page
}) => {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  const frame = await writeHTML(
    page,
    '<div style="width: 360px; height: 240px; padding: 24px; display: flex; gap: 16px; background: #F4EFE6"><div style="width: 120px; height: 40px; background: #3F2D10"></div><div style="width: 80px; height: 40px; background: #C2410C"></div></div>'
  )
  const [pay, cancel] = await childIds(page, frame)

  await select(page, [pay])
  await page.keyboard.press('Shift+T')
  const handoff = page.getByTestId('handoff-section')
  await expect(handoff).toBeVisible()
  const note = handoff.getByTestId('annotation-label')
  await expect(note).toBeFocused()
  await note.fill('Disabled until the form is valid')
  await note.press('Enter')

  await handoff.getByTestId('annotation-pin-property').click()
  await page.getByRole('option', { name: 'width', exact: true }).click()

  const callout = page.locator('[data-slot="annotation-callout"]')
  await expect(callout).toContainText('Disabled until the form is valid')
  await expect(callout).toContainText('120px')

  await select(page, [frame])
  await handoff.getByTestId('handoff-dev-status').click()
  await page.getByRole('option', { name: 'Ready for dev' }).click()
  await expect(page.locator('[data-slot="frame-review-badge"]')).toHaveAttribute(
    'data-status',
    'ready'
  )

  await handoff.getByTestId('dev-resource-url').fill('not a link')
  await handoff.getByTestId('dev-resource-add').click()
  await expect(handoff.getByRole('alert')).toBeVisible()
  await handoff.getByTestId('dev-resource-url').fill('https://tracker.example.com/42')
  await handoff.getByTestId('dev-resource-name').fill('Ticket')
  await handoff.getByTestId('dev-resource-add').click()
  await expect(handoff.getByRole('link', { name: 'Ticket' })).toHaveAttribute(
    'href',
    'https://tracker.example.com/42'
  )

  // A link is edited in place, in the form it was added with.
  await handoff.locator('[data-slot="dev-resource"]').hover()
  await handoff.getByTestId('dev-resource-edit').click()
  await expect(handoff.getByTestId('dev-resource-url')).toHaveValue(
    'https://tracker.example.com/42'
  )
  await handoff.getByTestId('dev-resource-name').fill('Spec')
  await handoff.getByTestId('dev-resource-add').click()
  await expect(handoff.getByRole('link', { name: 'Spec' })).toBeVisible()
  await expect(handoff.locator('[data-slot="dev-resource"]')).toHaveCount(1)

  // The dev status undoes like any edit.
  await page.getByTestId('canvas-element').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await page.keyboard.press('ControlOrMeta+z')
  await page.keyboard.press('ControlOrMeta+z')
  await expect(page.locator('[data-slot="frame-review-badge"]')).toHaveCount(0)
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect(page.locator('[data-slot="frame-review-badge"]')).toHaveAttribute(
    'data-status',
    'ready'
  )

  await select(page, [pay, cancel])
  await handoff.getByTestId('handoff-measure').click()
  await expect(page.locator('[data-slot="measurement-label"]')).toHaveText('16')

  // The comments panel lists the annotation apart from comments, and the frame ready for dev.
  await page.getByTestId('left-panel-comments-tab').click()
  const panel = page.locator('[data-slot="comments-panel"]')
  await panel.getByRole('tab', { name: 'Annotations' }).click()
  await expect(panel.locator('[data-slot="annotation-row"]')).toHaveCount(1)
  await panel.getByRole('tab', { name: 'Ready for dev' }).click()
  await expect(panel.locator('[data-slot="dev-status-row"]')).toHaveAttribute(
    'data-status',
    'ready'
  )
})

test('Alt-hover a layer, then click to keep the distance drawn', async ({ page }) => {
  await page.goto('/?test')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  await canvas.drawRect(100, 100, 100, 100)
  await canvas.drawRect(260, 120, 40, 40)
  const [first] = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    const page = store?.graph.getNode(store.state.currentPageId)
    return page?.childIds ?? []
  })
  await select(page, [first])

  await canvas.hover(280, 140)
  await page.keyboard.down('Alt')
  await canvas.hover(282, 140)
  await canvas.click(282, 140)
  await page.keyboard.up('Alt')
  await expect(page.locator('[data-slot="measurement-label"]')).toHaveText('60')
  // The click kept the distance and left the selection as it was.
  expect(
    await page.evaluate(() => [...(window.kalka?.getStore?.()?.state.selectedIds ?? [])])
  ).toEqual([first])

  // Alt-dragging still duplicates the layer under the pointer.
  await canvas.altDrag(282, 140, 282, 260)
  const count = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    return store?.graph.getNode(store.state.currentPageId)?.childIds.length ?? 0
  })
  expect(count).toBe(3)
})
