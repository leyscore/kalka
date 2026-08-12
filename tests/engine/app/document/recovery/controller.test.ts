import { describe, expect, test } from 'bun:test'

import { reactive } from 'vue'

import { createDefaultEditorState } from '@open-pencil/core/editor'

import { createDocumentRecovery } from '@/app/document/recovery/controller'
import { createMemoryRecoveryStore } from '@/app/document/recovery/memory'

function setup(buildFigFile = async () => new Uint8Array([1, 2, 3])) {
  const state = reactive({ ...createDefaultEditorState('page-1'), documentName: 'Agent draft' })
  const store = createMemoryRecoveryStore()
  let writable = false
  const recovery = createDocumentRecovery({
    state,
    store,
    recoveryId: 'recovery-1',
    hasWritableSource: () => writable,
    buildFigFile
  })
  return { state, store, recovery, setWritable: (value: boolean) => (writable = value) }
}

describe('document recovery controller', () => {
  test('persists source-less changes and skips untouched documents', async () => {
    const { state, store, recovery } = setup()
    await recovery.persistNow()
    expect(await store.list()).toEqual([])

    state.sceneVersion = 1
    await recovery.persistNow()
    expect((await store.read('recovery-1'))?.sceneVersion).toBe(1)
    recovery.disposeRecovery()
  })

  test('does not persist documents with writable sources', async () => {
    const { state, store, recovery, setWritable } = setup()
    setWritable(true)
    state.sceneVersion = 1
    await recovery.persistNow()
    expect(await store.list()).toEqual([])
    recovery.disposeRecovery()
  })

  test('coalesces concurrent changes to the latest scene version', async () => {
    let release: (() => void) | null = null
    let calls = 0
    const { state, store, recovery } = setup(async () => {
      calls++
      if (calls === 1) {
        await new Promise<void>((resolve) => {
          release = resolve
        })
      }
      return new Uint8Array([calls])
    })
    state.sceneVersion = 1
    const pending = recovery.persistNow()
    await Promise.resolve()
    state.sceneVersion = 2
    void recovery.persistNow()
    const releaseFirst = () => {
      if (release) release()
    }
    releaseFirst()
    await pending

    expect(calls).toBe(2)
    expect((await store.read('recovery-1'))?.sceneVersion).toBe(2)
    recovery.disposeRecovery()
  })

  test('successful save removes recovery data', async () => {
    const { state, store, recovery } = setup()
    state.sceneVersion = 1
    await recovery.persistNow()
    expect(await store.list()).toHaveLength(1)

    await recovery.markProtectedVersion(1)
    expect(await store.list()).toEqual([])
    recovery.disposeRecovery()
  })
})
