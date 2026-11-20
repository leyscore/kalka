import { describe, expect, test } from 'bun:test'

import { createOutsideChangeHandler } from '@/app/document/io/outside-change'

function setup(unsaved: boolean) {
  const calls = { reloads: 0, warnings: 0 }
  let offered: (() => void) | null = null
  const handle = createOutsideChangeHandler({
    hasUnsavedChanges: () => unsaved,
    reload: () => {
      calls.reloads++
    },
    warn: (reload) => {
      calls.warnings++
      offered = reload
    }
  })
  return { handle, calls, offered: () => offered }
}

describe('a change to the open file made by another app', () => {
  test('reloads the document when it has no unsaved edits', () => {
    const { handle, calls } = setup(false)
    handle()
    expect(calls).toEqual({ reloads: 1, warnings: 0 })
  })

  test('keeps unsaved edits and offers to reload instead', () => {
    const { handle, calls, offered } = setup(true)
    handle()
    expect(calls).toEqual({ reloads: 0, warnings: 1 })
    offered()?.()
    expect(calls.reloads).toBe(1)
  })
})
