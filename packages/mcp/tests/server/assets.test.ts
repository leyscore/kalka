import { describe, expect, test } from 'bun:test'

import { ASSET_TTL_MS, createAssetStore } from '#mcp/server/assets'

function clock(start = 0) {
  const state = { time: start }
  return { now: () => state.time, advance: (ms: number) => (state.time += ms) }
}

describe('asset store', () => {
  test('keeps a file under an unguessable name until it expires', () => {
    const time = clock()
    const store = createAssetStore({ now: time.now })
    const stored = store.put(new Uint8Array([1, 2, 3]), 'image/png')
    if (!stored) throw new Error('Expected the file to be kept')
    expect(stored.name).toMatch(/^[0-9a-f]{32}\.png$/)
    expect(stored.expiresAt).toBe(ASSET_TTL_MS)
    expect(store.get(stored.name)?.bytes).toEqual(new Uint8Array([1, 2, 3]))

    time.advance(ASSET_TTL_MS)
    expect(store.get(stored.name)).toBeNull()
  })

  test('names each file with its own extension and refuses another', () => {
    const store = createAssetStore()
    const stored = store.put(new Uint8Array([1]), 'application/pdf')
    if (!stored) throw new Error('Expected the file to be kept')
    expect(stored.name.endsWith('.pdf')).toBe(true)
    expect(store.get(stored.name.replace('.pdf', '.png'))).toBeNull()
    expect(store.get('../etc/passwd')).toBeNull()
  })

  test('keeps only the file types it can serve', () => {
    expect(createAssetStore().put(new Uint8Array([1]), 'text/html')).toBeNull()
  })

  test('drops the oldest files once it holds too many', () => {
    const store = createAssetStore()
    const names = Array.from({ length: 40 }, () => store.put(new Uint8Array([1]), 'image/png'))
    expect(names.every((stored) => stored !== null)).toBe(true)
    expect(store.get(names[0]?.name ?? '')).toBeNull()
    expect(store.get(names[39]?.name ?? '')).not.toBeNull()
  })
})
