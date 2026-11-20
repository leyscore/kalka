import { describe, expect, test } from 'bun:test'

import { failureFromStartupOutput, portInUseFailure } from '@/app/automation/mcp/failure'

describe('why the local MCP server could not start', () => {
  test('a port another program holds is said as such, with the port', () => {
    const failure = failureFromStartupOutput(
      'exited',
      'Error: listen EADDRINUSE: address already in use 127.0.0.1:7600',
      7600
    )
    expect(failure).toEqual(portInUseFailure(7600))
    expect(failure.code).toBe('port-in-use')
  })

  test('any other output keeps the reason it had', () => {
    expect(failureFromStartupOutput('timeout', 'nothing on stderr', 7600).code).toBe('timeout')
    expect(failureFromStartupOutput('exited', 'TypeError: boom', 7600).code).toBe('exited')
  })
})
