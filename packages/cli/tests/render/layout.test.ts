import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, test } from 'bun:test'

import { writeKalkaFolder } from '@kalka/core/io/formats/kalka'
import { computeAllLayouts, installLayoutEngine } from '@kalka/core/layout'
import { SceneGraph } from '@kalka/scene-graph'

import { writeFolderFiles } from '#cli/headless'
import { RenderHost } from '#cli/render/host/session'
import { BrowserLayoutEngine } from '#cli/render/layout'
import { CLI_ENTRY, workspaceRoot } from '#cli-tests/helpers/paths'

const HOST = join(workspaceRoot(), 'electron', 'dist', 'render-host.js')
// The render host is built with the desktop app, and Linux needs a display (xvfb on CI).
const canRender = existsSync(HOST) && (process.platform !== 'linux' || !!process.env.DISPLAY)

/**
 * A row whose layout Yoga and the browser disagree on: a child sized by the CSS its layer keeps
 * as written, half its parent, which Yoga does not read, and a wrapping row of fixed tiles.
 */
function document() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const row = graph.createNode('FRAME', page.id, {
    name: 'Row',
    width: 400,
    height: 100,
    layoutMode: 'HORIZONTAL',
    primaryAxisSizing: 'FIXED',
    counterAxisSizing: 'FIXED'
  })
  const half = graph.createNode('FRAME', row.id, {
    name: 'Half',
    width: 100,
    height: 40,
    style: { width: '50%' }
  })
  const tiles = graph.createNode('FRAME', page.id, {
    name: 'Tiles',
    y: 200,
    width: 250,
    height: 10,
    layoutMode: 'HORIZONTAL',
    layoutWrap: 'WRAP',
    primaryAxisSizing: 'FIXED',
    counterAxisSizing: 'HUG',
    itemSpacing: 10,
    counterAxisSpacing: 10
  })
  for (let index = 0; index < 3; index++) {
    graph.createNode('FRAME', tiles.id, { name: `Tile ${index}`, width: 100, height: 50 })
  }
  return { graph, half, tiles }
}

/** The width `kalka eval` reads for the half-width layer, laid out as the CLI lays it out. */
async function evalHalfWidth(env: Record<string, string> = {}): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'kalka-layout-'))
  try {
    const folder = join(dir, 'Row')
    await writeFolderFiles(folder, await writeKalkaFolder(document().graph))
    const code = "return figma.root.findOne((node) => node.name === 'Half').width"
    const proc = Bun.spawn([process.execPath, CLI_ENTRY, 'eval', folder, '--code', code], {
      env: { ...process.env, ...env },
      stdout: 'pipe',
      stderr: 'pipe'
    })
    const output = await new Response(proc.stdout).text()
    expect(await proc.exited).toBe(0)
    return output.trim()
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe('layout without the render host', () => {
  test('is Yoga, which keeps the size the layer stores', () => {
    const { graph, half } = document()
    computeAllLayouts(graph)
    expect(graph.getNode(half.id)?.width).toBe(100)
  })

  test('is what the CLI uses when told to', async () => {
    expect(await evalHalfWidth({ KALKA_LAYOUT: 'yoga' })).toBe('100')
  }, 60_000)
})

describe.skipIf(!canRender)('the CLI lays out with Chromium', () => {
  const host = RenderHost.start()
  afterAll(() => host?.close())

  function withBrowser(run: () => void) {
    if (!host) throw new Error('No render host')
    const uninstall = installLayoutEngine(new BrowserLayoutEngine(host))
    try {
      run()
    } finally {
      uninstall()
    }
  }

  test('CSS kept as written sizes the layer, as on the canvas', () => {
    const { graph, half, tiles } = document()
    withBrowser(() => computeAllLayouts(graph))
    expect(graph.getNode(half.id)?.width).toBe(200)
    // Two rows of 50 and the 10 between them.
    expect(graph.getNode(tiles.id)?.height).toBe(110)
    expect(graph.getChildren(tiles.id).map((tile) => [tile.x, tile.y])).toEqual([
      [0, 0],
      [110, 0],
      [0, 60]
    ])
  }, 60_000)

  test('an edit lays its artboard out again', () => {
    const { graph, half } = document()
    withBrowser(() => {
      computeAllLayouts(graph)
      graph.updateNode(half.id, { style: { width: '25%' } })
      computeAllLayouts(graph, half.id)
    })
    expect(graph.getNode(half.id)?.width).toBe(100)
  }, 60_000)

  test('in a command, which starts the host itself', async () => {
    expect(await evalHalfWidth()).toBe('200')
  }, 60_000)

  test('falls back to Yoga once the host is gone', () => {
    const own = RenderHost.start()
    if (!own) throw new Error('No render host')
    own.close()
    const { graph, half } = document()
    const uninstall = installLayoutEngine(new BrowserLayoutEngine(own))
    try {
      computeAllLayouts(graph)
    } finally {
      uninstall()
    }
    expect(graph.getNode(half.id)?.width).toBe(100)
  })
})
