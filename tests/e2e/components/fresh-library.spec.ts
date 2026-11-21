import { expect, test, type Page } from '@playwright/test'
import * as v from 'valibot'

import { CanvasHelper } from '#tests/helpers/canvas'

const ToolReply = v.object({ ok: v.literal(true), result: v.unknown() })

async function callTool(page: Page, name: string, args: Record<string, unknown>) {
  const reply = await page.evaluate(
    (call) =>
      window.kalka?.test?.automation?.('tool', {
        ...call,
        agent: { session: 'fresh-session', kind: 'mcp', client: 'claude-code' }
      }),
    { name, args }
  )
  return v.parse(ToolReply, reply).result
}

/** The computed background colour of the canvas element that holds a layer's text. */
function haloColor(page: Page) {
  return page.evaluate(() => {
    for (const frame of document.querySelectorAll<HTMLIFrameElement>('iframe')) {
      const body = frame.contentDocument?.body
      const label = [...(body?.querySelectorAll('*') ?? [])].find(
        (element) => element.textContent === 'Start a project' && element.children.length === 0
      )
      const button = label?.parentElement?.parentElement
      const halo = button?.firstElementChild
      if (halo && frame.contentWindow)
        return frame.contentWindow.getComputedStyle(halo).backgroundColor
    }
    return null
  })
}

test('Kalka Fresh is a built-in library that can be enabled and inserted from Assets', async ({
  page
}) => {
  const canvas = new CanvasHelper(page)
  await page.goto('/?test')
  await canvas.waitForInit()

  await page.getByTestId('left-panel-assets-tab').click()
  await page.getByRole('button', { name: 'Manage libraries' }).click()
  const manager = page.getByTestId('asset-libraries-dialog')
  const row = manager.getByText('Kalka Fresh').locator('..').locator('..')
  await expect(row.getByTestId('built-in-library')).toHaveText(
    'Built into Kalka, with credits to its sources'
  )
  await row.getByRole('button', { name: 'Enable library' }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'List view' }).click()
  await page
    .getByTestId('asset-item')
    .filter({ hasText: 'Halo button' })
    .getByTestId('asset-insert')
    .click()

  await expect
    .poll(() =>
      page.evaluate(() => {
        const graph = window.kalka?.getStore?.().graph
        const libraryOf = (id: string | null): string | undefined => {
          const node = id ? graph?.getNode(id) : undefined
          return node
            ? (node.librarySource?.identity.libraryId ?? libraryOf(node.parentId))
            : undefined
        }
        return [...(graph?.getAllNodes() ?? [])].some(
          (node) => node.type === 'INSTANCE' && libraryOf(node.componentId) === 'kalka-fresh'
        )
      })
    )
    .toBe(true)
})

test("an agent finds a Fresh component by intent and it takes the document's accent", async ({
  page
}) => {
  const canvas = new CanvasHelper(page)
  await page.goto('/?test')
  await canvas.waitForInit()

  const found = v.parse(
    v.object({ components: v.array(v.object({ asset_key: v.string() })) }),
    await callTool(page, 'search_library_components', { query: 'soft glowing primary button' })
  )
  expect(found.components.map((component) => component.asset_key)).toContain('halo-button')

  const frame = v.parse(
    v.object({ layers: v.array(v.object({ id: v.string() })) }),
    await callTool(page, 'write_html', {
      html: '<section style="width:480px;height:240px;display:flex;align-items:center;justify-content:center"></section>'
    })
  )
  const parent = frame.layers[0]?.id
  await callTool(page, 'insert_library_component', {
    library_id: 'kalka-fresh',
    asset_key: 'halo-button',
    parent_id: parent
  })
  await expect.poll(() => haloColor(page)).toBe('rgb(47, 91, 234)')

  const collection = v.parse(
    v.object({ id: v.string() }),
    await callTool(page, 'create_collection', { name: 'Colors' })
  )
  await callTool(page, 'create_variable', {
    name: 'accent',
    type: 'COLOR',
    collection_id: collection.id,
    value: '#e4572e'
  })
  await expect.poll(() => haloColor(page)).toBe('rgb(228, 87, 46)')
})
