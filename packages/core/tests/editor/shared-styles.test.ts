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
