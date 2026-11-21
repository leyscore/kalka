import { expect, test } from '#tests/e2e/fixtures'

const local = ['Landing', 'Roadmap'].map((name, index) => ({
  id: `local:/designs/${name}.fig`,
  kind: 'local',
  path: `/designs/${name}.fig`,
  name,
  updatedAt: new Date(Date.UTC(2026, 10, 20 - index)).toISOString()
}))
// A file from a Kalka server, opened between the two local ones.
const opened = [
  local[0],
  {
    id: 'server:https://team.example:pricing',
    kind: 'server',
    serverURL: 'https://team.example',
    documentId: 'pricing',
    name: 'Pricing',
    updatedAt: new Date(Date.UTC(2026, 10, 19, 12)).toISOString()
  },
  local[1]
]

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

test('Home shows the recent files from every place, led by the last one', async ({ page }) => {
  await page.goto('/?recent-files')

  const home = page.getByTestId('recent-files-home')
  await expect(home.getByRole('heading', { name: 'Recent', exact: true })).toBeVisible()
  await expect(home.getByRole('button', { name: /^Landing.*Continue/ })).toBeVisible()
  await expect(home.getByRole('button', { name: /^Pricing/ })).toBeVisible()
  await expect(home.getByRole('button', { name: /^Roadmap/ })).toBeVisible()
  await expect(home.getByRole('button', { name: 'Open the sample file' })).toBeVisible()
})

test('each place in the sidebar lists its files at its own address', async ({ page }) => {
  await page.goto('/?recent-files')
  const home = page.getByTestId('recent-files-home')
  const sidebar = page.getByTestId('shell-sidebar')

  await sidebar.getByRole('button', { name: 'Cloud storage' }).click()
  await expect(page).toHaveURL(/\/files\/storage\?recent-files/)
  await expect(home.getByRole('heading', { name: 'Cloud storage' })).toBeVisible()
  await expect(home.getByText('Configure storage before using this workspace.')).toBeVisible()
  await expect(home.getByRole('button', { name: /^Landing/ })).toHaveCount(0)

  await sidebar.getByRole('button', { name: 'Local files' }).click()
  await expect(page).toHaveURL(/\/files\/recent\?recent-files/)
  await expect(home.getByRole('button', { name: /^Landing/ })).toBeVisible()
  await expect(home.getByRole('button', { name: /^Pricing/ })).toHaveCount(0)

  await sidebar.getByRole('button', { name: 'Home' }).click()
  await expect(page).toHaveURL(/\/\?recent-files/)
  await expect(home.getByRole('heading', { name: 'Recent', exact: true })).toBeVisible()
})

test('the web editor opens the list its address names', async ({ page }) => {
  await page.goto('/files/storage')
  const home = page.getByTestId('recent-files-home')
  await expect(home.getByTestId('home-files-heading')).toHaveText('Cloud storage')
  await expect(page).toHaveURL(/\/files\/storage$/)
})
