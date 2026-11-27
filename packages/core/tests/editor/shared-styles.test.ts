import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { getSharedStyles, SceneGraph } from '@kalka/scene-graph'

function setup() {
  const graph = new SceneGraph()
  const editor = createEditor({ graph })
  const page = editor.state.currentPageId
  const title = graph.createNode('TEXT', page, {
    name: 'Title',
    text: 'Title',
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 48,
    lineHeight: 56,
    paragraphSpacing: 12,
    paragraphIndent: 8,
    letterSpacing: -2,
    letterSpacingUnit: 'PERCENT'
  })
  const other = graph.createNode('TEXT', page, { name: 'Other', text: 'Other', fontSize: 14 })
  return { graph, editor, page, title, other }
}

describe('shared text styles', () => {
  test('creates a style from a text layer and links it in one undo step', () => {
    const { graph, editor, title } = setup()
    const style = editor.createTextStyle('Heading/H1', [title.id])
    if (!style) throw new Error('No style')

    const [listed] = getSharedStyles(graph, 'text')
    expect(listed).toEqual(style)
    const definition = graph.getNode(style.nodeId)
    expect(definition).toMatchObject({
      name: 'Heading/H1',
      internalOnly: true,
      sharedStyleType: 'TEXT',
      fontSize: 48,
      fontWeight: 700,
      paragraphSpacing: 12,
      paragraphIndent: 8,
      letterSpacingUnit: 'PERCENT'
    })
    expect(graph.getNode(title.id)?.textStyleId).toBe(style.id)

    editor.undo.undo()
    expect(getSharedStyles(graph, 'text')).toEqual([])
    expect(graph.getNode(title.id)?.textStyleId).toBeNull()
    editor.undo.redo()
    expect(getSharedStyles(graph, 'text')).toEqual([style])
    expect(graph.getNode(title.id)?.textStyleId).toBe(style.id)
  })

  test('editing a style updates every layer that uses it in one undo step', () => {
    const { graph, editor, title, other } = setup()
    const style = editor.createTextStyle('Heading/H1', [title.id, other.id])
    if (!style) throw new Error('No style')
    expect(graph.getNode(other.id)?.fontSize).toBe(48)

    editor.updateTextStyle(style.nodeId, { fontSize: 64, paragraphSpacing: 20, name: 'ignored' })
    for (const id of [title.id, other.id]) {
      expect(graph.getNode(id)).toMatchObject({
        fontSize: 64,
        paragraphSpacing: 20,
        textStyleId: style.id
      })
    }
    expect(graph.getNode(style.nodeId)?.name).toBe('Heading/H1')

    editor.undo.undo()
    expect(graph.getNode(other.id)?.fontSize).toBe(48)
    expect(graph.getNode(style.nodeId)?.fontSize).toBe(48)
    expect(graph.getNode(other.id)?.textStyleId).toBe(style.id)
  })

  test('changing a styled field on the layer detaches it', () => {
    const { graph, editor, title } = setup()
    editor.createTextStyle('Body', [title.id])
    editor.updateNodeWithUndo(title.id, { fontSize: 20 })
    expect(graph.getNode(title.id)?.textStyleId).toBeNull()
  })

  test('renames, reorders and deletes styles', () => {
    const { graph, editor, title, other } = setup()
    const first = editor.createTextStyle('Heading/H1', [title.id])
    const second = editor.createTextStyle('Body/Regular', [other.id])
    if (!first || !second) throw new Error('No style')
    expect(getSharedStyles(graph, 'text').map((style) => style.name)).toEqual([
      'Heading/H1',
      'Body/Regular'
    ])

    editor.moveSharedStyle(second.nodeId, first.nodeId, 'before')
    expect(getSharedStyles(graph, 'text').map((style) => style.name)).toEqual([
      'Body/Regular',
      'Heading/H1'
    ])
    editor.undo.undo()
    expect(getSharedStyles(graph, 'text')[0]?.name).toBe('Heading/H1')

    editor.renameSharedStyle(first.nodeId, 'Heading/Display')
    expect(graph.getNode(first.nodeId)?.name).toBe('Heading/Display')

    editor.deleteSharedStyle(first.nodeId)
    expect(graph.getNode(first.nodeId)).toBeUndefined()
    expect(graph.getNode(title.id)).toMatchObject({ textStyleId: null, fontSize: 48 })
    editor.undo.undo()
    expect(getSharedStyles(graph, 'text').map((style) => style.name)).toEqual([
      'Heading/Display',
      'Body/Regular'
    ])
    expect(graph.getNode(title.id)?.textStyleId).toBe(first.id)
  })

  test('keeps new styles on the internal page when the document has one', () => {
    const { graph, editor, title } = setup()
    const internal = graph.addPage('Internal Only Canvas')
    graph.updateNode(internal.id, { internalOnly: true })
    const style = editor.createTextStyle('Body', [title.id])
    expect(graph.getNode(style?.nodeId ?? '')?.parentId).toBe(internal.id)
  })
})

