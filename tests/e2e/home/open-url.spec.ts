import { expect, test } from '#tests/e2e/fixtures'
import { CanvasHelper } from '#tests/helpers/canvas'
import { testPath } from '#tests/helpers/paths'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  await page.keyboard.press('ControlOrMeta+t')
  await page.getByTestId('home-open-url').click()
})

function urlDialog(page: import('@playwright/test').Page) {
  return page.getByRole('dialog', { name: 'Open from a URL' })
}

test('a plain http link opens, as from a local server', async ({ page, baseURL }) => {
  await page.route('**/__fixtures/slots.fig', (route) =>
    route.fulfill({ path: testPath('fixtures', 'slots.fig') })
  )
  const dialog = urlDialog(page)
  await dialog.getByRole('textbox').fill(new URL('/__fixtures/slots.fig', baseURL).href)
  await dialog.getByRole('button', { name: 'Open', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('[data-slot="tab-item"]').filter({ hasText: 'slots' })).toBeVisible()
})

test('a link that cannot be read says why, and editing it clears the error', async ({ page }) => {
  await page.route('https://files.example.test/**', (route) =>
    route.request().url().endsWith('missing.fig')
      ? route.fulfill({ status: 404, body: '' })
      : route.abort('failed')
  )
  const dialog = urlDialog(page)
  const field = dialog.getByRole('textbox')
  await field.fill('https://files.example.test/blocked.fig')
  await dialog.getByRole('button', { name: 'Open', exact: true }).click()
  await expect(dialog.getByText(/does not let other sites read its files/)).toBeVisible()
  await expect(dialog.getByText('Failed to fetch')).toHaveCount(0)

  await field.fill('https://files.example.test/missing.fig')
  await expect(dialog.getByText(/does not let other sites read its files/)).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Open', exact: true }).click()
  await expect(
    dialog.getByText('The link answered 404: there is no file to open there.')
  ).toBeVisible()
})
