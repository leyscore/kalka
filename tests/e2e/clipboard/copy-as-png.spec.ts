import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

// Figma's Cmd+Shift+C copies the selection as a PNG, and Kalka says it did.

test('Cmd+Shift+C copies the selection as a PNG and says so', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/?test')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  await canvas.drawRect(120, 120, 120, 90)
  await page.keyboard.press('ControlOrMeta+Shift+KeyC')
  await expect(page.locator('[data-slot="toast"]').first()).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const items = await navigator.clipboard.read()
        return items.flatMap((item) => item.types)
      })
    )
    .toContain('image/png')
})
