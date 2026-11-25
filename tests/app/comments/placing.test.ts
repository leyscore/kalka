import 'fake-indexeddb/auto'
import { afterEach, expect, test } from 'bun:test'

import { commentPlacing, stopCommentPlacing, toggleCommentPlacing } from '@/app/comments/service'
import { createEditorStore } from '@/app/editor/session/create'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.dispose()
})

test('picking a tool leaves comment mode', () => {
  const store = createEditorStore()
  stores.push(store)
  toggleCommentPlacing(store)
  expect(commentPlacing(store)).toBe(true)
  stopCommentPlacing(store)
  expect(commentPlacing(store)).toBe(false)
  // Leaving it twice changes nothing, and the C key turns it back on.
  stopCommentPlacing(store)
  toggleCommentPlacing(store)
  expect(commentPlacing(store)).toBe(true)
})
