import { afterEach, describe, expect, test } from 'bun:test'

import { createEditorStore } from '@/app/editor/session'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.dispose()
  Reflect.deleteProperty(globalThis, 'prompt')
})

describe('Save As', () => {
  test('keeps the place, name and format the document had when the write fails', async () => {
    const store = createEditorStore()
    stores.push(store)
    store.setPlannedFilePath('/work/poster.fig')
    store.state.documentName = 'poster'
    // The person names a .kalka copy; without a page to download into, the write fails.
    Object.assign(globalThis, { prompt: () => 'Copy.kalka' })

    await expect(store.saveFigFileAs()).rejects.toThrow()
    expect(store.state.documentName).toBe('poster')
    expect(store.getDocumentFilePath()).toBe('/work/poster.fig')
  })

  test('saves nothing when the person cancels', async () => {
    const store = createEditorStore()
    stores.push(store)
    store.setPlannedFilePath('/work/poster.fig')
    Object.assign(globalThis, { prompt: () => null })
    expect(await store.saveFigFileAs()).toBe(false)
    expect(store.getDocumentFilePath()).toBe('/work/poster.fig')
  })
})
