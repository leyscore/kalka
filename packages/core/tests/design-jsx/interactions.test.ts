import { describe, expect, test } from 'bun:test'

import { expectDefined, getNodeOrThrow } from '#core-tests/helpers/assert'

import { renderJSX } from '@kalka/core/design-jsx'
import { sceneNodeToJSX } from '@kalka/design-jsx'
import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

function byName(graph: SceneGraph, name: string): SceneNode {
  const found = [...graph.getAllNodes()].find((node) => node.name === name)
  return expectDefined(found, name)
}

/** Interactions with each destination id replaced by its layer's name, to compare two graphs. */
function byDestinationName(value: unknown, graph: SceneGraph): unknown {
  if (Array.isArray(value)) return value.map((item) => byDestinationName(item, graph))
  if (typeof value !== 'object' || value === null) return value
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) =>
      key === 'destinationId' && typeof item === 'string'
        ? [key, graph.getNode(item)?.name ?? item]
        : [key, byDestinationName(item, graph)]
    )
  )
}

const FLOW = `
  <Frame name="Flow" flex="row" gap={40}>
    <Frame name="Home" w={240} h={160}>
      <Rectangle
        name="Open"
        w={96}
        h={32}
        interactions={[
          {
            actions: [
              {
                navigate: 'Details',
                transition: { type: 'SLIDE_IN', direction: 'RIGHT', duration: 0.4, easing: 'GENTLE' }
              }
            ]
          },
          { trigger: 'AFTER_TIMEOUT', delay: 2, actions: [{ overlay: 'Menu', position: { x: 0, y: 40 } }] },
          { trigger: 'ON_KEY_DOWN', keys: [27], actions: [{ back: true }] }
        ]}
      />
    </Frame>
    <Frame name="Details" w={240} h={160} interactions={[{ trigger: 'ON_DRAG', actions: [{ url: 'https://example.com', newTab: false }] }]} />
    <Frame name="Menu" w={120} h={80} />
  </Frame>
`

