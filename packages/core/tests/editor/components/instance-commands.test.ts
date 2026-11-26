import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

const RED = { r: 1, g: 0, b: 0, a: 1 }
const BLUE = { r: 0, g: 0, b: 1, a: 1 }

function setup() {
  const editor = createEditor()
  const page = editor.state.currentPageId
  const component = editor.graph.createNode('COMPONENT', page, {
    name: 'Button',
    width: 100,
    height: 40
  })
  editor.graph.createNode('RECTANGLE', component.id, {
    name: 'Box',
    width: 100,
    height: 40,
    fills: [{ type: 'SOLID', color: RED, opacity: 1, visible: true }]
  })
  editor.graph.createNode('TEXT', component.id, { name: 'Label', text: 'OK' })
  const instanceId = editor.createInstanceFromComponent(component.id, 300, 0)
  if (!instanceId) throw new Error('No instance')
  const [box, label] = getNodeOrThrow(editor.graph, instanceId).childIds
  return { editor, page, component, instanceId, box, label }
}

const blueFill = [{ type: 'SOLID' as const, color: BLUE, opacity: 1, visible: true }]

describe('instance reset', () => {
  test('lists the kinds of change an instance carries, then resets one of them', () => {
    const { editor, instanceId, box, label } = setup()
    editor.updateNodeWithUndo(box, { fills: blueFill }, 'Fill')
    editor.updateNodeWithUndo(label, { opacity: 0.5 }, 'Opacity')
    editor.select([instanceId])
    expect(editor.getInstanceOverrideGroups(instanceId)).toEqual(['fill', 'appearance'])

    expect(editor.resetInstanceChanges('fill')).toBe(true)
    expect(getNodeOrThrow(editor.graph, box).fills[0]?.color).toEqual(RED)
    expect(getNodeOrThrow(editor.graph, label).opacity).toBe(0.5)
    expect(editor.getInstanceOverrideGroups(instanceId)).toEqual(['appearance'])

    editor.undoAction()
    expect(getNodeOrThrow(editor.graph, box).fills[0]?.color).toEqual(BLUE)
    expect([...editor.state.selectedIds]).toEqual([instanceId])
  })

  test('Reset all changes brings every layer back to the main component', () => {
    const { editor, instanceId, box, label } = setup()
    editor.updateNodeWithUndo(box, { fills: blueFill }, 'Fill')
    editor.updateNodeWithUndo(label, { opacity: 0.5 }, 'Opacity')
    editor.select([instanceId])
    expect(editor.resetInstanceChanges()).toBe(true)
    expect(getNodeOrThrow(editor.graph, box).fills[0]?.color).toEqual(RED)
    expect(getNodeOrThrow(editor.graph, label).opacity).toBe(1)
    expect(editor.getInstanceOverrideGroups(instanceId)).toEqual([])
    // Nothing left to reset is no undo step.
    expect(editor.resetInstanceChanges()).toBe(false)
  })
})

describe('Push changes to main component', () => {
  test('moves the edits to the main component and its other instances', () => {
    const { editor, component, instanceId, box } = setup()
    const otherId = editor.createInstanceFromComponent(component.id, 600, 0)
    if (!otherId) throw new Error('No instance')
    editor.updateNodeWithUndo(box, { fills: blueFill }, 'Fill')
    editor.select([instanceId])
    expect(editor.canPushInstanceChanges()).toBe(true)

    expect(editor.pushChangesToMainComponent()).toBe(true)
    const [mainBox] = getNodeOrThrow(editor.graph, component.id).childIds
    const [otherBox] = getNodeOrThrow(editor.graph, otherId).childIds
    expect(getNodeOrThrow(editor.graph, mainBox).fills[0]?.color).toEqual(BLUE)
    expect(getNodeOrThrow(editor.graph, otherBox).fills[0]?.color).toEqual(BLUE)
    expect(editor.getInstanceOverrideGroups(instanceId)).toEqual([])

    editor.undoAction()
    expect(getNodeOrThrow(editor.graph, mainBox).fills[0]?.color).toEqual(RED)
    expect(getNodeOrThrow(editor.graph, otherBox).fills[0]?.color).toEqual(RED)
    expect(getNodeOrThrow(editor.graph, box).fills[0]?.color).toEqual(BLUE)
  })
})

describe('Restore main component', () => {
  test('makes the deleted main component again and links its instances to it', () => {
    const { editor, page, component, instanceId, box } = setup()
    const otherId = editor.createInstanceFromComponent(component.id, 600, 0)
    if (!otherId) throw new Error('No instance')
    editor.graph.deleteNode(component.id)
    editor.select([instanceId])
    expect(editor.canRestoreMainComponent()).toBe(true)

    const restoredId = editor.restoreMainComponent()
    if (!restoredId) throw new Error('Not restored')
    const restored = getNodeOrThrow(editor.graph, restoredId)
    expect(restored.type).toBe('COMPONENT')
    expect(restored.name).toBe('Button')
    expect(restored.parentId).toBe(page)
    expect(getNodeOrThrow(editor.graph, instanceId).componentId).toBe(restoredId)
    expect(getNodeOrThrow(editor.graph, otherId).componentId).toBe(restoredId)
    const [restoredBox] = restored.childIds
    expect(getNodeOrThrow(editor.graph, box).componentId).toBe(restoredBox)
    expect(getNodeOrThrow(editor.graph, restoredBox).componentId).toBeNull()
    expect(editor.canRestoreMainComponent()).toBe(false)

    // Edits to the restored component reach both instances.
    editor.graph.updateNode(restoredBox, { fills: blueFill })
    editor.graph.syncInstances(restoredId)
    const [otherBox] = getNodeOrThrow(editor.graph, otherId).childIds
    expect(getNodeOrThrow(editor.graph, otherBox).fills[0]?.color).toEqual(BLUE)

    editor.undoAction()
    expect(editor.graph.getNode(restoredId)).toBeUndefined()
  })
})

describe('Create multiple components', () => {
  test('makes each selected layer a component of its own in one undo step', () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const a = editor.graph.createNode('RECTANGLE', page, { name: 'a', width: 10, height: 10 })
    const b = editor.graph.createNode('FRAME', page, { name: 'b', x: 50, width: 10, height: 10 })
    editor.select([a.id, b.id])
    const created = editor.createMultipleComponents()
    expect(created).toHaveLength(2)
    expect(created.map((id) => getNodeOrThrow(editor.graph, id).type)).toEqual([
      'COMPONENT',
      'COMPONENT'
    ])
    expect(created.map((id) => getNodeOrThrow(editor.graph, id).name)).toEqual(['a', 'b'])
    expect(new Set(editor.state.selectedIds)).toEqual(new Set(created))

    editor.undoAction()
    expect(getNodeOrThrow(editor.graph, b.id).type).toBe('FRAME')
    expect(getNodeOrThrow(editor.graph, a.id).parentId).toBe(page)
  })
})
