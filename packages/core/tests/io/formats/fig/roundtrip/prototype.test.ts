import { beforeAll, describe, expect, test } from 'bun:test'

import { exportFigFile, initCodec, parseFigFile, SceneGraph, type NodeChange } from '@kalka/core'
import { materializeDocument, parseFigBuffer } from '@kalka/fig'
import {
  createNodeAction,
  createPrototypeTransition,
  type GUID,
  type SceneNode
} from '@kalka/scene-graph'

const IDENTITY = { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }

function record(overrides: Partial<NodeChange>): NodeChange {
  return {
    visible: true,
    opacity: 1,
    phase: 'CREATED',
    transform: IDENTITY,
    ...overrides
  } as NodeChange
}

function byName(graph: SceneGraph, name: string): SceneNode {
  const node = [...graph.getAllNodes()].find((candidate) => candidate.name === name)
  if (!node) throw new Error(`no layer ${name}`)
  return node
}

describe('.fig prototype round trip', () => {
  beforeAll(async () => {
    await initCodec()
  })

  test('reads Figma interactions, scrolling, overlays and flows', () => {
    const { graph } = materializeDocument([
      record({ guid: { sessionID: 0, localID: 0 }, type: 'DOCUMENT', name: 'Document' }),
      record({
        guid: { sessionID: 0, localID: 1 },
        parentIndex: { guid: { sessionID: 0, localID: 0 }, position: '!' },
        type: 'CANVAS',
        name: 'Page 1',
        prototypeDevice: { type: 'PRESET', size: { x: 393, y: 852 }, presetIdentifier: 'IPHONE_16' }
      }),
      record({
        guid: { sessionID: 1, localID: 2 },
        parentIndex: { guid: { sessionID: 0, localID: 1 }, position: '!' },
        type: 'FRAME',
        name: 'Home',
        size: { x: 390, y: 844 },
        scrollDirection: 'VERTICAL',
        prototypeStartingPoint: { name: 'Onboarding', description: 'First run', position: 'a' },
        prototypeInteractions: [
          {
            event: { interactionType: 'ON_CLICK' },
            actions: [
              {
                connectionType: 'INTERNAL_NODE',
                transitionNodeID: { sessionID: 1, localID: 3 },
                navigationType: 'NAVIGATE',
                transitionType: 'SLIDE_FROM_RIGHT',
                transitionDuration: 0.4,
                easingType: 'INOUT_CUBIC'
              }
            ]
          },
          {
            event: { interactionType: 'AFTER_TIMEOUT', transitionTimeout: 2 },
            actions: [{ connectionType: 'BACK' }]
          },
          {
            event: { interactionType: 'ON_CLICK' },
            actions: [{ connectionType: 'UPDATE_MEDIA_RUNTIME', mediaAction: 'PLAY' }]
          }
        ]
      }),
      record({
        guid: { sessionID: 1, localID: 3 },
        parentIndex: { guid: { sessionID: 0, localID: 1 }, position: '"' },
        type: 'FRAME',
        name: 'Menu',
        size: { x: 200, y: 300 },
        overlayPositionType: 'TOP_RIGHT',
        overlayBackgroundInteraction: 'CLOSE_ON_CLICK_OUTSIDE',
        overlayBackgroundAppearance: {
          backgroundType: 'SOLID_COLOR',
          backgroundColor: { r: 0, g: 0, b: 0, a: 0.4 }
        },
        scrollBehavior: 'FIXED_WHEN_CHILD_OF_SCROLLING_FRAME'
      })
    ])
    const home = byName(graph, 'Home')
    const menu = byName(graph, 'Menu')
    expect(home.overflowDirection).toBe('VERTICAL')
    expect(home.prototypeStartingPoint).toEqual({
      name: 'Onboarding',
      description: 'First run',
      position: 'a'
    })
    expect(home.reactions).toHaveLength(2)
    expect(home.reactions[0]).toEqual({
      trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] },
      actions: [
        {
          type: 'NODE',
          destinationId: menu.id,
          navigation: 'NAVIGATE',
          transition: {
            type: 'SLIDE_IN',
            direction: 'LEFT',
            matchLayers: false,
            duration: 0.4,
            easing: { type: 'EASE_IN_AND_OUT', bezier: null, spring: null }
          },
          preserveScrollPosition: false,
          resetScrollPosition: false,
          overlayRelativePosition: null
        }
      ]
    })
    expect(home.reactions[1].trigger).toEqual({ type: 'AFTER_TIMEOUT', delay: 2, keyCodes: [] })
    expect(menu.overlayPositionType).toBe('TOP_RIGHT')
    expect(menu.overlayBackgroundInteraction).toBe('CLOSE_ON_CLICK_OUTSIDE')
    expect(menu.overlayBackground).toEqual({ r: 0, g: 0, b: 0, a: 0.4 })
    expect(menu.scrollBehavior).toBe('FIXED')
    expect(graph.getPages()[0].prototypeDevice).toEqual({
      presetIdentifier: 'IPHONE_16',
      size: { x: 393, y: 852 },
      rotation: 'NONE'
    })
  })

  test('writes interactions made in Kalka and reads them back', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const second = graph.createNode('FRAME', page.id, { name: 'Second', x: 500 })
    const smart = createNodeAction(second.id)
    smart.transition = { ...createPrototypeTransition('SMART_ANIMATE'), duration: 0.6 }
    const first = graph.createNode('FRAME', page.id, {
      name: 'First',
      overflowDirection: 'BOTH',
      prototypeStartingPoint: { name: 'Flow 1', description: '', position: 'a' },
      reactions: [
        { trigger: { type: 'ON_HOVER', delay: 0, keyCodes: [] }, actions: [smart] },
        {
          trigger: { type: 'ON_KEY_DOWN', delay: 0, keyCodes: [16, 75] },
          actions: [{ type: 'URL', url: 'https://example.com', openInNewTab: false }]
        }
      ]
    })
    graph.createNode('RECTANGLE', first.id, { name: 'Sticky', scrollBehavior: 'STICKY_SCROLLS' })
    graph.updateNode(page.id, { prototypeBackground: { r: 1, g: 0, b: 0, a: 1 } })

    const bytes = await exportFigFile(graph)
    const reimported = await parseFigFile(bytes.buffer as ArrayBuffer)
    const firstBack = byName(reimported, 'First')
    const secondBack = byName(reimported, 'Second')
    expect(firstBack.overflowDirection).toBe('BOTH')
    expect(firstBack.prototypeStartingPoint?.name).toBe('Flow 1')
    expect(firstBack.reactions).toEqual(
      first.reactions.map((reaction, index) =>
        index === 0
          ? {
              ...reaction,
              actions: [{ ...smart, destinationId: secondBack.id }]
            }
          : reaction
      )
    )
    expect(byName(reimported, 'Sticky').scrollBehavior).toBe('STICKY_SCROLLS')
    expect(reimported.getPages()[0].prototypeBackground).toEqual({ r: 1, g: 0, b: 0, a: 1 })
  })

  test('keeps interactions Kalka does not play while the layer keeps its own', async () => {
    const records = [
      record({ guid: { sessionID: 0, localID: 0 }, type: 'DOCUMENT', name: 'Document' }),
      record({
        guid: { sessionID: 0, localID: 1 },
        parentIndex: { guid: { sessionID: 0, localID: 0 }, position: '!' },
        type: 'CANVAS',
        name: 'Page 1'
      }),
      record({
        guid: { sessionID: 1, localID: 2 },
        parentIndex: { guid: { sessionID: 0, localID: 1 }, position: '!' },
        type: 'FRAME',
        name: 'Counter',
        size: { x: 100, y: 100 },
        prototypeInteractions: [
          {
            event: { interactionType: 'ON_CLICK' },
            actions: [{ connectionType: 'UPDATE_MEDIA_RUNTIME', mediaAction: 'PLAY' }]
          }
        ]
      })
    ]
    const { graph } = materializeDocument(records)
    const written = parseFigBuffer((await exportFigFile(graph)).buffer as ArrayBuffer)
    const counter = written.nodeChanges.find((nc) => nc.name === 'Counter')
    expect(counter?.prototypeInteractions).toHaveLength(1)

    // Removing the layer's interactions does not bring the file's back.
    graph.updateNode(byName(graph, 'Counter').id, { reactions: [] })
    const cleared = parseFigBuffer((await exportFigFile(graph)).buffer as ArrayBuffer)
    expect(
      cleared.nodeChanges.find((nc) => nc.name === 'Counter')?.prototypeInteractions
    ).toBeUndefined()
  })

  test("opens a page's legacy start frame as its one flow", () => {
    const page = (start: number, flow: boolean) => [
      record({ guid: { sessionID: 0, localID: 0 }, type: 'DOCUMENT', name: 'Document' }),
      record({
        guid: { sessionID: 0, localID: 1 },
        parentIndex: { guid: { sessionID: 0, localID: 0 }, position: '!' },
        type: 'CANVAS',
        name: 'Page 1',
        prototypeStartNodeID: { sessionID: 1, localID: start }
      }),
      record({
        guid: { sessionID: 1, localID: 2 },
        parentIndex: { guid: { sessionID: 0, localID: 1 }, position: '!' },
        type: 'FRAME',
        name: 'Home',
        size: { x: 390, y: 844 }
      }),
      record({
        guid: { sessionID: 1, localID: 3 },
        parentIndex: { guid: { sessionID: 0, localID: 1 }, position: '"' },
        type: 'FRAME',
        name: 'Menu',
        size: { x: 390, y: 844 },
        ...(flow
          ? { prototypeStartingPoint: { name: 'Main', description: '', position: 'a' } }
          : {})
      })
    ]
    const legacy = materializeDocument(page(3, false)).graph
    expect(byName(legacy, 'Menu').prototypeStartingPoint?.name).toBe('Flow 1')
    expect(byName(legacy, 'Home').prototypeStartingPoint).toBeNull()

    const flows = materializeDocument(page(2, true)).graph
    expect(byName(flows, 'Home').prototypeStartingPoint).toBeNull()
    expect(byName(flows, 'Menu').prototypeStartingPoint?.name).toBe('Main')
  })

  test('reads and writes set variable, set variable mode and conditional actions', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const collection = graph.createCollection('Theme')
    const dark = graph.createMode(collection.id, 'Dark')
    const count = graph.createVariable('count', 'FLOAT', collection.id, 0)
    const done = graph.createVariable('done', 'BOOLEAN', collection.id, false)
    const next = graph.createNode('FRAME', page.id, { name: 'Next', x: 500 })
    const reactions: SceneNode['reactions'] = [
      {
        trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] },
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
          },
          { type: 'SET_VARIABLE_MODE', collectionId: collection.id, modeId: dark ?? null },
          {
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
                actions: [createNodeAction(next.id)]
              },
              {
                condition: null,
                actions: [
                  {
                    type: 'SET_VARIABLE',
                    variableId: done.id,
                    value: { type: 'VALUE', value: true }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
    graph.createNode('FRAME', page.id, { name: 'Counter', reactions })

    const written = parseFigBuffer((await exportFigFile(graph)).buffer as ArrayBuffer)
    const interactions = written.nodeChanges.find((nc) => nc.name === 'Counter')
      ?.prototypeInteractions as { id?: unknown; actions: { connectionType: string }[] }[]
    expect(interactions[0].actions.map((action) => action.connectionType)).toEqual([
      'SET_VARIABLE',
      'SET_VARIABLE_MODE',
      'CONDITIONAL'
    ])
    expect(interactions[0].id).toBeDefined()

    const reimported = await parseFigFile((await exportFigFile(graph)).buffer as ArrayBuffer)
    const back = byName(reimported, 'Counter').reactions[0].actions
    const countBack = [...reimported.variables.values()].find((v) => v.name === 'count')
    const doneBack = [...reimported.variables.values()].find((v) => v.name === 'done')
    const nextBack = byName(reimported, 'Next')
    const collectionBack = [...reimported.variableCollections.values()].find(
      (c) => c.name === 'Theme'
    )
    expect(back[0]).toEqual({
      type: 'SET_VARIABLE',
      variableId: countBack?.id ?? '',
      value: {
        type: 'EXPRESSION',
        operator: 'ADDITION',
        operands: [
          { type: 'VARIABLE', variableId: countBack?.id ?? '' },
          { type: 'VALUE', value: 1 }
        ]
      }
    })
    expect(back[1]).toEqual({
      type: 'SET_VARIABLE_MODE',
      collectionId: collectionBack?.id ?? '',
      modeId: collectionBack?.modes.find((mode) => mode.name === 'Dark')?.modeId ?? ''
    })
    expect(back[2]).toEqual({
      type: 'CONDITIONAL',
      blocks: [
        {
          condition: {
            type: 'EXPRESSION',
            operator: 'GREATER_THAN_OR_EQUAL',
            operands: [
              { type: 'VARIABLE', variableId: countBack?.id ?? '' },
              { type: 'VALUE', value: 3 }
            ]
          },
          actions: [createNodeAction(nextBack.id)]
        },
        {
          condition: null,
          actions: [
            {
              type: 'SET_VARIABLE',
              variableId: doneBack?.id ?? '',
              value: { type: 'VALUE', value: true }
            }
          ]
        }
      ]
    })
  })

  test("gives a copied layer's interactions GUIDs of their own", async () => {
    const interaction = {
      id: { sessionID: 1, localID: 90 },
      event: { interactionType: 'ON_CLICK' },
      actions: [{ connectionType: 'UPDATE_MEDIA_RUNTIME', mediaAction: 'PLAY' }]
    }
    const { graph } = materializeDocument([
      record({ guid: { sessionID: 0, localID: 0 }, type: 'DOCUMENT', name: 'Document' }),
      record({
        guid: { sessionID: 0, localID: 1 },
        parentIndex: { guid: { sessionID: 0, localID: 0 }, position: '!' },
        type: 'CANVAS',
        name: 'Page 1'
      }),
      ...['A', 'B'].map((name, index) =>
        record({
          guid: { sessionID: 1, localID: 2 + index },
          parentIndex: { guid: { sessionID: 0, localID: 1 }, position: index ? '"' : '!' },
          type: 'FRAME',
          name,
          size: { x: 100, y: 100 },
          prototypeInteractions: [structuredClone(interaction)]
        })
      )
    ])
    const written = parseFigBuffer((await exportFigFile(graph)).buffer as ArrayBuffer)
    const ids = ['A', 'B'].map((name) => {
      const interactions = written.nodeChanges.find((nc) => nc.name === name)
        ?.prototypeInteractions as { id: GUID }[]
      return `${interactions[0].id.sessionID}:${interactions[0].id.localID}`
    })
    expect(ids[0]).toBe('1:90')
    expect(ids[1]).not.toBe('1:90')
  })
})
