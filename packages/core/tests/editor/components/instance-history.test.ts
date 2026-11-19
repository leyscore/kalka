import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

describe('instance history', () => {
  test('redoing an instance and an edit to one of its layers brings back both', () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const component = editor.graph.createNode('COMPONENT', page, { name: 'Button', width: 100 })
    editor.graph.createNode('TEXT', component.id, { name: 'Label', text: 'OK' })
    const instanceId = editor.createInstanceFromComponent(component.id, 200, 0)
    if (!instanceId) throw new Error('No instance')
    const [label] = getNodeOrThrow(editor.graph, instanceId).childIds
    editor.updateNodeWithUndo(label, { opacity: 0.5 }, 'Opacity')

    editor.undoAction()
    editor.undoAction()
    editor.redoAction()
    editor.redoAction()
    expect(getNodeOrThrow(editor.graph, instanceId).childIds).toEqual([label])
    expect(getNodeOrThrow(editor.graph, label).opacity).toBe(0.5)
  })
})