describe('shared colour, effect and grid styles', () => {
  const red = { r: 0.9, g: 0.2, b: 0.15, a: 1 }
  const blue = { r: 0.1, g: 0.3, b: 0.9, a: 1 }
  const shadow = {
    type: 'DROP_SHADOW' as const,
    color: { r: 0, g: 0, b: 0, a: 0.25 },
    offset: { x: 0, y: 4 },
    radius: 8,
    spread: 0,
    visible: true
  }

  function setupLayers() {
    const graph = new SceneGraph()
    const editor = createEditor({ graph })
    const page = editor.state.currentPageId
    const card = graph.createNode('FRAME', page, {
      name: 'Card',
      fills: [{ type: 'SOLID', color: red, opacity: 1, visible: true }],
      strokes: [
        { type: 'SOLID', color: blue, opacity: 0.5, visible: true, weight: 3, align: 'INSIDE' }
      ],
      effects: [shadow],
      layoutGrids: [{ pattern: 'COLUMNS', count: 12, gutterSize: 16, visible: true }]
    })
    const badge = graph.createNode('RECTANGLE', page, {
      name: 'Badge',
      strokes: [
        { type: 'SOLID', color: red, opacity: 1, visible: true, weight: 2, align: 'OUTSIDE' }
      ]
    })
    return { graph, editor, card, badge }
  }

  test('makes a colour style from a fill and applies it in one undo step', () => {
    const { graph, editor, card } = setupLayers()
    const style = editor.createSharedStyle('fill', 'Brand/Primary', [card.id])
    if (!style) throw new Error('No style')
    expect(style.type).toBe('FILL')
    expect(getSharedStyles(graph, 'fill')).toEqual([style])
    expect(graph.getNode(style.nodeId)).toMatchObject({
      type: 'RECTANGLE',
      internalOnly: true,
      sharedStyleType: 'FILL',
      fills: [{ color: red }]
    })
    expect(graph.getNode(card.id)?.fillStyleId).toBe(style.id)

    editor.undo.undo()
    expect(getSharedStyles(graph, 'fill')).toEqual([])
    expect(graph.getNode(card.id)?.fillStyleId).toBeNull()
  })

  test('a colour style made from a stroke keeps its paints, and strokes keep their weight', () => {
    const { graph, editor, card, badge } = setupLayers()
    const style = editor.createSharedStyle('stroke', 'Brand/Line', [card.id])
    if (!style) throw new Error('No style')
    const definition = graph.getNode(style.nodeId)
    expect(definition?.fills).toEqual([{ type: 'SOLID', color: blue, opacity: 0.5, visible: true }])
    expect(graph.getNode(card.id)?.strokeStyleId).toBe(style.id)

    editor.updateNodeWithUndo(badge.id, { strokeStyleId: style.id })
    editor.updateSharedStyle(style.nodeId, {
      fills: [{ type: 'SOLID', color: red, opacity: 1, visible: true }]
    })
    expect(graph.getNode(card.id)?.strokes[0]).toMatchObject({
      color: red,
      weight: 3,
      align: 'INSIDE'
    })
    expect(graph.getNode(badge.id)?.strokes[0]).toMatchObject({
      color: red,
      weight: 2,
      align: 'OUTSIDE'
    })
  })

  test('a colour style bound to a variable binds the fills and strokes using it', () => {
    const { graph, editor, card, badge } = setupLayers()
    const collection = graph.createCollection('Theme')
    const brand = graph.createVariable('Brand', 'COLOR', collection.id, red)
    graph.updateNode(card.id, { boundVariables: { 'fills/0/color': brand.id, opacity: 'kept' } })
    const style = editor.createSharedStyle('fill', 'Brand/Primary', [card.id])
    if (!style) throw new Error('No style')
    expect(graph.getNode(style.nodeId)?.boundVariables).toEqual({ 'fills/0/color': brand.id })

    editor.updateNodeWithUndo(badge.id, { strokeStyleId: style.id })
    // A paint's opacity changes beside its bound colour, which stays bound.
    editor.updateSharedStyle(style.nodeId, {
      fills: [{ type: 'SOLID', color: red, opacity: 0.5, visible: true }]
    })
    expect(graph.getNode(card.id)?.boundVariables).toEqual({
      opacity: 'kept',
      'fills/0/color': brand.id
    })
    expect(graph.getNode(badge.id)?.boundVariables).toEqual({ 'strokes/0/color': brand.id })
  })

  test('describes and duplicates a style, each as one undo step', () => {
    const { graph, editor, card } = setupLayers()
    const style = editor.createSharedStyle('fill', 'Brand/Primary', [card.id])
    if (!style) throw new Error('No style')
    editor.describeSharedStyle(style.nodeId, '  Buttons and links  ')
    expect(graph.getNode(style.nodeId)?.symbolDescription).toBe('Buttons and links')

    const copy = editor.duplicateSharedStyle(style.nodeId)
    if (!copy) throw new Error('No copy')
    expect(getSharedStyles(graph, 'fill').map((listed) => listed.nodeId)).toEqual([
      style.nodeId,
      copy.nodeId
    ])
    expect(graph.getNode(copy.nodeId)).toMatchObject({
      name: 'Brand/Primary',
      symbolDescription: 'Buttons and links',
      fills: [{ color: red }]
    })
    expect(copy.id).not.toBe(style.id)
    expect(graph.getNode(card.id)?.fillStyleId).toBe(style.id)

    editor.undo.undo()
    expect(getSharedStyles(graph, 'fill')).toEqual([style])
    editor.undo.undo()
    expect(graph.getNode(style.nodeId)?.symbolDescription).toBe('')
  })

  test('editing a colour style changes the fills and strokes using it, as one undo step', () => {
    const { graph, editor, card, badge } = setupLayers()
    const style = editor.createSharedStyle('fill', 'Brand/Primary', [card.id])
    if (!style) throw new Error('No style')
    editor.updateNodeWithUndo(badge.id, { strokeStyleId: style.id })

    editor.updateSharedStyle(style.nodeId, {
      fills: [{ type: 'SOLID', color: blue, opacity: 1, visible: true }],
      effects: [shadow]
    })
    expect(graph.getNode(style.nodeId)?.effects).toEqual([])
    expect(graph.getNode(card.id)).toMatchObject({
      fills: [{ color: blue }],
      fillStyleId: style.id
    })
    expect(graph.getNode(badge.id)).toMatchObject({
      strokes: [{ color: blue, weight: 2 }],
      strokeStyleId: style.id
    })

    editor.undo.undo()
    expect(graph.getNode(card.id)?.fills[0]?.color).toEqual(red)
    expect(graph.getNode(style.nodeId)?.fills[0]?.color).toEqual(red)
  })

  test('effect and grid styles follow their edits on every layer using them', () => {
    const { graph, editor, card } = setupLayers()
    const effect = editor.createSharedStyle('effect', 'Elevation/1', [card.id])
    const grid = editor.createSharedStyle('grid', 'Grid/12', [card.id])
    if (!effect || !grid) throw new Error('No style')
    expect(graph.getNode(effect.nodeId)).toMatchObject({ type: 'RECTANGLE', effects: [shadow] })
    expect(graph.getNode(grid.nodeId)).toMatchObject({ type: 'FRAME', sharedStyleType: 'GRID' })
    expect(graph.getNode(card.id)).toMatchObject({
      effectStyleId: effect.id,
      gridStyleId: grid.id
    })

    editor.updateSharedStyle(effect.nodeId, { effects: [{ ...shadow, radius: 24 }] })
    editor.updateSharedStyle(grid.nodeId, {
      layoutGrids: [{ pattern: 'COLUMNS', count: 6, gutterSize: 24, visible: true }]
    })
    expect(graph.getNode(card.id)?.effects[0]?.radius).toBe(24)
    expect(graph.getNode(card.id)?.layoutGrids[0]?.count).toBe(6)
    expect(graph.getNode(card.id)?.effectStyleId).toBe(effect.id)
  })

  test('a grid style needs a frame, and deleting a colour style detaches fills and strokes', () => {
    const { graph, editor, card, badge } = setupLayers()
    expect(editor.createSharedStyle('grid', 'Grid', [badge.id])).toBeNull()
    const style = editor.createSharedStyle('fill', 'Brand', [card.id])
    if (!style) throw new Error('No style')
    editor.updateNodeWithUndo(badge.id, { strokeStyleId: style.id })
    editor.deleteSharedStyle(style.nodeId)
    expect(graph.getNode(card.id)).toMatchObject({ fillStyleId: null, fills: [{ color: red }] })
    expect(graph.getNode(badge.id)?.strokeStyleId).toBeNull()
  })

  test('a stroke keeps its colour style when its weight changes, not when its paint does', () => {
    const { graph, editor, card } = setupLayers()
    const style = editor.createSharedStyle('stroke', 'Line', [card.id])
    if (!style) throw new Error('No style')
    const strokes = graph.getNode(card.id)?.strokes ?? []
    editor.updateNodeWithUndo(card.id, { strokes: strokes.map((s) => ({ ...s, weight: 8 })) })
    expect(graph.getNode(card.id)?.strokeStyleId).toBe(style.id)
    editor.updateNodeWithUndo(card.id, { strokes: strokes.map((s) => ({ ...s, opacity: 0.2 })) })
    expect(graph.getNode(card.id)?.strokeStyleId).toBeNull()
  })
})

