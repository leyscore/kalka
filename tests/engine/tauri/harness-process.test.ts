import { afterEach, describe, expect, test } from 'bun:test'

import { spawnHarnessProcess } from '@/app/ai/harness/process'

import { clearTauriMocks, mockTauriIPC } from '#tests/helpers/tauri/mocks'

afterEach(async () => {
  await clearTauriMocks()
})

describe('Harness sidecar process', () => {
  test('spawns the bundled sidecar and keeps credentials in process environment', async () => {
    let onEvent: ((event: unknown) => void) | undefined
    const calls: Array<{ cmd: string; args: unknown }> = []
    await mockTauriIPC((cmd, args) => {
      calls.push({ cmd, args })
      if (cmd === 'plugin:shell|spawn') {
        expect(args).toMatchObject({
          program: expect.stringContaining('openpencil-harness'),
          args: [],
          options: {
            encoding: 'raw',
            env: { OPENPENCIL_HARNESS_API_KEY: 'secret' }
          }
        })
        onEvent = (args as { onEvent: { onmessage: (event: unknown) => void } }).onEvent.onmessage
        return 45
      }
      return null
    })

    const process = await spawnHarnessProcess({
      environment: { OPENPENCIL_HARNESS_API_KEY: 'secret' },
      onUnexpectedClose: () => undefined
    })
    await process.send({ id: 'one', method: 'service.shutdown' })

    const reader = process.messages.getReader()
    const encoded = new TextEncoder().encode(
      '\n' + JSON.stringify({ type: 'response', id: 'one', result: { ok: true } }) + '\n'
    )
    onEvent?.({ event: 'Stdout', payload: Array.from(encoded.slice(0, 12)) })
    onEvent?.({ event: 'Stdout', payload: Array.from(encoded.slice(12)) })
    expect((await reader.read()).value).toEqual({
      type: 'response',
      id: 'one',
      result: { ok: true }
    })

    expect(
      JSON.stringify(calls.find((call) => call.cmd === 'plugin:shell|stdin_write'))
    ).not.toContain('secret')
  })
})
