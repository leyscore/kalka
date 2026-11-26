import 'fake-indexeddb/auto'
import { afterEach, describe, expect, test } from 'bun:test'

import { chatDocumentId } from '@/app/ai/chat/history/document'
import { listCheckpoints, MAX_PER_DOCUMENT } from '@/app/document/versions/checkpoints/store'
import { captureCheckpoint, restoreCheckpoint } from '@/app/document/versions/checkpoints/use'
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
  return { store, page, card }
}

const names = (store: ReturnType<typeof createEditorStore>, pageId: string) =>
  store.graph.getChildren(pageId).map((node) => node.name)

describe('the version history of a file Git does not keep', () => {
  test('a kept version is listed for its document, newest first', async () => {
    const { store } = document()
    await captureCheckpoint(store, 'auto')
    const named = await captureCheckpoint(store, 'named', 'Before the redesign')
    const list = await listCheckpoints(chatDocumentId(store))
    expect(list[0]).toEqual(named)
    expect(list.map((checkpoint) => checkpoint.kind)).toEqual(['named', 'auto'])
  })

  test('restoring keeps what is there first, so the restore can be undone the same way', async () => {
    const { store, page, card } = document()
    const first = await captureCheckpoint(store, 'auto')
    store.graph.updateNode(card.id, { name: 'Pricing card' })
    store.graph.createNode('TEXT', page.id, { name: 'Title' })

    await restoreCheckpoint(store, first, 'Before restoring')
    expect(names(store, page.id)).toEqual(['Card'])
    const [before] = await listCheckpoints(chatDocumentId(store))
    expect(before?.kind).toBe('restore')
    expect(before?.label).toBe('Before restoring')

    if (!before) throw new Error('No version kept before restoring')
    await restoreCheckpoint(store, before, 'Before restoring again')
    expect(names(store, page.id)).toEqual(['Pricing card', 'Title'])
  })

  test(`a document keeps its latest ${MAX_PER_DOCUMENT} versions`, async () => {
    const { store } = document()
    for (let index = 0; index < MAX_PER_DOCUMENT + 2; index++)
      await captureCheckpoint(store, 'auto')
    expect(await listCheckpoints(chatDocumentId(store))).toHaveLength(MAX_PER_DOCUMENT)
  })
})
