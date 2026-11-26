import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

const solid = (r: number) => [
  { type: 'SOLID' as const, color: { r, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }
]

function setup() {
  const editor = createEditor()
  const page = editor.state.currentPageId
  const frame = editor.graph.createNode('FRAME', page, { name: 'Card', width: 200, height: 200 })
  const red = editor.graph.createNode('RECTANGLE', page, { name: 'Dot', fills: solid(1) })
  const nestedRed = editor.graph.createNode('RECTANGLE', frame.id, {
    name: 'Dot',
    fills: solid(1)
  })
  const dark = editor.graph.createNode('RECTANGLE', page, { name: 'Other', fills: solid(0.2) })
  const title = editor.graph.createNode('TEXT', page, {
    name: 'Title',
    text: 'A',
    fontFamily: 'Inter',
    fontWeight: 700
  })
  const subtitle = editor.graph.createNode('TEXT', frame.id, {
    name: 'Subtitle',
    text: 'B',
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 30
  })
  const body = editor.graph.createNode('TEXT', page, {
    name: 'Body',
    text: 'C',
    fontFamily: 'Inter',
    fontWeight: 400
  })
  return { editor, page, frame, red, nestedRed, dark, title, subtitle, body }
}

const selected = (editor: ReturnType<typeof createEditor>) => new Set(editor.state.selectedIds)

describe('Select all with same', () => {
  test('fill selects every layer on the page painted the same, at any depth', () => {
    const { editor, red, nestedRed } = setup()
    editor.select([red.id])
    expect(editor.selectAllWithSame('fill')).toBe(true)
    expect(selected(editor)).toEqual(new Set([red.id, nestedRed.id]))
  })

  test('font matches family and weight, text properties the whole text style', () => {
    const { editor, title, subtitle } = setup()
    editor.select([title.id])
    editor.selectAllWithSame('font')
    expect(selected(editor)).toEqual(new Set([title.id, subtitle.id]))
    editor.select([title.id])
    editor.selectAllWithSame('text')
    expect(selected(editor)).toEqual(new Set([title.id]))
  })

  test('instance selects the instances of the same main component', () => {
    const { editor, page } = setup()
    const component = editor.graph.createNode('COMPONENT', page, { name: 'Button' })
    const first = editor.graph.createInstance(component.id, page)
    const second = editor.graph.createInstance(component.id, page)
    if (!first || !second) throw new Error('No instance')
    editor.select([first.id])
    editor.selectAllWithSame('instance')
    expect(selected(editor)).toEqual(new Set([first.id, second.id]))
  })

  test('keeps the selection when nothing matches', () => {
    const { editor, frame } = setup()
    editor.select([frame.id])
    expect(editor.selectAllWithSame('effect')).toBe(false)
    expect(selected(editor)).toEqual(new Set([frame.id]))
  })
})

describe('Select matching layers', () => {
  test('selects the layers of the same type and name', () => {
    const { editor, red, nestedRed } = setup()
    editor.select([nestedRed.id])
    expect(editor.selectMatchingLayers()).toBe(true)
    expect(selected(editor)).toEqual(new Set([red.id, nestedRed.id]))
  })
})
