import { afterEach, describe, expect, test } from 'bun:test'

import { getRecoveryStore } from '@/app/document/recovery/store'
import { createEditorStore } from '@/app/editor/session'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(async () => {
  for (const store of stores.splice(0)) store.preparationController.dispose()
  await getRecoveryStore().clear()
})

async function snapshotIds(): Promise<string[]> {
  return (await getRecoveryStore().list()).map((snapshot) => snapshot.id)
}

describe('document recovery', () => {
  test('keeps a snapshot of unsaved changes', async () => {
    const store = createEditorStore()
    stores.push(store)
    store.setPageColor({ r: 0.5, g: 0.5, b: 0.5, a: 1 })
    await store.persistRecoveryNow()
    expect(await snapshotIds()).toContain(store.getRecoveryId())
  })

  test('has nothing to recover once the document is marked saved', async () => {
    const store = createEditorStore()
    stores.push(store)
    store.setPageColor({ r: 0.5, g: 0.5, b: 0.5, a: 1 })
    store.markDocumentSaved()
    await store.persistRecoveryNow()
    expect(await snapshotIds()).not.toContain(store.getRecoveryId())
  })
})
