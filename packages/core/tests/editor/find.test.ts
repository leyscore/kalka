import { describe, expect, test } from 'bun:test'

import { createEditor, DEFAULT_FIND_OPTIONS, findRanges } from '@kalka/core/editor'
import { SceneGraph } from '@kalka/scene-graph'

function setup() {
  const graph = new SceneGraph()
  const editor = createEditor({ graph })
  const page = editor.state.currentPageId
  const card = graph.createNode('FRAME', page, { name: 'Sign up card' })
  const title = graph.createNode('TEXT', card.id, {
    name: 'Headline',
    text: 'Sign up today, sign up free',
    styleRuns: [{ start: 0, length: 7, style: { fontWeight: 700 } }]
  })
  const button = graph.createNode('TEXT', card.id, {
    name: 'Label',
    autoRename: true,
    text: 'Sign up'
  })
  const other = graph.addPage('Other')
  const footer = graph.createNode('TEXT', other.id, { name: 'Footer', text: 'Signup' })
  return { graph, editor, page, other, card, title, button, footer }
}

const options = (query: string, patch: Partial<typeof DEFAULT_FIND_OPTIONS> = {}) => ({
  ...DEFAULT_FIND_OPTIONS,
  query,
  ...patch
})

describe('find ranges', () => {
  test('ignores case unless asked, and keeps whole words when asked', () => {
    expect(findRanges('Sign up, sign UP', options('sign up'))).toEqual([
      [0, 7],
      [9, 16]
    ])
    expect(findRanges('Sign up, sign up', options('sign up', { matchCase: true }))).toEqual([
      [9, 16]
    ])
    expect(findRanges('signup sign up', options('sign', { wholeWord: true }))).toEqual([[7, 11]])
  })
})

describe('find in document', () => {
  test('finds text characters and layer names on every page in layer order', () => {
    const { editor, page, other, card, title, button, footer } = setup()
    const matches = editor.findInDocument(options('sign'))
    expect(matches.map((m) => [m.nodeId, m.field, m.start])).toEqual([
      [card.id, 'name', 0],
      [title.id, 'text', 0],
      [title.id, 'text', 15],
      [button.id, 'text', 0],
      [footer.id, 'text', 0]
    ])
    expect(matches[1]).toMatchObject({ pageId: page, frameId: card.id })
    expect(matches[4]).toMatchObject({ pageId: other.id, frameId: footer.id })
    expect(editor.findInDocument(options('sign'), [page])).toHaveLength(4)
  })

  test('narrows to text, names or kinds of layer', () => {
    const { editor, card } = setup()
    expect(editor.findInDocument(options('sign', { text: false })).map((m) => m.nodeId)).toEqual([
      card.id
    ])
    expect(editor.findInDocument(options('sign', { kinds: ['frame'] }))).toHaveLength(1)
    expect(editor.findInDocument(options('head', { text: false }))).toHaveLength(1)
  })
})

describe('replace text', () => {
  test('replaces every match in one undo step and keeps the style of what it replaces', () => {
    const { graph, editor, title, button, card } = setup()
    const matches = editor.findInDocument(options('sign up'))
    const replaced = editor.replaceTextMatches(matches, 'Start', options('sign up'))

    expect(replaced).toBe(3)
    expect(graph.getNode(title.id)?.text).toBe('Start today, Start free')
    expect(graph.getNode(title.id)?.styleRuns).toEqual([
      { start: 0, length: 5, style: { fontWeight: 700 } }
    ])
    expect(graph.getNode(button.id)?.text).toBe('Start')
    // Names are found, never rewritten.
    expect(graph.getNode(card.id)?.name).toBe('Sign up card')

    editor.undo.undo()
    expect(graph.getNode(title.id)?.text).toBe('Sign up today, sign up free')
    expect(graph.getNode(title.id)?.styleRuns).toEqual([
      { start: 0, length: 7, style: { fontWeight: 700 } }
    ])
    expect(graph.getNode(button.id)?.text).toBe('Sign up')
    editor.undo.redo()
    expect(graph.getNode(button.id)?.text).toBe('Start')
  })

  test('replaces one match and skips ranges the text no longer holds', () => {
    const { graph, editor, title } = setup()
    const [, second] = editor.findInDocument(options('sign up', { names: false }))
    if (!second) throw new Error('No match')
    expect(editor.replaceTextMatches([second], 'join', options('sign up'))).toBe(1)
    expect(graph.getNode(title.id)?.text).toBe('Sign up today, join free')
    expect(editor.replaceTextMatches([second], 'join', options('sign up'))).toBe(0)
  })
})
