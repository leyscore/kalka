import { expect, test } from '#tests/e2e/fixtures'

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
            }
          ]
        }
      ]
    })
  }
})

test('Home opens the documentation on kalka.design', async ({ page, context }) => {
  // The docs live on kalka.design; the test only checks where the button goes.
  await context.route('https://kalka.design/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Docs</title>' })
  )
  await page.goto('/?recent-files')
  const docs = page.getByTestId('shell-sidebar').getByRole('button', { name: 'Documentation' })
  await expect(docs).toBeVisible()
  const opened = context.waitForEvent('page')
  await docs.click()
  const tab = await opened
  await tab.waitForLoadState('domcontentloaded')
  expect(tab.url()).toBe('https://kalka.design/docs')
})

test('the editor rail opens the documentation in a new tab and keeps the document', async ({
  page,
  context
}) => {
  await context.route('https://kalka.design/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Docs</title>' })
  )
  await page.goto('/?test')
  const opened = context.waitForEvent('page')
  await page.getByTestId('panel-rail-documentation').click()
  const tab = await opened
  await tab.waitForLoadState('domcontentloaded')
  expect(new URL(tab.url()).host).toBe('kalka.design')
  await expect(page.getByTestId('panel-rail')).toBeVisible()
})
