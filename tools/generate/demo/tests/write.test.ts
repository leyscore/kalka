import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readFigFile } from '@kalka/core/io'
import { populateAllFigPages } from '@kalka/core/io/formats/fig'
import { resolveWorkspaceRoot } from '@kalka/package-artifacts-tools/workspace'

// The fixture is laid out in the desktop app's render host, built with it; Linux needs a display.
const host = join(
  await resolveWorkspaceRoot(fileURLToPath(import.meta.url)),
  'electron',
  'dist',
  'render-host.js'
)
const canRender = existsSync(host) && (process.platform !== 'linux' || !!process.env.DISPLAY)

const directory = mkdtempSync(join(tmpdir(), 'kalka-demo-write-'))
afterAll(() => rmSync(directory, { recursive: true, force: true }))

describe.skipIf(!canRender)('demo fixture', () => {
  test('is written laid out by the browser', async () => {
    const output = join(directory, 'fixture.fig')
    const run = Bun.spawnSync(['bun', fileURLToPath(import.meta.resolve('#demo/write')), output], {
      stderr: 'pipe'
    })
    expect(run.exitCode).toBe(0)
    const graph = await readFigFile(new File([readFileSync(output)], 'Demo.fig'))
    populateAllFigPages(graph)
    const root = [...graph.getAllNodes()].find((node) => node.name === 'Announcement system')
    if (!root) throw new Error('The demo has no announcement section')
    // A vertical auto layout that was laid out stacks its children and hugs them.
    const children = graph.getChildren(root.id)
    const tops = children.map((child) => child.y)
    expect(tops).toEqual([...tops].sort((a, b) => a - b))
    expect(new Set(tops).size).toBe(children.length)
    const last = children[children.length - 1]
    expect(root.height).toBeGreaterThanOrEqual(last.y + last.height)
  }, 60_000)
})