describe('colour styles over variables', () => {
  const blue = { r: 0.12, g: 0.42, b: 1, a: 1 }
  const green = { r: 0, g: 0.66, b: 0.42, a: 1 }

  function setupBound() {
    const graph = new SceneGraph()
    const editor = createEditor({ graph })
    const page = editor.state.currentPageId
    const collection = graph.createCollection('Theme')
    const brand = graph.createVariable('brand/primary', 'COLOR', collection.id, blue)
    const frame = graph.createNode('FRAME', page, { name: 'Frame', width: 300, height: 300 })
    const rect = graph.createNode('RECTANGLE', frame.id, {
      name: 'Rect',
      fills: [{ type: 'SOLID', color: blue, opacity: 1, visible: true }]
    })
    graph.bindVariable(rect.id, 'fills/0/color', brand.id)
    return { graph, editor, frame, rect, brand }
  }

  const copyOf = (graph: SceneGraph, frameId: string) => {
    const copy = graph
      .getChildren(graph.getNode(frameId)?.parentId ?? '')
      .find((node) => node.name === 'Frame' && node.id !== frameId)
    const rect = copy && graph.getChildren(copy.id)[0]
    if (!rect) throw new Error('No copy')
    return rect
  }

  test('a colour edited in a style made from a variable gives the layers that colour, and copies keep the style', () => {
    const { graph, editor, frame, rect } = setupBound()
    const style = editor.createSharedStyle('fill', 'Brand/Primary', [rect.id])
    if (!style) throw new Error('No style')
    editor.updateSharedStyle(style.nodeId, {
      fills: [{ type: 'SOLID', color: green, opacity: 1, visible: true }]
    })
    expect(graph.getNode(rect.id)?.boundVariables['fills/0/color']).toBeUndefined()

    editor.select([frame.id])
    editor.duplicateSelected()
    const copy = copyOf(graph, frame.id)
    expect(copy.fillStyleId).toBe(style.id)
    expect(copy.fills[0]?.color).toEqual(green)
  })

  test('a copy of a layer using a style bound to a variable keeps the style', () => {
    const { graph, editor, frame, rect, brand } = setupBound()
    const style = editor.createSharedStyle('fill', 'Brand/Primary', [rect.id])
    if (!style) throw new Error('No style')
    editor.select([frame.id])
    editor.duplicateSelected()
    const copy = copyOf(graph, frame.id)
    expect(copy.fillStyleId).toBe(style.id)
    expect(copy.boundVariables['fills/0/color']).toBe(brand.id)
  })

  test('a variable change reaches the layers using a style bound to it, which keep the style', () => {
    const { graph, editor, rect, brand } = setupBound()
    const style = editor.createSharedStyle('fill', 'Brand/Primary', [rect.id])
    if (!style) throw new Error('No style')
    editor.updateVariableValue(brand.id, graph.variableCollections.get(brand.collectionId)?.defaultModeId ?? '', green)
    expect(graph.getNode(rect.id)?.fills[0]?.color).toEqual(green)
    expect(graph.getNode(rect.id)?.fillStyleId).toBe(style.id)
  })
})
