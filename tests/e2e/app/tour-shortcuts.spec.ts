import type * as Tour from '@/app/onboarding/tour'

import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup('/?test')

test('shortcuts keep working while the editor tour is open', async () => {
  await editor.page.evaluate(async () => {
    const tourURL = '/src/app/onboarding/tour.ts'
    const tour: typeof Tour = await import(tourURL)
    tour.startTour()
  })
  await expect(editor.page.getByTestId('editor-tour')).toBeVisible()

  await editor.page.keyboard.press('r')
  await expect
    .poll(() => editor.page.evaluate(() => window.kalka?.getStore?.().state.activeTool))
    .toBe('RECTANGLE')
  await expect(editor.page.getByTestId('editor-tour')).toBeVisible()
})
