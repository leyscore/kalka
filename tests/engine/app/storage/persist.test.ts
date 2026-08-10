import { describe, expect, test, vi } from 'bun:test'
import { readFileSync } from 'node:fs'

import { createMemoryLocalCanvasStore } from '@/app/storage/local-store'
import { persistStorageCanvasLocally } from '@/app/storage/sync/persist'

describe('local-first storage persistence', () => {
  test('writes document bytes before enqueueing remote synchronization', async () => {
    const store = createMemoryLocalCanvasStore()
    const observations: string[] = []
    const enqueueCanvas = vi.fn(async (canvasId: string, revision: number) => {
      const bytes = await store.readFig(canvasId)
      observations.push(`${revision}:${bytes?.join(',')}`)
    })

    const result = await persistStorageCanvasLocally(
      {
        providerId: 's3-compatible',
        canvasId: 'canvas-1',
        name: 'Stored design',
        figBytes: new Uint8Array([1, 2, 3])
      },
      { store, enqueueCanvas }
    )

    expect(result.revision).toBe(1)
    expect(observations).toEqual(['1:1,2,3'])
    expect(await store.getMeta('canvas-1')).toMatchObject({
      name: 'Stored design',
      syncStatus: 'pending',
      providerId: 's3-compatible'
    })
  })

  test('stores the embedded preview with the document', async () => {
    const store = createMemoryLocalCanvasStore()
    const enqueueCanvas = vi.fn(() => Promise.resolve())
    const figBytes = new Uint8Array(readFileSync('tests/fixtures/gold-preview.fig'))

    await persistStorageCanvasLocally(
      {
        providerId: 's3-compatible',
        canvasId: 'canvas-preview',
        name: 'Preview design',
        figBytes
      },
      { store, enqueueCanvas }
    )

    expect((await store.readThumb('canvas-preview'))?.byteLength).toBeGreaterThan(0)
  })
})
