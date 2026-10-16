import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { counterpartIn, createBreakpoint, responsiveOverrides } from '@kalka/scene-graph'

const settle = () =>
  new Promise<void>((resolve) => {
    queueMicrotask(resolve)
  })

function setup() {
  const editor = createEditor()
  const pageId = editor.state.currentPageId
  const desktop = editor.graph.createNode('FRAME', pageId, {
    name: 'Desktop',
    width: 1440,
    height: 900,
    layoutMode: 'VERTICAL'
  })
  const title = editor.graph.createNode('TEXT', desktop.id, { name: 'Title', text: 'Hi', fontSize: 76 })
  const tablet = createBreakpoint(editor.graph, desktop.id, 810, 'Tablet')
  const phone = createBreakpoint(editor.graph, desktop.id, 390, 'Phone')
  if (!tablet || !phone) throw new Error('No breakpoints')
  const copy = (id: string, artboard: typeof phone) => {
    const node = editor.graph.getNode(id)
    const found = node && counterpartIn(editor.graph, node, artboard)
    if (!found) throw new Error('No copy')
    return found
  }
  return { editor, desktop, title, tablet, phone, copy }
}

describe('breakpoint sync in the editor', () => {
  test('an edit reaches every narrower breakpoint, and undo takes it back from all', () => {
    const { editor, title, tablet, phone, copy } = setup()
    editor.updateNodeWithUndo(copy(title.id, phone).id, { fontSize: 40 }, 'phone size')
    editor.updateNodeWithUndo(title.id, { fontSize: 88, text: 'Hello' }, 'desktop')
    expect(copy(title.id, tablet).fontSize).toBe(88)
    expect(copy(title.id, phone).fontSize).toBe(40)
    expect(copy(title.id, phone).text).toBe('Hello')

    editor.undoAction()
    expect(copy(title.id, tablet).fontSize).toBe(76)
    expect(copy(title.id, phone).text).toBe('Hi')
    expect(responsiveOverrides(editor.graph, copy(title.id, phone))).toEqual(['fontSize'])
  })

  test('layers added in the primary appear in each breakpoint; deleting a copy deletes it everywhere', async () => {
    const { editor, desktop, tablet, phone } = setup()
    const badge = editor.graph.createNode('FRAME', desktop.id, { name: 'Badge' })
    await settle()
    expect(editor.graph.getChildren(tablet.id).map((node) => node.name)).toEqual(['Title', 'Badge'])

    const phoneBadge = editor.graph.getChildren(phone.id).find((node) => node.name === 'Badge')
    if (!phoneBadge) throw new Error('No copy')
    editor.graph.deleteNode(phoneBadge.id)
    await settle()
    expect(editor.graph.getNode(badge.id)).toBeUndefined()
    expect(editor.graph.getChildren(tablet.id).map((node) => node.name)).toEqual(['Title'])
  })
})
