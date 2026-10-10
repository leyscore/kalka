import { describe, expect, setDefaultTimeout, test } from 'bun:test'
import { mkdtemp, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { CLI_ENTRY, FIXTURES } from '#cli-tests/helpers/paths'

setDefaultTimeout(120_000)

async function cli(args: string[]) {
  const proc = Bun.spawn([process.execPath, CLI_ENTRY, ...args], { stdout: 'pipe', stderr: 'pipe' })
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text()
  ])
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: await proc.exited }
}

describe('convert CLI', () => {
  test('converts to and from a Kalka folder and a .kalka file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'kalka-convert-'))
    const folder = join(dir, 'slots')
    const toFolder = await cli(['convert', join(FIXTURES, 'slots.fig'), '-f', 'folder', '-o', folder])
    expect(toFolder.exitCode).toBe(0)
    expect((await readdir(folder)).sort()).toEqual([
      'design-system',
      'pages',
      'project.json',
      'styles.css'
    ])

    const archive = join(dir, 'slots.kalka')
    expect((await cli(['convert', folder, '-f', 'kalka', '-o', archive])).exitCode).toBe(0)
    const fromFolder = await cli(['info', folder, '--json'])
    const fromArchive = await cli(['info', archive, '--json'])
    expect(fromFolder.exitCode).toBe(0)
    expect(fromArchive.stdout).toBe(fromFolder.stdout)
  })
})
