import { afterEach, describe, expect, test } from 'bun:test'

import { requestRestartApproval } from '@/app/shell/updater/restart'

import { clearTauriMocks, installTauriMockWindow } from '#tests/helpers/tauri/mocks'

async function mockWindows(labels: () => string[]) {
  installTauriMockWindow()
  const { mockIPC } = await import('@tauri-apps/api/mocks')
  mockIPC(
    (cmd) => {
      if (cmd === 'plugin:window|get_all_windows') return labels()
      return null
    },
    { shouldMockEvents: true }
  )
}

afterEach(async () => {
  await clearTauriMocks()
})

describe('requestRestartApproval', () => {
  test('approves when no editor window is open', async () => {
    await mockWindows(() => ['updater'])

    await expect(requestRestartApproval()).resolves.toBe(true)
  })

  test('approves once the editor window closes instead of waiting for a reply', async () => {
    await mockWindows(() => ['main', 'updater'])
    const { emit, TauriEvent } = await import('@tauri-apps/api/event')

    const approval = requestRestartApproval()
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    await emit(TauriEvent.WINDOW_DESTROYED)

    await expect(approval).resolves.toBe(true)
  })

  test('approves when the editor closes before its close event is watched', async () => {
    let lookups = 0
    await mockWindows(() => (++lookups === 1 ? ['main', 'updater'] : ['updater']))

    await expect(requestRestartApproval()).resolves.toBe(true)
  })

  test('asks each editor window in turn and stops at the first that keeps its documents', async () => {
    await mockWindows(() => ['main', 'editor-2', 'updater'])
    const requests: string[] = []
    const cancelled: string[] = []
    // Tauri's mocks drop `emitTo`; this one answers for the editors: main agrees, editor-2 not.
    const internals = (
      window as typeof window & {
        __TAURI_INTERNALS__: { invoke: (cmd: string, args?: unknown) => Promise<unknown> }
      }
    ).__TAURI_INTERNALS__
    const invoke = internals.invoke.bind(internals)
    internals.invoke = async (cmd, args) => {
      if (cmd !== 'plugin:event|emit_to') return invoke(cmd, args)
      const { target, event, payload } = args as {
        target: { label: string }
        event: string
        payload: { id: string }
      }
      if (event === 'quit-cancelled') cancelled.push(target.label)
      if (event !== 'updater:restart-request') return null
      requests.push(target.label)
      const reply = { id: payload.id, approved: target.label === 'main' }
      setTimeout(
        () => void invoke('plugin:event|emit', { event: 'updater:restart-reply', payload: reply }),
        0
      )
      return null
    }

    await expect(requestRestartApproval()).resolves.toBe(false)
    expect(requests).toEqual(['main', 'editor-2'])
    expect(cancelled).toEqual(['main'])
  })
})
