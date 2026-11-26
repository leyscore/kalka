import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'
import { propertySection } from '#tests/helpers/properties'
import { toolbarFlyoutItemTestId, toolbarFlyoutTestId } from '#tests/helpers/test-ids'

// Figma's shape tools: Count and Ratio for polygons and stars, the Arrow tool with its start and
// end points, and corner radius handles on the canvas.

const editor = useEditorSetupWithClear()

function selectedShape() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = [...store.state.selectedIds][0]
    const node = id ? store.graph.getNode(id) : undefined
    if (!node) return null
    const vertices = node.vectorNetwork?.vertices ?? []
    return {
      type: node.type,
      name: node.name,
      pointCount: node.pointCount,
      starInnerRadius: node.starInnerRadius,
      strokeCap: node.strokeCap,
      endCaps: [vertices.at(0)?.strokeCap ?? null, vertices.at(-1)?.strokeCap ?? null],
      cornerRadius: node.cornerRadius,
      topLeftRadius: node.topLeftRadius,
      independentCorners: node.independentCorners
    }
  })
}

async function fillField(name: string, value: string) {
  const field = editor.page.getByRole('spinbutton', { name, exact: true })
  await field.focus()
  await field.fill(value)
  await field.press('Enter')
  await editor.canvas.waitForRender()
}

async function pickShapeTool(tool: 'POLYGON' | 'STAR' | 'ARROW') {
  await editor.page.getByTestId(toolbarFlyoutTestId('RECTANGLE')).click()
  await editor.page.getByTestId(toolbarFlyoutItemTestId(tool)).click()
}

test('a polygon and a star take their Count and Ratio from the panel, undone in one step', async () => {
  const { page, canvas } = editor
  await pickShapeTool('POLYGON')
  await canvas.drag(200, 200, 320, 320)
  await canvas.waitForRender()
  expect(await selectedShape()).toMatchObject({ type: 'POLYGON', pointCount: 3 })

  await fillField('Count', '6')
  expect((await selectedShape())?.pointCount).toBe(6)
  await expect(page.getByRole('spinbutton', { name: 'Ratio' })).toHaveCount(0)

  await canvas.undo()
  expect((await selectedShape())?.pointCount).toBe(3)

  await pickShapeTool('STAR')
  await canvas.drag(400, 200, 520, 320)
  await canvas.waitForRender()
  await fillField('Ratio', '60')
  expect(await selectedShape()).toMatchObject({ type: 'STAR', pointCount: 5, starInnerRadius: 0.6 })
  canvas.assertNoErrors()
})

test('Shift+L draws an arrow whose start and end points are set in the stroke settings', async () => {
  const { page, canvas } = editor
  await canvas.click(600, 500)
  await canvas.pressKey('Shift+L')
  await canvas.drag(200, 300, 420, 300)
  await canvas.waitForRender()
  expect(await selectedShape()).toMatchObject({
    type: 'LINE',
    name: 'Arrow 1',
    strokeCap: 'NONE',
    endCaps: [null, 'ARROW_LINES']
  })

  await propertySection(page, 'Stroke').getByRole('button', { name: 'Stroke settings' }).click()
  const settings = page.getByRole('dialog', { name: 'Stroke settings' })
  await settings.locator('[data-property="stroke-start-point"]').click()
  await page.getByRole('option', { name: 'Triangle arrow', exact: true }).click()
  await canvas.waitForRender()
  expect((await selectedShape())?.endCaps).toEqual(['ARROW_EQUILATERAL', 'ARROW_LINES'])
  await page.keyboard.press('Escape')
  await expect(settings).toHaveCount(0)

  await pickShapeTool('ARROW')
  await canvas.drag(200, 400, 420, 400)
  await canvas.waitForRender()
  expect((await selectedShape())?.name).toBe('Arrow 2')
  canvas.assertNoErrors()
})

test('dragging a corner radius handle rounds every corner; Option rounds one', async () => {
  const { page, canvas } = editor
  await canvas.drawRect(200, 200, 240, 160)
  // The handles show while the pointer is over the selected rectangle, 12px in from each corner.
  await canvas.hover(320, 280)
  await canvas.drag(212, 212, 236, 236)
  await canvas.waitForRender()
  expect(await selectedShape()).toMatchObject({ cornerRadius: 24, independentCorners: false })
  await expect(page.getByRole('spinbutton', { name: 'Radius', exact: true })).toHaveAttribute(
    'aria-valuenow',
    '24'
  )

  await canvas.undo()
  expect((await selectedShape())?.cornerRadius).toBe(0)

  await canvas.hover(320, 280)
  await canvas.altDrag(212, 212, 232, 232)
  expect(await selectedShape()).toMatchObject({ independentCorners: true, topLeftRadius: 20 })
  canvas.assertNoErrors()
})
