import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'
import { rect } from '#core-tests/helpers/layout'

import { createEditor } from '@kalka/core/editor'
import { computeAllLayouts } from '@kalka/core/layout'

describe('structure state actions', () => {
  test('toggleNodeVisibility reflows HUG auto-layout instance slots', async () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const component = editor.graph.createNode('COMPONENT', page, {
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'FIXED',
      width: 300,
      height: 1,
      itemSpacing: 0
    })
    rect(editor.graph, component.id, 300, 40, { name: 'Slot / Pinned at Top' })
    rect(editor.graph, component.id, 300, 74, { name: 'Slot / Content' })
    rect(editor.graph, component.id, 300, 40, { name: 'Slot / Pinned at Bottom' })
    const instance = editor.graph.createInstance(component.id, page)
    if (!instance) throw new Error('Expected instance')
    computeAllLayouts(editor.graph, page)

    const content = editor.graph
      .getChildren(instance.id)
      .find((child) => child.name === 'Slot / Content')
    const bottom = editor.graph
      .getChildren(instance.id)
      .find((child) => child.name === 'Slot / Pinned at Bottom')
    if (!content || !bottom) throw new Error('Expected instance slot children')

    editor.toggleNodeVisibility(content.id)

    expect(getNodeOrThrow(editor.graph, instance.id).height).toBe(80)
    expect(getNodeOrThrow(editor.graph, bottom.id).y).toBe(40)

    await Promise.resolve()

    expect(getNodeOrThrow(editor.graph, instance.id).height).toBe(80)
    expect(getNodeOrThrow(editor.graph, bottom.id).y).toBe(40)
  })
})

describe('layer state from the layers panel is undoable, as in Figma', () => {
  test('rename layer undo', () => {
    const e = createEditor()
    const n = e.graph.createNode('RECTANGLE', e.state.currentPageId, { name: 'A' })
    e.renameNode(n.id, 'B')
    e.undoAction()
    expect(getNodeOrThrow(e.graph, n.id).name).toBe('A')
  })
  test('lock undo', () => {
    const e = createEditor()
    const n = e.graph.createNode('RECTANGLE', e.state.currentPageId, { name: 'A' })
    e.toggleNodeLock(n.id)
    e.undoAction()
    expect(getNodeOrThrow(e.graph, n.id).locked).toBe(false)
  })
  test('visibility undo', () => {
    const e = createEditor()
    const n = e.graph.createNode('RECTANGLE', e.state.currentPageId, { name: 'A' })
    e.toggleNodeVisibility(n.id)
    e.undoAction()
    expect(getNodeOrThrow(e.graph, n.id).visible).toBe(true)
  })

  test('hiding several selected layers is one undo step', () => {
    const e = createEditor()
    const page = e.state.currentPageId
    const a = e.graph.createNode('RECTANGLE', page, { name: 'A' })
    const b = e.graph.createNode('RECTANGLE', page, { name: 'B' })
    e.select([a.id, b.id])
    e.toggleVisibility()
    e.undoAction()
    expect(getNodeOrThrow(e.graph, a.id).visible).toBe(true)
    expect(getNodeOrThrow(e.graph, b.id).visible).toBe(true)
    expect(e.undo.canUndo).toBe(false)
  })
})
