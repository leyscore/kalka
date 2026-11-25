import 'fake-indexeddb/auto'
import { afterEach, expect, test } from 'bun:test'

import { addBreakpoint } from '@/app/editor/breakpoints/actions'
import { createEditorStore } from '@/app/editor/session/create'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.dispose()
})

test('a new breakpoint is selected and brought into view', async () => {
  const store = createEditorStore()
  stores.push(store)
  const desktop = store.createShape('FRAME', 0, 0, 1440, 900)
  store.state.zoom = 1
  store.state.panX = 0
  store.state.panY = 0
  const before = { panX: store.state.panX, panY: store.state.panY, zoom: store.state.zoom }

  await addBreakpoint(store, desktop, 390, 'Mobile')

  const [created] = store.state.selectedIds
  expect(created).toBeDefined()
  expect(created).not.toBe(desktop)
  expect({ panX: store.state.panX, panY: store.state.panY, zoom: store.state.zoom }).not.toEqual(
    before
  )
})
