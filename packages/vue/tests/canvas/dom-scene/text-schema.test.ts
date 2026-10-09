import { describe, expect, test } from 'bun:test'

import type { StyleRun } from '@open-pencil/scene-graph'

import { docToText, textToDoc } from '#vue/canvas/dom-scene/text/schema'

const bold = { fontWeight: 700 }
const red = {
  fills: [{ type: 'SOLID' as const, color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
}

describe('text layers as ProseMirror documents', () => {
  test('lines become paragraphs and runs become marks', () => {
    const doc = textToDoc('Hello world\nSecond', [{ start: 6, length: 5, style: bold }])
    expect(doc.childCount).toBe(2)
    expect(doc.child(0).childCount).toBe(2)
    expect(doc.child(0).child(1).text).toBe('world')
    expect(doc.child(0).child(1).marks[0].attrs.style).toEqual(bold)
  })

  test('a run across a line break comes back as one run, the break included', () => {
    const runs: StyleRun[] = [{ start: 1, length: 4, style: red }]
    expect(docToText(textToDoc('ab\ncd', runs))).toEqual({
      text: 'ab\ncd',
      styleRuns: [{ start: 1, length: 4, style: red }]
    })
    // A break is not a character to the editor: a run starting on one starts after it.
    expect(
      docToText(textToDoc('abc\ndef', [{ start: 3, length: 4, style: red }])).styleRuns
    ).toEqual([{ start: 4, length: 3, style: red }])
  })

  test('round trips text, empty lines and several runs', () => {
    const text = 'Titre\n\nUn mot en gras et un en rouge'
    const runs: StyleRun[] = [
      { start: 0, length: 5, style: bold },
      { start: 17, length: 4, style: bold },
      { start: 31, length: 5, style: red }
    ]
    expect(docToText(textToDoc(text, runs))).toEqual({ text, styleRuns: runs })
  })

  test('adjacent equal runs merge, empty ones vanish', () => {
    const runs: StyleRun[] = [
      { start: 0, length: 2, style: bold },
      { start: 2, length: 2, style: { ...bold } },
      { start: 4, length: 2, style: {} }
    ]
    expect(docToText(textToDoc('abcdef', runs)).styleRuns).toEqual([
      { start: 0, length: 4, style: bold }
    ])
  })

  test('empty text is one empty paragraph', () => {
    const doc = textToDoc('', [])
    expect(doc.childCount).toBe(1)
    expect(docToText(doc)).toEqual({ text: '', styleRuns: [] })
  })
})
