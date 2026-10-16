import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

// `?test` suppresses the first-run offer, so these load the app as a person would, with none
// of the stored preferences the other browser tests start from.
test.use({ storageState: { cookies: [], origins: [] } })

test('a fresh install shows the welcome once, without the AI setup offer on top', async ({
  page
}) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  const welcome = page.getByTestId('welcome')
  await expect(welcome.getByRole('heading', { level: 2 })).toBeVisible()
  await welcome.getByRole('button', { name: 'Skip setup' }).click()
  await expect(welcome).toHaveCount(0)
  await expect(page.getByTestId('ai-setup-dialog')).toHaveCount(0)

  await page.reload()
  await new CanvasHelper(page).waitForInit()
  await expect(welcome).toHaveCount(0)
  await expect(page.getByTestId('ai-setup-dialog')).toHaveCount(0)
})

test.describe('an install past the welcome', () => {
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
                value: JSON.stringify({ version: 1, onboarding: { welcome: 'done', tour: 'done' } })
              }
            ]
          }
        ]
      })
    }
  })

  test('is still offered AI setup once', async ({ page }) => {
    await page.goto('/')
    await new CanvasHelper(page).waitForInit()
    const setup = page.getByTestId('ai-setup-dialog')
    await expect(setup.getByRole('heading', { name: 'Welcome to Kalka' })).toBeVisible()
    await setup.getByRole('button', { name: 'Start designing' }).click()
    await expect(setup).toHaveCount(0)

    await page.reload()
    await new CanvasHelper(page).waitForInit()
    await expect(setup).toHaveCount(0)
  })
})

const CONFIGURED_MODEL_SETTINGS = {
  version: 1,
  connections: [
    {
      id: 'connection-anthropic',
      providerID: 'anthropic',
      customBaseURL: '',
      customAPIType: 'completions',
      credentialProfileId: 'connection-anthropic'
    }
  ],
  models: [
    {
      id: 'model-sonnet',
      name: 'Claude Sonnet 5',
      connectionId: 'connection-anthropic',
      modelID: 'claude-sonnet-5',
      customModelID: '',
      capabilities: ['tools', 'vision']
    }
  ],
  assignments: { design: 'model-sonnet', review: 'design', fast: 'design', vision: 'design' }
}

test.describe('an install with a configured model', () => {
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
                name: 'kalka:ai-model-settings',
                value: JSON.stringify(CONFIGURED_MODEL_SETTINGS)
              },
              {
                name: 'kalka:preferences:v1',
                value: JSON.stringify({ version: 1, onboarding: { welcome: 'done', tour: 'done' } })
              }
            ]
          }
        ]
      })
    }
  })

  test('never sees the first-run offer', async ({ page }) => {
    await page.goto('/')
    await new CanvasHelper(page).waitForInit()
    await expect(page.getByTestId('ai-setup-dialog')).toHaveCount(0)
  })
})
