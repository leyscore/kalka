import { expect, test } from '#tests/e2e/fixtures'

test('opens to the recent-files home and starts a new document', async ({ page }) => {
  await page.goto('/?recent-files')

  await expect(page.getByTestId('recent-files-home')).toBeVisible()
  await expect(page.getByText('No recent files yet')).toBeVisible()

  await page.getByTestId('home-new-document').click()

  await expect(page.getByTestId('recent-files-home')).toBeHidden()
  await expect(page.getByRole('group', { name: 'Layers' })).toBeVisible()
})
