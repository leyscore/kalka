import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma Draw's width profiles and brushes, from the stroke settings popover.

const editor = useEditorSetupWithClear('/?test')

/** An open path inside an artboard, selected, with a 12 px black stroke. */
async function setup() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frame = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Board',
      x: 40,
      y: 40,
      width: 400,
      height: 240
    })
    const path = store.graph.createNode('VECTOR', frame.id, {
      name: 'Path',
      x: 40,
      y: 100,
      width: 300,
      height: 40,
      strokes: [
        {
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          weight: 12,
          align: 'CENTER'
        }
      ],
      vectorNetwork: {
        vertices: [
          { x: 0, y: 40 },
          { x: 300, y: 0 }
        ],
        segments: [{ start: 0, end: 1, tangentStart: { x: 120, y: 0 }, tangentEnd: { x: -120, y: 0 } }],
        regions: []
      }
    })
    store.select([path.id])
    return { frame: frame.id, path: path.id }
  })
}

function layer(id: string) {
  return editor.page.evaluate((id) => {
    const node = window.kalka?.getStore?.().graph.getNode(id)
    return node ? { profile: node.strokeWidthProfile, brush: node.strokeBrush } : null
  }, id)
}

/** The fill and stroke of each path the artboard's SVG draws. */
function drawnPaths(frame: string) {
  return editor.page.evaluate((frame) => {
    const doc = document.querySelector<HTMLIFrameElement>(
      `iframe[data-kalka-artboard="${frame}"]`
    )?.contentDocument
    return [...(doc?.querySelectorAll('svg path') ?? [])].map((path) => ({
      fill: path.getAttribute('fill'),
      stroke: path.getAttribute('stroke')
    }))
  }, frame)
}

test('a width profile and a brush are set from the stroke settings and drawn as outlines', async () => {
  const { page } = editor
  const { frame, path } = await setup()
  await page.locator('[data-property="stroke-settings"]').first().click()

  await page.getByRole('combobox', { name: 'Width profile' }).click()
  await page.getByRole('option', { name: 'Eye', exact: true }).click()
  await expect.poll(async () => (await layer(path))?.profile.length).toBe(3)
  await expect.poll(async () => (await layer(path))?.profile[1]).toEqual({
    position: 0.5,
    ascent: 0.5,
    descent: 0.5
  })
  // The stroke is a filled shape in the stroke's colour, not an SVG stroke.
  await expect
    .poll(async () => (await drawnPaths(frame)).some((p) => p.fill === '#000000' && !p.stroke))
    .toBe(true)

  await page.getByRole('button', { name: 'Scatter', exact: true }).click()
  await expect.poll(async () => (await layer(path))?.brush?.type).toBe('SCATTER')
  await page.getByRole('combobox', { name: 'Brush', exact: true }).click()
  await page.getByRole('option', { name: 'Stars', exact: true }).click()
  await expect.poll(async () => (await layer(path))?.brush?.id).toBe('stars')
  const gap = page.locator('[data-property="stroke-brush-gap"]')
  await gap.click()
  await gap.getByRole('spinbutton', { name: 'Gap' }).fill('3')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await layer(path))?.brush?.gap).toBe(3)

  await page.getByRole('button', { name: 'None', exact: true }).click()
  await expect.poll(async () => (await layer(path))?.brush).toBeNull()

  await page.keyboard.press('Escape')
  await editor.canvas.undo()
  await expect.poll(async () => (await layer(path))?.brush?.gap).toBe(3)
  await editor.canvas.undo()
  await expect.poll(async () => (await layer(path))?.brush?.gap).toBe(1.5)
  editor.canvas.assertNoErrors()
})

/** A page point on the screen. */
async function toScreen(x: number, y: number) {
  const box = await editor.canvas.canvas.boundingBox()
  const view = await editor.page.evaluate(() => {
    const state = window.kalka?.getStore?.().state
    if (!state) throw new Error('Kalka store not initialized')
    return { zoom: state.zoom, panX: state.panX, panY: state.panY }
  })
  return {
    x: (box?.x ?? 0) + x * view.zoom + view.panX,
    y: (box?.y ?? 0) + y * view.zoom + view.panY
  }
}

test('the Variable width tool adds a width point by dragging out from the path', async () => {
  const { page } = editor
  const { path } = await setup()
  await page.keyboard.press('Shift+W')
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.activeTool))
    .toBe('VARIABLE_WIDTH')
  // The path runs from (80, 180) to (380, 140) on the page; its middle is at (230, 160).
  const start = await toScreen(230, 160)
  await page.mouse.move(start.x, start.y)
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.widthEdit?.hover !== null))
    .toBe(true)
  await page.mouse.down()
  await page.mouse.move(start.x, start.y - 20, { steps: 4 })
  await page.mouse.up()

  const profile = (await layer(path))?.profile ?? []
  expect(profile.length).toBe(3)
  expect(profile[1].position).toBeCloseTo(0.5, 1)
  // 20 px out from a 12 px stroke: each side reaches 20 px, 5/3 of the weight.
  expect(profile[1].ascent).toBeGreaterThan(1.3)
  expect(profile[1].ascent).toBeCloseTo(profile[1].descent)

  await editor.canvas.undo()
  await expect.poll(async () => (await layer(path))?.profile).toEqual([])
  editor.canvas.assertNoErrors()
})
