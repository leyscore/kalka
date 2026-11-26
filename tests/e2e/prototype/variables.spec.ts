import type { Page } from '@playwright/test'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

/** Home with a Button and a Label bound to `message`, Details, and the variables they use. */
async function createCounter(page: Page) {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const graph = store.graph
    const pageId = store.state.currentPageId
    const solid = (r: number, g: number, b: number) => [
      { type: 'SOLID' as const, color: { r, g, b, a: 1 }, opacity: 1, visible: true }
    ]
    const collection = graph.createCollection('State')
    const count = graph.createVariable('count', 'FLOAT', collection.id, 0)
    const message = graph.createVariable('message', 'STRING', collection.id, 'Start')
    const home = graph.createNode('FRAME', pageId, {
      name: 'Home',
      width: 300,
      height: 400,
      fills: solid(1, 1, 1)
    })
    const button = graph.createNode('RECTANGLE', home.id, {
      name: 'Button',
      x: 40,
      y: 40,
      width: 120,
      height: 40,
      fills: solid(0.1, 0.4, 1)
    })
    const label = graph.createNode('TEXT', home.id, {
      name: 'Label',
      x: 40,
      y: 120,
      width: 200,
      height: 24,
      text: 'Start',
      fontSize: 16
    })
    graph.bindVariable(label.id, 'text', message.id)
    const details = graph.createNode('FRAME', pageId, {
      name: 'Details',
      x: 500,
      width: 300,
      height: 400,
      fills: solid(0.95, 0.9, 0.8)
    })
    store.select([button.id])
    store.zoomToFit()
    return {
      homeId: home.id,
      buttonId: button.id,
      detailsId: details.id,
      countId: count.id,
      messageId: message.id
    }
  })
}

function frame(page: Page, id: string) {
  return page.locator(`[data-present-frame="${id}"]`)
}

test('set variable and conditional actions change what the presented prototype shows', async () => {
  const { page } = editor
  const ids = await createCounter(page)

  await page.getByRole('tab', { name: 'Prototype' }).click()
  const panel = page.getByTestId('prototype-panel')
  await panel.getByRole('button', { name: 'Add interaction' }).click()
  await panel.locator('[data-property="prototype-action"]').click()
  await page.getByRole('option', { name: 'Set variable', exact: true }).click()
  await panel.locator('[data-property="prototype-variable"]').click()
  await page.getByRole('option', { name: 'count' }).click()

  const value = panel.locator('[data-property="prototype-expression"]')
  await value.fill('count +')
  await value.press('Enter')
  await value.blur()
  await expect(panel.getByRole('alert')).toContainText('not valid')
  await value.fill('count + 1')
  await value.blur()
  await expect(panel.getByRole('alert')).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate((id) => {
        const action = window.kalka?.getStore?.().graph.getNode(id)?.reactions[0]?.actions[0]
        return action?.type === 'SET_VARIABLE' ? action.value : null
      }, ids.buttonId)
    )
    .toEqual({
      type: 'EXPRESSION',
      operator: 'ADDITION',
      operands: [
        { type: 'VARIABLE', variableId: ids.countId },
        { type: 'VALUE', value: 1 }
      ]
    })

  // Then the label tells the count, and from two clicks on the button goes to Details.
  await panel.getByTestId('prototype-add-action').last().click()
  await panel.locator('[data-property="prototype-action"]').nth(1).click()
  await page.getByRole('option', { name: 'Conditional' }).click()
  await expect(panel.getByTestId('prototype-condition-block')).toHaveCount(1)
  await page.evaluate(({ buttonId, countId, messageId, detailsId }) => {
    const store = window.kalka?.getStore?.()
    const reaction = store?.graph.getNode(buttonId)?.reactions[0]
    if (!store || !reaction) throw new Error('no interaction')
    store.setReactions(buttonId, [
      {
        ...reaction,
        actions: [
          reaction.actions[0],
          {
            type: 'SET_VARIABLE',
            variableId: messageId,
            value: {
              type: 'EXPRESSION',
              operator: 'ADDITION',
              operands: [
                { type: 'VALUE', value: 'Count ' },
                { type: 'VARIABLE', variableId: countId }
              ]
            }
          },
          {
            type: 'CONDITIONAL',
            blocks: [
              {
                condition: {
                  type: 'EXPRESSION',
                  operator: 'GREATER_THAN_OR_EQUAL',
                  operands: [
                    { type: 'VARIABLE', variableId: countId },
                    { type: 'VALUE', value: 2 }
                  ]
                },
                actions: [
                  {
                    type: 'NODE',
                    destinationId: detailsId,
                    navigation: 'NAVIGATE',
                    transition: null,
                    preserveScrollPosition: false,
                    resetScrollPosition: false,
                    overlayRelativePosition: null
                  }
                ]
              }
            ]
          }
        ]
      }
    ])
  }, ids)
  await expect(panel.locator('[data-property="prototype-expression"]').nth(2)).toHaveValue(
    'count >= 2'
  )

  await page.evaluate((id) => window.kalka?.getStore?.().select([id]), ids.homeId)
  await page.getByTestId('canvas-element').focus()
  await page.keyboard.press('ControlOrMeta+Alt+Enter')
  await expect(page.getByTestId('prototype-presenter')).toBeVisible()
  const home = frame(page, ids.homeId)
  await expect(home.locator('[data-layer="Label"]')).toContainText('Start')

  await home.locator('[data-layer="Button"]').click()
  await expect(home.locator('[data-layer="Label"]')).toContainText('Count 1')
  await expect(frame(page, ids.detailsId)).toHaveCount(0)

  await home.locator('[data-layer="Button"]').click()
  await expect(frame(page, ids.detailsId)).toBeVisible()

  // The document keeps its own values.
  const saved = await page.evaluate(
    (id) => window.kalka?.getStore?.().graph.variables.get(id)?.valuesByMode,
    ids.countId
  )
  expect(Object.values(saved ?? {})).toEqual([0])
  await page.keyboard.press('Escape')
})
