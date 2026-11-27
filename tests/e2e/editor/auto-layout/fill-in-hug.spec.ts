import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'
import { getNodeById } from '#tests/helpers/store'

const editor = useEditorSetup()

async function setWidthSizing(id: string, sizing: 'Fill') {
  await editor.page.evaluate((nodeId) => window.kalka?.getStore?.().select([nodeId]), id)
  await editor.page.getByRole('combobox', { name: 'Width' }).first().click()
  await editor.page.getByRole('option', { name: sizing, exact: true }).click()
  await editor.canvas.waitForRender()
}

test('a layer set to fill a parent that hugs it turns the parent fixed, and stays visible', async () => {
  const { card, row, middle } = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    const pageId = store.state.currentPageId
    const hug = { primaryAxisSizing: 'HUG', counterAxisSizing: 'HUG' } as const
    const cardNode = store.graph.createNode('FRAME', pageId, {
      name: 'Card',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      layoutMode: 'VERTICAL',
      itemSpacing: 16,
      paddingTop: 20,
      paddingRight: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      ...hug
    })
    store.graph.createNode('RECTANGLE', cardNode.id, { name: 'Banner', width: 360, height: 60 })
    const rowNode = store.graph.createNode('FRAME', cardNode.id, {
      name: 'Row',
      width: 260,
      height: 40,
      layoutMode: 'HORIZONTAL',
      itemSpacing: 10,
      ...hug
    })
    const buttons = ['A', 'B', 'C'].map(
      (name) => store.graph.createNode('RECTANGLE', rowNode.id, { name, width: 80, height: 40 }).id
    )
    store.runLayoutForNode(cardNode.id)
    return { card: cardNode.id, row: rowNode.id, middle: buttons[1] }
  })
  await editor.canvas.waitForRender()

  await setWidthSizing(middle, 'Fill')
  await setWidthSizing(row, 'Fill')
  expect(await getNodeById(editor.page, card)).toMatchObject({ counterAxisSizing: 'FIXED' })

  await editor.page.evaluate((cardId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    store.createShape('RECTANGLE', 0, 0, 40, 20, cardId, 'Note')
  }, card)
  await editor.canvas.waitForRender()

  const cardNode = await getNodeById(editor.page, card)
  const middleNode = await getNodeById(editor.page, middle)
  expect(cardNode?.width).toBe(400)
  expect(middleNode?.width).toBeGreaterThan(80)
})
