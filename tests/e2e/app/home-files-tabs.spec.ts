import { expect, test } from '#tests/e2e/fixtures'

const opened = ['Landing', 'Roadmap'].map((name, index) => ({
  id: `local:/designs/${name}.fig`,
  kind: 'local',
  path: `/designs/${name}.fig`,
  name,
  updatedAt: new Date(Date.UTC(2026, 10, 20 - index)).toISOString()
}))

test.use({
  storageState: async ({ baseURL }, use) => {
    if (!baseURL) throw new Error('Browser test baseURL is required')
    await use({
      cookies: [],
      origins: [
        {
          origin: new URL(baseURL).origin,
          localStorage: [
            {
              name: 'kalka:preferences:v1',
              value: JSON.stringify({
                version: 1,
                onboarding: { aiSetup: 'done', welcome: 'done', tour: 'done' }
              })
            },
            { name: 'kalka:recent-documents', value: JSON.stringify(opened) }
          ]
        }
      ]
    })
  }
})

test('Home leads with the last file and keeps the storage workspace in its own tab', async ({
  page
}) => {
  await page.goto('/?recent-files')

  const home = page.getByTestId('recent-files-home')
  const recent = home.getByRole('tab', { name: 'Recent' })
  const storage = home.getByRole('tab', { name: 'Storage' })
  await expect(recent).toHaveAttribute('aria-selected', 'true')
  await expect(home.getByRole('button', { name: /^Landing.*Continue/ })).toBeVisible()
  await expect(home.getByRole('button', { name: 'Open the sample file' })).toBeVisible()

  await storage.click()
  await expect(storage).toHaveAttribute('aria-selected', 'true')
  await expect(home.getByText('Configure storage before using this workspace.')).toBeVisible()
  await expect(home.getByRole('button', { name: /^Landing/ })).toHaveCount(0)

  await page.reload()
  await expect(home.getByRole('tab', { name: 'Storage' })).toHaveAttribute('aria-selected', 'true')
})

test('each list of files on Home has its own address', async ({ page }) => {
  await page.goto('/?recent-files')
  const home = page.getByTestId('recent-files-home')
  const storage = home.getByRole('tab', { name: 'Storage' })

  await storage.click()
  await expect(page).toHaveURL(/\/files\/storage\?recent-files/)

  await home.getByRole('tab', { name: 'Recent' }).click()
  await expect(page).toHaveURL(/\/files\/recent\?recent-files/)

  await page.goto('/files/storage?recent-files')
  await expect(storage).toHaveAttribute('aria-selected', 'true')
})
