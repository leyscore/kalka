import { describe, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { buildKalkaClipboardHTML } from '@kalka/core/clipboard'
import { createEditor } from '@kalka/core/editor'
import { addAnnotation, addMeasurement, layerHandoffThreads } from '@kalka/scene-graph'

const AUTHOR = { kind: 'person', name: 'Ada' } as const

function annotatedCard() {
  const editor = createEditor()
  const pageId = editor.state.currentPageId
  const card = editor.graph.createNode('FRAME', pageId, { name: 'Card', width: 200, height: 100 })
  const title = editor.graph.createNode('TEXT', card.id, { name: 'Title', width: 80, height: 20 })
  addAnnotation(editor.graph, title.id, AUTHOR, {
    label: 'Use the brand font',
    properties: ['fontSize']
  })
  addMeasurement(editor.graph, title.id, AUTHOR, {
    toNodeId: card.id,
    side: 'left',
    toSameSide: true
  })
  return { editor, card, title }
}

describe('annotations travel with copied layers', () => {
  test('a duplicate takes its layers’ annotations and measurements, and undo takes them back', () => {
    const { editor, card } = annotatedCard()
    editor.select([card.id])
    editor.duplicateSelected()
    const copy = expectDefined(editor.graph.getNode([...editor.state.selectedIds][0] ?? ''), 'copy')
    const copiedTitle = expectDefined(editor.graph.getChildren(copy.id)[0], 'copied title')
    const threads = layerHandoffThreads(editor.graph, copiedTitle.id)
    expect(threads.map((thread) => thread.messages[0]?.text)).toEqual(['Use the brand font', ''])
    // Measured to the copy of the card, which was copied with it.
    expect(threads[1]?.measurement?.toNodeId).toBe(copy.id)

    editor.undo.undo()
    expect(layerHandoffThreads(editor.graph, copiedTitle.id)).toHaveLength(0)
    editor.undo.redo()
    expect(layerHandoffThreads(editor.graph, copiedTitle.id)).toHaveLength(2)
  })

  test('pasted layers take the annotations they were copied with, in another document too', async () => {
    const { editor, title } = annotatedCard()
    editor.select([title.id])
    const payload = await editor.prepareCopy()
    const snapshot = expectDefined(payload.snapshot, 'snapshot')

    const other = createEditor()
    await other.pasteSnapshot(snapshot)
    const pasted = expectDefined(
      other.graph.getNode([...other.state.selectedIds][0] ?? ''),
      'pasted'
    )
    // The card it measured to is not in this document, so only the note comes along.
    expect(layerHandoffThreads(other.graph, pasted.id).map((thread) => thread.annotation)).toEqual([
      { properties: ['fontSize'] }
    ])
    other.undo.undo()
    expect(layerHandoffThreads(other.graph, pasted.id)).toHaveLength(0)

    // In the same document, the measurement to the card stays.
    await editor.pasteSnapshot(snapshot)
    const again = expectDefined(
      editor.graph.getNode([...editor.state.selectedIds][0] ?? ''),
      'again'
    )
    expect(layerHandoffThreads(editor.graph, again.id)[1]?.measurement?.toNodeId).toBeDefined()
  })

  test('the clipboard HTML another window reads carries them too', async () => {
    const { editor, card } = annotatedCard()
    const html = buildKalkaClipboardHTML([card], editor.graph)

    const other = createEditor()
    await other.pasteFromHTML(html)
    const pastedCard = expectDefined(
      other.graph.getNode([...other.state.selectedIds][0] ?? ''),
      'pasted card'
    )
    const pastedTitle = expectDefined(other.graph.getChildren(pastedCard.id)[0], 'pasted title')
    const threads = layerHandoffThreads(other.graph, pastedTitle.id)
    expect(threads.map((thread) => thread.messages[0]?.text)).toEqual(['Use the brand font', ''])
    // The card was copied with its title, so the measurement is to the pasted card.
    expect(threads[1]?.measurement?.toNodeId).toBe(pastedCard.id)
    other.undo.undo()
    expect(layerHandoffThreads(other.graph, pastedTitle.id)).toHaveLength(0)
  })
})
