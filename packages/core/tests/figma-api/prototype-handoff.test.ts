import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { frameReview, SceneGraph } from '@kalka/scene-graph'

function setup() {
  const graph = new SceneGraph()
  const api = new FigmaAPI(graph)
  const home = api.createFrame()
  home.name = 'Home'
  const details = api.createFrame()
  details.name = 'Details'
  const button = api.createRectangle()
  home.appendChild(button)
  return { api, graph, home, details, button }
}

describe('prototype through the Plugin API', () => {
  test('setReactionsAsync takes Figma reactions and reactions reads them back', async () => {
    const { graph, button, details } = setup()
    await button.setReactionsAsync([
      {
        trigger: { type: 'ON_CLICK' },
        actions: [
          {
            type: 'NODE',
            destinationId: details.id,
            navigation: 'NAVIGATE',
            transition: {
              type: 'SLIDE_IN',
              direction: 'LEFT',
              matchLayers: false,
              duration: 0.3,
              easing: {
                type: 'CUSTOM_CUBIC_BEZIER',
                easingFunctionCubicBezier: { x1: 0.2, y1: 0, x2: 0.2, y2: 1 }
              }
            }
          }
        ]
      },
      { trigger: { type: 'AFTER_TIMEOUT', timeout: 2 }, actions: [{ type: 'BACK' }] },
      { trigger: null, actions: [] }
    ])
    const [click, timeout] = graph.getNode(button.id)?.reactions ?? []
    expect(click.actions[0]).toMatchObject({
      type: 'NODE',
      destinationId: details.id,
      transition: { type: 'SLIDE_IN', easing: { bezier: { x1: 0.2, y1: 0, x2: 0.2, y2: 1 } } }
    })
    expect(timeout.trigger).toEqual({ type: 'AFTER_TIMEOUT', delay: 2, keyCodes: [] })

    expect(button.reactions).toHaveLength(2)
    expect(button.reactions[1]).toEqual({
      trigger: { type: 'AFTER_TIMEOUT', timeout: 2 },
      action: { type: 'BACK' },
      actions: [{ type: 'BACK' }]
    })
  })

  test('an action Kalka does not play is refused with why', async () => {
    const { button } = setup()
    expect(
      button.setReactionsAsync([
        {
          trigger: { type: 'ON_CLICK' },
          actions: [{ type: 'OBJECT_ANIMATION' }]
        }
      ])
    ).rejects.toThrow('OBJECT_ANIMATION')
  })

  test('media actions play, pause, mute and skip through a video', async () => {
    const { graph, button, home } = setup()
    const actions = [
      { type: 'UPDATE_MEDIA_RUNTIME', destinationId: home.id, mediaAction: 'TOGGLE_PLAY_PAUSE' },
      {
        type: 'UPDATE_MEDIA_RUNTIME',
        destinationId: null,
        mediaAction: 'SKIP_FORWARD',
        amountToSkip: 5
      },
      {
        type: 'UPDATE_MEDIA_RUNTIME',
        destinationId: null,
        mediaAction: 'SKIP_TO',
        newTimestamp: 12
      }
    ]
    await button.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions }])
    expect(graph.getNode(button.id)?.reactions[0].actions).toEqual([
      {
        type: 'UPDATE_MEDIA_RUNTIME',
        destinationId: home.id,
        mediaAction: 'TOGGLE_PLAY_PAUSE',
        amountToSkip: 0,
        newTimestamp: 0
      },
      {
        type: 'UPDATE_MEDIA_RUNTIME',
        destinationId: null,
        mediaAction: 'SKIP_FORWARD',
        amountToSkip: 5,
        newTimestamp: 0
      },
      {
        type: 'UPDATE_MEDIA_RUNTIME',
        destinationId: null,
        mediaAction: 'SKIP_TO',
        amountToSkip: 0,
        newTimestamp: 12
      }
    ])
    expect(button.reactions[0]?.actions as unknown).toEqual(actions)
  })

  test("variable actions take and give Figma's VariableData", async () => {
    const { graph, button } = setup()
    const collection = graph.createCollection('State')
    const show = graph.createVariable('show', 'BOOLEAN', collection.id, false)
    const conditional = {
      type: 'CONDITIONAL',
      conditionalBlocks: [
        {
          condition: {
            type: 'EXPRESSION',
            resolvedType: 'BOOLEAN',
            value: {
              expressionFunction: 'EQUALS',
              expressionArguments: [
                { type: 'VARIABLE_ALIAS', value: { type: 'VARIABLE_ALIAS', id: show.id } },
                { type: 'BOOLEAN', resolvedType: 'BOOLEAN', value: true }
              ]
            }
          },
          actions: [
            {
              type: 'SET_VARIABLE',
              variableId: show.id,
              variableValue: { type: 'BOOLEAN', resolvedType: 'BOOLEAN', value: false }
            }
          ]
        },
        {
          actions: [
            {
              type: 'SET_VARIABLE',
              variableId: show.id,
              variableValue: { type: 'BOOLEAN', resolvedType: 'BOOLEAN', value: true }
            }
          ]
        }
      ]
    }
    await button.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [conditional] }])
    expect(graph.getNode(button.id)?.reactions[0].actions[0]).toEqual({
      type: 'CONDITIONAL',
      blocks: [
        {
          condition: {
            type: 'EXPRESSION',
            operator: 'EQUALS',
            operands: [
              { type: 'VARIABLE', variableId: show.id },
              { type: 'VALUE', value: true }
            ]
          },
          actions: [
            { type: 'SET_VARIABLE', variableId: show.id, value: { type: 'VALUE', value: false } }
          ]
        },
        {
          condition: null,
          actions: [
            { type: 'SET_VARIABLE', variableId: show.id, value: { type: 'VALUE', value: true } }
          ]
        }
      ]
    })
    const [given] = button.reactions
    expect(given?.actions?.[0] as unknown).toEqual(conditional)
  })

  test('a variable mode lookup is VAR_MODE_LOOKUP over an alias and a mode id', async () => {
    const { graph, button } = setup()
    const collection = graph.createCollection('Theme')
    const dark = graph.createMode(collection.id, 'Dark') ?? ''
    const label = graph.createVariable('label', 'STRING', collection.id, 'Light')
    const action = {
      type: 'SET_VARIABLE',
      variableId: label.id,
      variableValue: {
        type: 'EXPRESSION',
        value: {
          expressionFunction: 'VAR_MODE_LOOKUP',
          expressionArguments: [
            { type: 'VARIABLE_ALIAS', value: { type: 'VARIABLE_ALIAS', id: label.id } },
            { type: 'STRING', resolvedType: 'STRING', value: dark }
          ]
        }
      }
    }
    await button.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [action] }])
    expect(graph.getNode(button.id)?.reactions[0].actions[0]).toEqual({
      type: 'SET_VARIABLE',
      variableId: label.id,
      value: { type: 'VARIABLE', variableId: label.id, modeId: dark }
    })
    expect(button.reactions[0]?.actions?.[0] as unknown).toEqual(action)
  })

  test("a page's flows are read and set by the frames they start at", () => {
    const { api, home, details } = setup()
    const page = api.currentPage
    page.flowStartingPoints = [
      { nodeId: details.id, name: 'Checkout' },
      { nodeId: home.id, name: 'Sign up' }
    ]
    expect(page.flowStartingPoints).toEqual([
      { nodeId: details.id, name: 'Checkout' },
      { nodeId: home.id, name: 'Sign up' }
    ])
    page.flowStartingPoints = [{ nodeId: home.id, name: 'Sign up' }]
    expect(page.flowStartingPoints).toEqual([{ nodeId: home.id, name: 'Sign up' }])
  })
})