describe('interactions in design JSX', () => {
  test('an action goes to a layer written after it, by name, once the tree has rendered', async () => {
    const graph = new SceneGraph()
    const [result] = await renderJSX(graph, FLOW)
    expect(result.warnings).toBeUndefined()
    const open = byName(graph, 'Open')
    expect(open.reactions).toEqual([
      {
        trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] },
        actions: [
          {
            type: 'NODE',
            destinationId: byName(graph, 'Details').id,
            navigation: 'NAVIGATE',
            transition: {
              type: 'SLIDE_IN',
              direction: 'RIGHT',
              matchLayers: false,
              duration: 0.4,
              easing: { type: 'GENTLE', bezier: null, spring: null }
            },
            preserveScrollPosition: false,
            resetScrollPosition: false,
            overlayRelativePosition: null
          }
        ]
      },
      {
        trigger: { type: 'AFTER_TIMEOUT', delay: 2, keyCodes: [] },
        actions: [
          expect.objectContaining({
            navigation: 'OVERLAY',
            destinationId: byName(graph, 'Menu').id,
            overlayRelativePosition: { x: 0, y: 40 }
          })
        ]
      },
      { trigger: { type: 'ON_KEY_DOWN', delay: 0, keyCodes: [27] }, actions: [{ type: 'BACK' }] }
    ])
    expect(byName(graph, 'Details').reactions[0]?.actions).toEqual([
      { type: 'URL', url: 'https://example.com', openInNewTab: false }
    ])
  })

  test('a name that matches no layer leaves the action without a destination and warns', async () => {
    const graph = new SceneGraph()
    const [result] = await renderJSX(
      graph,
      `<Frame name="Home" interactions={[{ actions: [{ navigate: 'Nowhere' }] }]} />`
    )
    expect(result.warnings).toContain('<Home> interaction: no layer named "Nowhere".')
    const [action] = getNodeOrThrow(graph, result.id).reactions[0]?.actions ?? []
    expect(action).toMatchObject({ type: 'NODE', destinationId: null })
  })

  test('a malformed interaction is refused with where it is', async () => {
    const graph = new SceneGraph()
    await expect(
      renderJSX(graph, `<Frame interactions={[{ trigger: 'ON_WINK', actions: [] }]} />`)
    ).rejects.toThrow('Invalid interactions')
  })

  test('set variable, variable mode and conditionals take variables and modes by name', async () => {
    const graph = new SceneGraph()
    const theme = graph.createCollection('Theme')
    const dark = expectDefined(graph.createMode(theme.id, 'Dark'), 'Dark mode')
    const count = graph.createVariable('count', 'FLOAT', theme.id, 0)
    const [result] = await renderJSX(
      graph,
      `<Frame name="Counter" interactions={[{ actions: [
        { conditional: [
          { if: 'count >= 3', actions: [{ mode: 'Dark', collection: 'Theme' }] },
          { actions: [{ set: 'count', to: 'count + 1' }] }
        ] },
        { media: 'SKIP_TO', seconds: 4 }
      ] }]} />`
    )
    expect(result.warnings).toBeUndefined()
    const [conditional, media] = getNodeOrThrow(graph, result.id).reactions[0]?.actions ?? []
    expect(conditional).toEqual({
      type: 'CONDITIONAL',
      blocks: [
        {
          condition: {
            type: 'EXPRESSION',
            operator: 'GREATER_THAN_OR_EQUAL',
            operands: [
              { type: 'VARIABLE', variableId: count.id },
              { type: 'VALUE', value: 3 }
            ]
          },
          actions: [{ type: 'SET_VARIABLE_MODE', collectionId: theme.id, modeId: dark }]
        },
        {
          condition: null,
          actions: [
            {
              type: 'SET_VARIABLE',
              variableId: count.id,
              value: {
                type: 'EXPRESSION',
                operator: 'ADDITION',
                operands: [
                  { type: 'VARIABLE', variableId: count.id },
                  { type: 'VALUE', value: 1 }
                ]
              }
            }
          ]
        }
      ]
    })
    expect(media).toEqual({
      type: 'UPDATE_MEDIA_RUNTIME',
      destinationId: null,
      mediaAction: 'SKIP_TO',
      amountToSkip: 0,
      newTimestamp: 4
    })
  })

  test('exported JSX writes interactions back by name and renders the same interactions', async () => {
    const graph = new SceneGraph()
    const theme = graph.createCollection('Theme')
    graph.createMode(theme.id, 'Dark')
    graph.createVariable('count', 'FLOAT', theme.id, 0)
    const [flow] = await renderJSX(graph, FLOW)
    const menu = byName(graph, 'Menu')
    await renderJSX(
      graph,
      `<Frame name="Counter" interactions={[{ trigger: 'ON_MEDIA_HIT', at: 1.5, actions: [
        { conditional: [{ if: 'count >= 3', actions: [{ mode: 'Dark', collection: 'Theme' }] },
          { actions: [{ set: 'count', to: 'count + 1' }] }] },
        { media: 'SKIP_FORWARD', target: 'Menu', seconds: 5 }
      ] }]} />`
    )
    const jsx = sceneNodeToJSX(flow.id, graph)
    expect(jsx).toContain('navigate: "Details"')
    expect(jsx).toContain('overlay: "Menu"')
    const counterJSX = sceneNodeToJSX(byName(graph, 'Counter').id, graph)
    expect(counterJSX).toContain('set: "count"')
    expect(counterJSX).toContain('to: "count + 1"')

    const copy = new SceneGraph()
    copy.addCollection(structuredClone(theme))
    for (const variable of graph.variables.values()) copy.addVariable(structuredClone(variable))
    await renderJSX(copy, jsx)
    await renderJSX(copy, counterJSX)
    const strip = (node: SceneNode, names: SceneGraph) => byDestinationName(node.reactions, names)
    for (const name of ['Open', 'Details', 'Counter'])
      expect(strip(byName(copy, name), copy)).toEqual(strip(byName(graph, name), graph))
    // A layer without interactions writes none.
    expect(sceneNodeToJSX(menu.id, graph)).not.toContain('interactions')
  })
})
