import { describe, expect, test } from 'bun:test'

import { PERSON_RPC_TIMEOUT_MS, RPC_TIMEOUT_MS, rpcTimeoutMs } from '../src/rpc-timeout'

describe('rpcTimeoutMs', () => {
  test('gives a call that waits on the person far longer than an ordinary one', () => {
    expect(rpcTimeoutMs({ command: 'tool', args: { name: 'ask_user', args: {} } })).toBe(
      PERSON_RPC_TIMEOUT_MS
    )
    expect(rpcTimeoutMs({ command: 'tool', args: { name: 'write_html' } })).toBe(RPC_TIMEOUT_MS)
  })

  test('keeps the ordinary timeout for other commands and malformed bodies', () => {
    expect(rpcTimeoutMs({ command: 'list_documents' })).toBe(RPC_TIMEOUT_MS)
    expect(rpcTimeoutMs({ command: 'tool' })).toBe(RPC_TIMEOUT_MS)
    expect(rpcTimeoutMs({ command: 'ask_user', args: { name: 'ask_user' } })).toBe(RPC_TIMEOUT_MS)
  })
})
