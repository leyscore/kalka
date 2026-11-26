import { describe, expect, test } from 'bun:test'

import {
  createEditor,
  presentationStart,
  reactionFor,
  resolvePlayState,
  runAction,
  startPresentation,
  type ActionContext
} from '@kalka/core/editor'
import {
  createNodeAction,
  createPrototypeReaction,
  layerPath,
  type PrototypeAction,
  type SceneGraph
} from '@kalka/scene-graph'

function screens() {
  const editor = createEditor()
  const graph = editor.graph
  const pageId = editor.state.currentPageId
  const home = graph.createNode('FRAME', pageId, { name: 'Home', width: 390, height: 844 })
  const details = graph.createNode('FRAME', pageId, { name: 'Details', x: 500 })
  const menu = graph.createNode('FRAME', pageId, { name: 'Menu', x: 1000 })
  const button = graph.createNode('RECTANGLE', home.id, { name: 'Button' })
  return { editor, graph, pageId, home, details, menu, button }
}

function context(graph: SceneGraph, rootId: string, nodeId: string): ActionContext {
  const nodeIds: string[] = []
  graph.closest(nodeId, (node) => {
    nodeIds.push(node.id)
    return node.id === rootId
  })
  return { graph, rootId, nodeIds, pathOf: (id) => layerPath(graph, rootId, id) }
}

