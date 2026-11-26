import { BLACK } from '@kalka/core/constants'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'
import { openAppMenu } from '#tests/helpers/menu'

// Figma's Vector menu: Join and Delete and heal on the points chosen in a path being edited, and
// Reverse path direction and Offset path on a selected layer.

const editor = useEditorSetupWithClear()

/** An open path with a sharp top: (200, 400) → (300, 200) → (400, 400) on the canvas. */
async function addPeak() {
  await editor.page.evaluate((black) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const straight = { tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }
    const node = store.graph.createNode('VECTOR', store.state.currentPageId, {
      name: 'Peak',
      x: 200,
      y: 200,
      width: 200,
      height: 200,
      strokes: [
        {
          type: 'SOLID',
          color: black,
          opacity: 1,
          visible: true,
          weight: 2,
          align: 'CENTER'
        }
      ],
      vectorNetwork: {
        vertices: [
          { x: 0, y: 200 },
          { x: 100, y: 0 },
          { x: 200, y: 200 }
        ],
        segments: [
          { start: 0, end: 1, ...straight },
          { start: 1, end: 2, ...straight }
        ],
        regions: []
      }
    })
    store.select([node.id])
  }, BLACK)
  await editor.canvas.waitForRender()
}

function editedPath() {
  return editor.page.evaluate(() => {
    const es = window.kalka?.getStore?.().state.nodeEditState
    return es
      ? { vertices: es.vertices.length, segments: es.segments.length, regions: es.regions.length }
      : null
  })
}

function selectedLayers() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return [...store.state.selectedIds].map((id) => {
      const node = store.graph.getNode(id)
      return {
        type: node?.type,
        x: node?.x,
        y: node?.y,
        width: node?.width,
        height: node?.height,
        firstSegment: node?.vectorNetwork?.segments[0]
      }
    })
  })
}

test('joins the chosen ends of a path and heals a point away', async () => {
  const { canvas, page } = editor
  await addPeak()
  await canvas.dblclick(250, 300)
  expect(await editedPath()).toEqual({ vertices: 3, segments: 2, regions: 0 })

  await canvas.click(200, 400)
  await page.keyboard.down('Shift')
  await canvas.click(400, 400)
  await page.keyboard.up('Shift')
  await page.keyboard.press('ControlOrMeta+j')
  // The path closes and takes a fill region, as one closed with the pen does.
  expect(await editedPath()).toEqual({ vertices: 3, segments: 3, regions: 1 })

  await canvas.click(300, 200)
  await page.keyboard.press('Shift+Backspace')
  expect(await editedPath()).toMatchObject({ vertices: 2 })

  await page.keyboard.press('ControlOrMeta+z')
  expect(await editedPath()).toMatchObject({ vertices: 3, segments: 3 })
})

test('reverses a path and offsets it from the Vector menu', async () => {
  const { page } = editor
  await addPeak()

  let menu = await openAppMenu(page, 'Vector')
  await menu.getByRole('menuitem', { name: 'Reverse path direction' }).click()
  const [reversed] = await selectedLayers()
  expect(reversed.firstSegment).toMatchObject({ start: 2, end: 1 })
  expect(reversed).toMatchObject({ x: 200, y: 200, width: 200, height: 200 })

  menu = await openAppMenu(page, 'Vector')
  await menu.getByRole('menuitem', { name: 'Offset path…' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('spinbutton').fill('8')
  await dialog.getByRole('button', { name: 'Apply' }).click()
  await expect(dialog).toBeHidden()
  await expect.poll(async () => (await selectedLayers())[0]?.type).toBe('VECTOR')
  const [offset] = await selectedLayers()
  // An open path becomes the outline around it, 8 px out on every side.
  expect(offset.x).toBeLessThan(200)
  expect(offset.width).toBeGreaterThan(210)
})
