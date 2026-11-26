import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup('/?test')

function panel() {
  return editor.page.getByRole('dialog', { name: 'Keyboard shortcuts' })
}

test('⌘/ opens the shortcuts the editor binds, grouped as in Figma', async () => {
  await editor.page.keyboard.press('ControlOrMeta+Slash')
  await expect(panel()).toBeVisible()
  const tools = panel().getByRole('region', { name: 'Tools' })
  await expect(tools.getByRole('listitem').filter({ hasText: 'Rectangle' })).toContainText('R')
  await editor.page.keyboard.press('Escape')
  await expect(panel()).toBeHidden()
})

test('a shortcut already pressed shows as used, and Ctrl+Shift+? opens the panel', async () => {
  await editor.canvas.click(400, 400)
  await editor.page.keyboard.press('r')
  await editor.page.keyboard.press('v')
  await editor.page.keyboard.press('Control+Shift+Slash')
  await expect(panel()).toBeVisible()
  const tools = panel().getByRole('region', { name: 'Tools' })
  await expect(tools.getByRole('listitem').filter({ hasText: 'Rectangle' })).toHaveAttribute(
    'data-used'
  )
  await expect(tools.getByRole('listitem').filter({ hasText: 'Ellipse' })).not.toHaveAttribute(
    'data-used'
  )

  await panel().getByRole('searchbox', { name: 'Filter shortcuts' }).fill('ellipse')
  await expect(panel().getByRole('listitem')).toHaveCount(1)
  await editor.page.keyboard.press('Escape')
  await expect(panel()).toBeHidden()
})

test('the help button and the command palette open the panel', async () => {
  await editor.page.getByRole('button', { name: 'Help' }).click()
  await editor.page.getByRole('menuitem', { name: /Keyboard Shortcuts/ }).click()
  await expect(panel()).toBeVisible()
  await editor.page.keyboard.press('Escape')
  await expect(panel()).toBeHidden()

  await editor.page.keyboard.press('ControlOrMeta+KeyK')
  await editor.page.keyboard.type('Keyboard Shortcuts')
  await editor.page.keyboard.press('Enter')
  await expect(panel()).toBeVisible()
  await editor.page.keyboard.press('Escape')
})
