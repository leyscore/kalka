import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

function tool(name: string) {
  const found = ALL_TOOLS.find((candidate) => candidate.name === name)
  if (!found) throw new Error(`no tool ${name}`)
  return found
}

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const home = figma.createFrame()
  const details = figma.createFrame()
  const button = figma.createRectangle()
  home.appendChild(button)
  return { graph, figma, home, details, button }
}

describe('prototype tools', () => {
  test('set_interactions writes Figma-shaped reactions and get_interactions reads them', async () => {
    const { graph, figma, details, button } = setup()
    const collection = graph.createCollection('State')
    const count = graph.createVariable('count', 'FLOAT', collection.id, 0)
    const reactions = [
      {
        trigger: { type: 'ON_CLICK' },
        actions: [
          {
            type: 'SET_VARIABLE',
            variableId: count.id,
            variableValue: { type: 'FLOAT', resolvedType: 'FLOAT', value: 1 }
          },
          {
            type: 'NODE',
            destinationId: details.id,
            navigation: 'NAVIGATE',
            transition: null
          }
        ]
      }
    ]
    const written = await tool('set_interactions').execute(figma, { id: button.id, reactions })
    expect(written).toMatchObject({ id: button.id })
    expect(graph.getNode(button.id)?.reactions[0].actions.map((action) => action.type)).toEqual([
      'SET_VARIABLE',
      'NODE'
    ])
    const read = await tool('get_interactions').execute(figma, { id: button.id })
    expect(read).toMatchObject({
      reactions: [
        { trigger: { type: 'ON_CLICK' }, actions: [{ type: 'SET_VARIABLE' }, { type: 'NODE' }] }
      ]
    })
  })

  test('an action Kalka cannot play comes back as an error, and flows are set in order', async () => {
    const { figma, home, details, button } = setup()
    const refused = await tool('set_interactions').execute(figma, {
      id: button.id,
      reactions: [
        {
          trigger: { type: 'ON_CLICK' },
          actions: [{ type: 'UPDATE_MEDIA_RUNTIME', destinationId: null, mediaAction: 'PLAY' }]
        }
      ]
    })
    expect(refused).toMatchObject({ error: expect.stringContaining('UPDATE_MEDIA_RUNTIME') })

    const flows = await tool('set_prototype_flows').execute(figma, {
      flows: [
        { node_id: details.id, name: 'Checkout' },
        { node_id: home.id, name: 'Sign up' }
      ]
    })
    expect(flows).toEqual({
      flows: [
        { nodeId: details.id, name: 'Checkout' },
        { nodeId: home.id, name: 'Sign up' }
      ]
    })
    expect(await tool('get_interactions').execute(figma, { id: home.id })).toMatchObject({
      flow: 'Sign up'
    })
  })
})
