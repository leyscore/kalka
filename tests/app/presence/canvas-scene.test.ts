import { afterEach, describe, expect, test } from 'bun:test'

import { createEditorStore } from '@/app/editor/session'
import { attachCanvasScene, canvasScenesSettled } from '@/app/presence/canvas-scene'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.preparationController.dispose()
})

function scene(settled: () => boolean) {
  return {
    reveal: () => undefined,
    hold: () => undefined,
    release: () => undefined,
    get settled() {
      return settled()
    }
  }
}

describe('canvas scene settlement', () => {
  test('is unknown without a DOM scene, and settled once every pane is', () => {
    const store = createEditorStore()
    stores.push(store)
    expect(canvasScenesSettled(store)).toBeNull()

    let second = false
    attachCanvasScene(
      store,
      scene(() => true)
    )
    const detach = attachCanvasScene(
      store,
      scene(() => second)
    )
    expect(canvasScenesSettled(store)).toBe(false)
    second = true
    expect(canvasScenesSettled(store)).toBe(true)
    detach()
    expect(canvasScenesSettled(store)).toBe(true)
  })
})
