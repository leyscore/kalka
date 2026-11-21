import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

// A fresh install, without `?test`, so the welcome shows as it does for a new person.
test.use({ storageState: { cookies: [], origins: [] } })

test('the welcome asks about the person step by step and keeps the answers', async ({ page }) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  const welcome = page.getByTestId('welcome')
  await expect(welcome).toBeVisible()
  await expect(page).toHaveURL(/\/welcome$/)

  await welcome.getByTestId('welcome-name').fill('Ada')
  await welcome.getByTestId('welcome-next').click()

  const designer = welcome.getByRole('button', { name: 'Designer', exact: true })
  await designer.click()
  await expect(designer).toHaveAttribute('aria-pressed', 'true')
  await welcome.getByRole('textbox', { name: 'Company' }).fill('Pixelers')
  await welcome.getByRole('button', { name: '2 to 10', exact: true }).click()
  await welcome.getByTestId('welcome-next').click()

  const websites = welcome.getByRole('button', { name: /Websites/ })
  await websites.click()
  await welcome.getByRole('button', { name: /Apps/ }).click()
  await expect(websites).toHaveAttribute('aria-pressed', 'true')
  await welcome.getByRole('button', { name: 'GitHub', exact: true }).click()
  await welcome.getByTestId('welcome-next').click()

  await expect(welcome.getByTestId('welcome-continue')).toBeVisible()
  await welcome.getByTestId('welcome-later').click()
  await expect(welcome).toHaveCount(0)
  await expect(page).not.toHaveURL(/\/welcome/)

  // The welcome has an address; opened again, it shows what was answered.
  await page.goto('/welcome')
  await new CanvasHelper(page).waitForInit()
  await expect(welcome.getByTestId('welcome-name')).toHaveValue('Ada')
  await welcome.getByTestId('welcome-next').click()
  await expect(designer).toHaveAttribute('aria-pressed', 'true')
  await expect(welcome.getByRole('textbox', { name: 'Company' })).toHaveValue('Pixelers')
  await welcome.getByTestId('welcome-next').click()
  await expect(websites).toHaveAttribute('aria-pressed', 'true')
  await expect(welcome.getByRole('button', { name: 'GitHub', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})

test('Back leaves the welcome like Skip', async ({ page }) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  const welcome = page.getByTestId('welcome')
  await expect(welcome).toBeVisible()
  await page.goBack()
  await expect(welcome).toHaveCount(0)
  await page.reload()
  await new CanvasHelper(page).waitForInit()
  await expect(welcome).toHaveCount(0)
})

test('Back keeps the name typed on the first step', async ({ page }) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  const welcome = page.getByTestId('welcome')
  await welcome.getByTestId('welcome-name').fill('Grace')
  await page.goBack()
  await expect(welcome).toHaveCount(0)
  await page.goto('/welcome/')
  await new CanvasHelper(page).waitForInit()
  await expect(welcome.getByTestId('welcome-name')).toHaveValue('Grace')
})

test('a link to Settings on a fresh install opens Settings and keeps the welcome for later', async ({
  page
}) => {
  await page.goto('/settings/server')
  await new CanvasHelper(page).waitForInit()
  await expect(page.getByTestId('app-settings')).toBeVisible()
  await expect(page).toHaveURL(/\/settings\/server$/)
  await expect(page.getByTestId('welcome')).toHaveCount(0)

  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  await expect(page.getByTestId('welcome')).toBeVisible()
})

test('an address that names nothing opens Home instead of a blank page', async ({ page }) => {
  await page.goto('/nope')
  await new CanvasHelper(page).waitForInit()
  await expect(page).toHaveURL(/\/(welcome)?$/)
})
