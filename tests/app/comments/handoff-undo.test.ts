import { afterEach, describe, expect, test } from 'bun:test'

import {
  addCommentThread,
  documentComments,
  frameReview,
  layerHandoffThreads,
  setFrameDevStatus,
  updateAnnotation
} from '@kalka/scene-graph'

import { annotateSelection, measureSelection } from '@/app/comments/annotations'
import { editHandoff } from '@/app/comments/handoff-undo'
import { createEditorStore } from '@/app/editor/session/create'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.dispose()
})

function document() {
  const store = createEditorStore()
  stores.push(store)
  const page = store.graph.getPages()[0]
  const card = store.graph.createNode('FRAME', page.id, { name: 'Card', width: 200, height: 100 })
  store.select([card.id])
  return { store, page, card }
}

describe('undo of handoff notes', () => {
  test('an annotation, its edit and its measurement undo and redo like any edit', () => {
    const { store, card } = document()
    const thread = annotateSelection(store)
    expect(thread).not.toBeNull()
    if (!thread) return
    editHandoff(store, 'Edit annotation', () =>
      updateAnnotation(store.graph, thread.id, { label: 'Tap target 44px' })
    )
    measureSelection(store)
    expect(layerHandoffThreads(store.graph, card.id)).toHaveLength(2)

    store.undo.undo()
    expect(layerHandoffThreads(store.graph, card.id)).toHaveLength(1)
    store.undo.undo()
    expect(layerHandoffThreads(store.graph, card.id)[0]?.messages[0]?.text).toBe('')
    store.undo.undo()
    expect(layerHandoffThreads(store.graph, card.id)).toHaveLength(0)
    store.undo.redo()
    store.undo.redo()
    expect(layerHandoffThreads(store.graph, card.id)[0]?.messages[0]?.text).toBe('Tap target 44px')
  })

  test('a dev status undoes, and undo leaves comments written since alone', () => {
    const { store, page, card } = document()
    editHandoff(store, 'Change dev status', () =>
      setFrameDevStatus(store.graph, card.id, 'ready', 'Ada')
    )
    expect(frameReview(store.graph, card.id)?.status).toBe('ready')
    addCommentThread(
      store.graph,
      { pageId: page.id, nodeId: card.id, x: 0, y: 0 },
      { kind: 'person', name: 'Grace' },
      'Looks good'
    )
    store.undo.undo()
    expect(frameReview(store.graph, card.id)).toBeUndefined()
    expect(documentComments(store.graph).map((thread) => thread.messages[0]?.text)).toEqual([
      'Looks good'
    ])
  })
})
