import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test')

const RED = { r: 1, g: 0, b: 0, a: 1 }
const BLUE = { r: 0, g: 0, b: 1, a: 1 }

/** A Button component with a red box, an instance of it, and the instance's box painted blue. */
function setupEditedInstance() {
  return editor.page.evaluate(
    ({ red, blue }) => {
      const store = window.kalka?.getStore?.()
      if (!store) throw new Error('Kalka store not initialized')
      const page = store.state.currentPageId
      const component = store.graph.createNode('COMPONENT', page, {
        name: 'Button',
        x: 80,
        y: 80,
        width: 120,
        height: 40
      })
      store.graph.createNode('RECTANGLE', component.id, {
        name: 'Box',
        width: 120,
        height: 40,
        fills: [{ type: 'SOLID', color: red, opacity: 1, visible: true }]
      })
      const instanceId = store.createInstanceFromComponent(component.id, 300, 80)
      if (!instanceId) throw new Error('No instance')
      const [box] = store.graph.getNode(instanceId)?.childIds ?? []
      store.updateNodeWithUndo(
        box,
        { fills: [{ type: 'SOLID', color: blue, opacity: 1, visible: true }] },
        'Fill'
      )
      store.select([instanceId])
      return { componentId: component.id, instanceId, box }
    },
    { red: RED, blue: BLUE }
  )
}

function fillOf(id: string) {
  return editor.page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    return store?.graph.getNode(nodeId)?.fills[0]?.color ?? null
  }, id)
}

test('the instance reset menu resets one kind of change or all of them', async () => {
  const { box } = await setupEditedInstance()
  const page = editor.page
  await page.getByTestId('instance-reset-trigger').click()
  await expect(page.getByTestId('instance-reset-fill')).toHaveText('Reset fill')
  await expect(page.getByTestId('instance-reset-all')).toHaveText('Reset all changes')
  await page.getByTestId('instance-reset-fill').click()
  expect(await fillOf(box)).toEqual(RED)
  // Nothing left to reset: the menu goes away.
  await expect(page.getByTestId('instance-reset-trigger')).toHaveCount(0)

  await page.keyboard.press('Meta+z')
  expect(await fillOf(box)).toEqual(BLUE)
})

test('Push changes to main component gives the edit to every instance', async () => {
  const { componentId } = await setupEditedInstance()
  const page = editor.page
  await page.getByTestId('instance-reset-trigger').click()
  await page.getByTestId('instance-push-changes').click()
  const mainBox = await page.evaluate((id) => {
    const store = window.kalka?.getStore?.()
    return store?.graph.getNode(id)?.childIds[0] ?? ''
  }, componentId)
  expect(await fillOf(mainBox)).toEqual(BLUE)
})

test('Restore main component brings a deleted main component back', async () => {
  const { componentId, instanceId } = await setupEditedInstance()
  const page = editor.page
  await page.evaluate(
    ({ component, instance }) => {
      const store = window.kalka?.getStore?.()
      if (!store) throw new Error('Kalka store not initialized')
      store.graph.deleteNode(component)
      store.clearSelection()
      store.select([instance])
    },
    { component: componentId, instance: instanceId }
  )
  await page.getByTestId('instance-restore-main').click()
  const restored = await page.evaluate((id) => {
    const store = window.kalka?.getStore?.()
    const mainId = store?.graph.getNode(id)?.componentId ?? ''
    return store?.graph.getNode(mainId)?.type ?? null
  }, instanceId)
  expect(restored).toBe('COMPONENT')
  await expect(page.getByTestId('instance-go-to-main')).toBeVisible()
})

test('Select matching layers (Cmd+Alt+A) selects the layers of the same name', async () => {
  const page = editor.page
  const ids = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const card = store.graph.createNode('FRAME', pageId, { name: 'Card', width: 200, height: 200 })
    const first = store.graph.createNode('RECTANGLE', card.id, { name: 'Dot', width: 20 })
    const second = store.graph.createNode('RECTANGLE', pageId, { name: 'Dot', x: 300, width: 20 })
    store.graph.createNode('RECTANGLE', pageId, { name: 'Other', x: 400, width: 20 })
    store.select([first.id])
    return [first.id, second.id]
  })
  await page.keyboard.press('Meta+Alt+KeyA')
  const selected = await page.evaluate(() => [
    ...(window.kalka?.getStore?.()?.state.selectedIds ?? [])
  ])
  expect(selected.sort()).toEqual([...ids].sort())
})

test('the playground tries a variant without changing the file', async () => {
  const page = editor.page
  const setId = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const set = store.graph.createNode('COMPONENT_SET', pageId, {
      name: 'Chip',
      x: 80,
      y: 80,
      width: 300,
      height: 60,
      componentPropertyDefinitions: [
        {
          id: 'prop:size',
          name: 'Size',
          type: 'VARIANT',
          defaultValue: 'Small',
          variantOptions: ['Small', 'Large']
        }
      ]
    })
    for (const [index, size] of ['Small', 'Large'].entries())
      store.graph.createNode('COMPONENT', set.id, {
        name: `Size=${size}`,
        x: index * 150,
        width: size === 'Large' ? 140 : 80,
        height: 40,
        componentPropertyValues: { Size: size }
      })
    store.select([set.id])
    return set.id
  })
  const before = await page.evaluate(() => window.kalka?.getStore?.()?.graph.nodes.size ?? 0)
  await page.getByTestId('component-playground-open').click()
  const dialog = page.getByTestId('component-playground')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('img', { name: 'Chip' })).toBeVisible()
  await dialog.getByTestId('playground-property-Size').getByRole('combobox').click()
  await page.getByRole('option', { name: 'Large' }).click()
  await expect(dialog.getByTestId('playground-reset')).toBeEnabled()
  await page.keyboard.press('Escape')
  expect(await page.evaluate(() => window.kalka?.getStore?.()?.graph.nodes.size ?? 0)).toBe(before)
  expect(
    await page.evaluate((id) => [...(window.kalka?.getStore?.()?.state.selectedIds ?? [])], setId)
  ).toEqual([setId])
})
