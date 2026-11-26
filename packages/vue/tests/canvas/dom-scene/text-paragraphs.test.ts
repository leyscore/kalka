import { describe, expect, test } from 'bun:test'

import { EditorState, TextSelection, type Command } from 'prosemirror-state'

import type { TextListLine } from '@kalka/scene-graph'

import {
  indentListItem,
  liftListItem,
  listMarker,
  setListType,
  splitListItem
} from '#vue/canvas/dom-scene/text/paragraphs'
import { docToText, textToDoc } from '#vue/canvas/dom-scene/text/schema'

const plain: TextListLine = { type: 'NONE', level: 0 }
const bullet: TextListLine = { type: 'UNORDERED', level: 0 }

/** A state over the text with the caret at `at`, a character offset in the text. */
function stateAt(text: string, listLines: TextListLine[], at: number, to = at) {
  const doc = textToDoc(text, [], listLines)
  // Each paragraph before adds its two boundaries; a line break is one character.
  const position = (offset: number) => offset + 1 + text.slice(0, offset).split('\n').length - 1
  return EditorState.create({
    doc,
    selection: TextSelection.create(doc, position(at), position(to))
  })
}

function run(state: EditorState, command: Command) {
  let next = state
  const handled = command(state, (tr) => {
    next = state.apply(tr)
  })
  return { handled, ...docToText(next.doc) }
}

describe('list editing', () => {
  test('Enter starts the next item, and leaves the list on an empty one', () => {
    const split = run(stateAt('One', [bullet], 3), splitListItem)
    expect(split.text).toBe('One\n')
    expect(split.listLines).toEqual([bullet, bullet])
    const left = run(stateAt('One\n', [bullet, bullet], 4), splitListItem)
    expect(left.listLines).toEqual([bullet, plain])
    expect(run(stateAt('One', [], 3), splitListItem).handled).toBe(false)
  })

  test('Backspace at the start of an item takes its marker away first', () => {
    const nested = run(stateAt('One', [{ type: 'UNORDERED', level: 1 }], 0), liftListItem)
    expect(nested.listLines).toEqual([bullet])
    expect(run(stateAt('One', [bullet], 0), liftListItem).listLines).toEqual([])
    expect(run(stateAt('One', [bullet], 1), liftListItem).handled).toBe(false)
  })

  test('Tab nests an item, Shift-Tab brings it back', () => {
    const nested = run(stateAt('One', [bullet], 1), indentListItem(1))
    expect(nested.listLines).toEqual([{ type: 'UNORDERED', level: 1 }])
    expect(run(stateAt('One', [], 1), indentListItem(1)).handled).toBe(false)
  })

  test('the list buttons set the paragraphs the selection touches', () => {
    const listed = run(stateAt('A\nB\nC', [], 0, 2), setListType('ORDERED'))
    expect(listed.listLines.map((line) => line.type)).toEqual(['ORDERED', 'ORDERED', 'NONE'])
    const unlisted = run(stateAt('A', [bullet], 0), setListType('UNORDERED'))
    expect(unlisted.listLines).toEqual([])
  })

  test('markers read as the HTML list draws them', () => {
    expect(listMarker({ type: 'UNORDERED', level: 1, ordinal: 3 })).toBe('circle')
    expect(listMarker({ type: 'ORDERED', level: 0, ordinal: 12 })).toBe('"12. "')
    expect(listMarker({ type: 'ORDERED', level: 1, ordinal: 28 })).toBe('"ab. "')
    expect(listMarker({ type: 'ORDERED', level: 2, ordinal: 14 })).toBe('"xiv. "')
  })
})