describe('handoff through the Plugin API', () => {
  test('annotations, dev status and dev resources', async () => {
    const { graph, home, button } = setup()
    button.annotations = [
      { label: 'Tap target 44px', properties: [{ type: 'width' }], categoryId: 'accessibility' }
    ]
    expect(button.annotations).toEqual([
      { label: 'Tap target 44px', properties: [{ type: 'width' }], categoryId: 'accessibility' }
    ])
    button.annotations = []
    expect(button.annotations).toEqual([])

    home.devStatus = { type: 'READY_FOR_DEV', description: 'Ship it' }
    expect(frameReview(graph, home.id)?.status).toBe('ready')
    expect(home.devStatus).toEqual({ type: 'READY_FOR_DEV', description: 'Ship it' })
    expect(() => (button.devStatus = { type: 'COMPLETED' })).toThrow('top-level frame')
    home.devStatus = null
    expect(home.devStatus).toBeNull()

    await button.addDevResourceAsync('https://example.com/spec', 'Spec')
    await button.editDevResourceAsync('https://example.com/spec', { name: 'Ticket' })
    expect(await home.getDevResourcesAsync({ includeChildren: true })).toEqual([
      { name: 'Ticket', url: 'https://example.com/spec', nodeId: button.id }
    ])
    expect(button.addDevResourceAsync('not a link')).rejects.toThrow('http')
    await button.deleteDevResourceAsync('https://example.com/spec')
    expect(await button.getDevResourcesAsync()).toEqual([])
  })
})
