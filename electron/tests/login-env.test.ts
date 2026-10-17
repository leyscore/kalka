import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parseEnvDump, readLoginShellEnv } from '../src/handlers/login-env'

describe('parseEnvDump', () => {
  test('reads the variables between the markers and ignores profile output', () => {
    const output = 'Welcome back!\n@@PATH=/a:/b\0EMPTY=\0EQ=x=y\0@@bye\n'
    expect(parseEnvDump(output, '@@')).toEqual({
      PATH: '/a:/b',
      EMPTY: '',
      EQ: 'x=y'
    })
  })

  test('returns null when the dump was cut short', () => {
    expect(parseEnvDump('banner MPATH=/a\0', 'M')).toBeNull()
    expect(parseEnvDump('banner only', 'M')).toBeNull()
  })
})

describe.skipIf(process.platform === 'win32')('readLoginShellEnv', () => {
  let home: string
  beforeAll(async () => {
    home = await mkdtemp(join(tmpdir(), 'kalka-login-env-'))
    await writeFile(
      join(home, '.profile'),
      'echo "profile banner"\nexport KALKA_FROM_PROFILE="a b"\nexport PATH="/kalka/bin:$PATH"\n'
    )
  })
  afterAll(async () => {
    await rm(home, { recursive: true, force: true })
  })

  test("returns the login shell's environment, profile included", async () => {
    const env = await readLoginShellEnv({
      shell: '/bin/sh',
      env: { HOME: home, PATH: '/usr/bin:/bin', ENV: '' }
    })
    expect(env?.KALKA_FROM_PROFILE).toBe('a b')
    expect(env?.PATH?.split(':')).toContain('/kalka/bin')
  })

  test('gives up on shells it does not know', async () => {
    expect(await readLoginShellEnv({ shell: '/usr/bin/python3' })).toBeNull()
  })
})
