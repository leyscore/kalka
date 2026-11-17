import { describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { CONTENT_SECURITY_POLICY, SANDBOX_CONTENT_SECURITY_POLICY, SANDBOX_PATH } from '../src/csp'

/** The workspace root, found by its lockfile. */
function workspaceRoot(): string {
  let dir = import.meta.dir
  while (!existsSync(join(dir, 'bun.lock'))) {
    const parent = dirname(dir)
    if (parent === dir) throw new Error('No workspace root above the tests')
    dir = parent
  }
  return dir
}

const sandboxPage = readFileSync(join(workspaceRoot(), 'public', SANDBOX_PATH), 'utf8')

describe('content policies', () => {
  test('the editor runs no code from strings, and the sandbox page runs nothing else', () => {
    expect(CONTENT_SECURITY_POLICY).not.toContain("'unsafe-eval'")
    expect(SANDBOX_CONTENT_SECURITY_POLICY).toContain("'unsafe-eval'")
    expect(SANDBOX_CONTENT_SECURITY_POLICY).toContain("connect-src 'none'")
  })

  test('the sandbox page carries the same policy for the web app, which sends no header', () => {
    const meta = /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/.exec(sandboxPage)
    expect(meta?.[1]).toBe(SANDBOX_CONTENT_SECURITY_POLICY)
  })
})