describe('presenting a prototype', () => {
  test('starts at the selected screen, else the first flow, else the first frame', () => {
    const { graph, pageId, home, details, button } = screens()
    expect(presentationStart(graph, pageId, [])).toBe(home.id)
    graph.updateNode(details.id, {
      prototypeStartingPoint: { name: 'Flow 1', description: '', position: 'a' }
    })
    expect(presentationStart(graph, pageId, [])).toBe(details.id)
    expect(presentationStart(graph, pageId, [button.id])).toBe(home.id)
  })

  test('Preview presents a page with interactions and runs the canvas otherwise', () => {
    const { editor, graph, home, details, button } = screens()
    editor.startPlay()
    expect(editor.state.play?.present).toBeNull()
    editor.stopPlay()
    graph.updateNode(button.id, { reactions: [createPrototypeReaction(details.id)] })
    editor.startPlay()
    expect(editor.state.play?.present).toEqual({ startId: home.id })
  })

  test('the top-most layer with the trigger runs; others let it through', () => {
    const { graph, home, details, button } = screens()
    graph.updateNode(home.id, { reactions: [createPrototypeReaction(details.id)] })
    const found = reactionFor(graph, [button.id, home.id], 'ON_CLICK')
    expect(found?.nodeId).toBe(home.id)
    expect(reactionFor(graph, [button.id, home.id], 'ON_HOVER')).toBeNull()
  })

  test('navigate, overlays and back', () => {
    const { graph, pageId, home, details, menu, button } = screens()
    let state = startPresentation(pageId, home.id)
    const run = (action: PrototypeAction, rootId = state.screenId, nodeId = button.id) => {
      const result = runAction(graph, state, action, context(graph, rootId, nodeId))
      if (result) state = result.state
      return result?.step ?? null
    }

    const overlay = { ...createNodeAction(menu.id, 'OVERLAY') }
    expect(run(overlay)).toMatchObject({ kind: 'overlay', frameId: menu.id, open: true })
    expect(state.overlays.map((entry) => entry.frameId)).toEqual([menu.id])
    expect(state.overlays[0].triggerId).toBe(button.id)

    // Back closes the top overlay first.
    expect(run({ type: 'BACK' })).toMatchObject({ kind: 'overlay', open: false })
    expect(state.overlays).toEqual([])

    const slide = createNodeAction(details.id)
    slide.transition = {
      type: 'SLIDE_IN',
      direction: 'LEFT',
      matchLayers: false,
      duration: 0.3,
      easing: { type: 'EASE_OUT', bezier: null, spring: null }
    }
    expect(run(slide)).toMatchObject({ kind: 'screen', from: home.id, to: details.id, back: false })
    expect(state.screenId).toBe(details.id)

    // Back plays the way in backwards.
    expect(run({ type: 'BACK' }, details.id, details.id)).toMatchObject({
      kind: 'screen',
      to: home.id,
      back: true,
      transition: slide.transition
    })
    expect(state.history).toEqual([])
    expect(run({ type: 'BACK' })).toBeNull()
  })

  test('change to shows another variant of the instance around the trigger', () => {
    const { editor, graph, pageId, home } = screens()
    const set = graph.createNode('COMPONENT_SET', pageId, {
      name: 'Toggle',
      componentPropertyDefinitions: [
        {
          id: 'state',
          name: 'State',
          type: 'VARIANT',
          defaultValue: 'Off',
          variantOptions: ['Off', 'On']
        }
      ]
    })
    const off = graph.createNode('COMPONENT', set.id, {
      name: 'State=Off',
      componentPropertyValues: { State: 'Off' }
    })
    const on = graph.createNode('COMPONENT', set.id, {
      name: 'State=On',
      componentPropertyValues: { State: 'On' }
    })
    const instanceId = editor.createInstanceFromComponent(off.id, 0, 0, home.id)
    if (!instanceId) throw new Error('no instance')
    const state = startPresentation(pageId, home.id)
    const result = runAction(
      graph,
      state,
      createNodeAction(on.id, 'CHANGE_TO'),
      context(graph, home.id, instanceId)
    )
    expect(result?.step).toMatchObject({ kind: 'variant', rootId: home.id, path: 'State=Off' })
    expect(result?.state.variants[home.id]).toEqual({ 'State=Off': { State: 'On' } })
  })

  test('variable actions set values and modes that bound layers show, and conditionals branch', () => {
    const { graph, pageId, home, details, button } = screens()
    const collection = graph.createCollection('Theme')
    const light = collection.defaultModeId
    const dark = graph.createMode(collection.id, 'Dark') ?? ''
    const count = graph.createVariable('count', 'FLOAT', collection.id, 0)
    const label = graph.createVariable('label', 'STRING', collection.id, 'Light')
    label.valuesByMode[dark] = 'Dark'
    const text = graph.createNode('TEXT', home.id, { name: 'Label', text: 'Light' })
    graph.bindVariable(text.id, 'text', label.id)

    const increment: PrototypeAction = {
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
    const ctx = context(graph, home.id, button.id)
    let state = startPresentation(pageId, home.id)
    for (let i = 0; i < 3; i++) {
      const result = runAction(graph, state, increment, ctx)
      expect(result?.step).toEqual({ kind: 'variables' })
      if (result) state = result.state
    }
    expect(state.variables.values[count.id]).toBe(3)

    const branch: PrototypeAction = {
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
          actions: [createNodeAction(details.id)]
        },
        { condition: null, actions: [{ type: 'BACK' }] }
      ]
    }
    expect(runAction(graph, state, branch, ctx)?.step).toEqual({
      kind: 'actions',
      actions: [createNodeAction(details.id)]
    })
    expect(runAction(graph, startPresentation(pageId, home.id), branch, ctx)?.step).toEqual({
      kind: 'actions',
      actions: [{ type: 'BACK' }]
    })

    const mode = runAction(
      graph,
      state,
      { type: 'SET_VARIABLE_MODE', collectionId: collection.id, modeId: dark },
      ctx
    )
    expect(mode?.state.variables.modes).toEqual({ [collection.id]: dark })
    const drawn = resolvePlayState(graph, home.id, new Map(), mode?.state.variables)
    expect(drawn.getNode(text.id)?.text).toBe('Dark')
    // The document keeps its own values and modes.
    expect(graph.getNode(text.id)?.text).toBe('Light')
    expect(graph.variables.get(count.id)?.valuesByMode[light]).toBe(0)

    // A value the variable cannot hold changes nothing.
    expect(
      runAction(
        graph,
        state,
        { type: 'SET_VARIABLE', variableId: count.id, value: { type: 'VALUE', value: 'many' } },
        ctx
      )
    ).toBeNull()
  })
  test('a mode lookup reads a variable in a given mode, whatever mode is chosen', () => {
    const { graph, pageId, home, button } = screens()
    const collection = graph.createCollection('Theme')
    const dark = graph.createMode(collection.id, 'Dark') ?? ''
    const label = graph.createVariable('label', 'STRING', collection.id, 'Light')
    label.valuesByMode[dark] = 'Dark'
    const copy = graph.createVariable('copy', 'STRING', collection.id, '')
    const ctx = context(graph, home.id, button.id)
    const setCopy = (modeId?: string): PrototypeAction => ({
      type: 'SET_VARIABLE',
      variableId: copy.id,
      value: { type: 'VARIABLE', variableId: label.id, modeId }
    })
    const start = startPresentation(pageId, home.id)
    expect(runAction(graph, start, setCopy(dark), ctx)?.state.variables.values[copy.id]).toBe(
      'Dark'
    )
    expect(runAction(graph, start, setCopy(), ctx)?.state.variables.values[copy.id]).toBe('Light')
    // In Dark mode, a lookup of the default mode still reads the default mode's value.
    const inDark = runAction(
      graph,
      start,
      { type: 'SET_VARIABLE_MODE', collectionId: collection.id, modeId: dark },
      ctx
    )
    if (!inDark) throw new Error('the mode did not change')
    const lookup = setCopy(collection.defaultModeId)
    expect(runAction(graph, inDark.state, lookup, ctx)?.state.variables.values[copy.id]).toBe(
      'Light'
    )
  })
  test('a media action controls the video of its layer, or of the layer it names', () => {
    const { graph, pageId, home, button } = screens()
    const video = graph.createNode('RECTANGLE', home.id, { name: 'Video' })
    const ctx = context(graph, home.id, button.id)
    const state = startPresentation(pageId, home.id)
    const mute: PrototypeAction = {
      type: 'UPDATE_MEDIA_RUNTIME',
      destinationId: video.id,
      mediaAction: 'MUTE',
      amountToSkip: 0,
      newTimestamp: 0
    }
    expect(runAction(graph, state, mute, ctx)).toEqual({
      state,
      step: { kind: 'media', rootId: home.id, nodeId: video.id, action: mute }
    })
    const own = { ...mute, destinationId: null }
    expect(runAction(graph, state, own, ctx)?.step).toMatchObject({ nodeId: button.id })
    expect(runAction(graph, state, { ...mute, destinationId: 'gone' }, ctx)).toBeNull()
  })
})
