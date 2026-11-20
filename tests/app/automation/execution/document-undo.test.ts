import { afterEach, describe, expect, test } from 'bun:test'

import { executeWithDocumentUndo } from '@/app/automation/execution/editor'
import { createEditorStore } from '@/app/editor/session'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.dispose()
})

const tick = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })

describe('two agents editing the same document at once', () => {
  test('each undo step holds only its own agent edit', async () => {
    const store = createEditorStore()
    stores.push(store)
    const pageId = store.state.currentPageId
    const hero = store.graph.createNode('TEXT', pageId, { name: 'Hero', text: 'Hero' })
    const footer = store.graph.createNode('TEXT', pageId, { name: 'Footer', text: 'Footer' })
    store.undo.clear()

    // Agent A starts, awaits (fonts, images), and finishes after agent B made its edit.
    const first = executeWithDocumentUndo(store, pageId, 'Agent A', async () => {
      await tick()
      store.graph.updateNode(hero.id, { text: 'Hero by A' })
      await tick()
      await tick()
    })
    const second = executeWithDocumentUndo(store, pageId, 'Agent B', async () => {
      await tick()
      store.graph.updateNode(footer.id, { text: 'Footer by B' })
    })
    await Promise.all([first, second])

    // Undoing the newest step takes back that agent's edit and nothing of the other's.
    const newest = store.undo.undoLabel
    store.undoAction()
    const text = (id: string) => store.graph.getNode(id)?.text
    const expected = newest === 'Agent A' ? ['Hero', 'Footer by B'] : ['Hero by A', 'Footer']
    expect([text(hero.id), text(footer.id)]).toEqual(expected)
  })
})
