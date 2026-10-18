import { describe, expect, test } from 'bun:test'

import { bundleReport } from '#bench/bundle'
import { buildGeneratedGraph, countLayers } from '#bench/documents'
import { classifyProcess, descendants, parsePs } from '#bench/processes'
import { slope } from '#bench/scenarios/artboards'

const PS = `
  100     1  200000 /Apps/Kalka.app/Contents/MacOS/Kalka --user-data-dir=/tmp/x
  101   100  150000 /Apps/Kalka Helper (Renderer) --type=renderer
  102   100   40000 /Apps/Kalka.app/Contents/MacOS/Kalka /Apps/dist/mcp/index.js
  103   102    1000 /bin/sh -c child
  200     1    5000 /usr/bin/unrelated
`

describe('process tree', () => {
  test('finds every process the app started, at any depth', () => {
    const rows = parsePs(PS)
    expect(rows).toHaveLength(5)
    expect(descendants(rows, 100).map((row) => row.pid)).toEqual([100, 101, 102, 103])
  })

  test('names processes by Electron type, then by command line', () => {
    const [main, renderer, mcp] = parsePs(PS)
    expect(classifyProcess(main, 'Browser')).toBe('main')
    expect(classifyProcess(renderer, undefined)).toBe('renderer')
    expect(classifyProcess(mcp, undefined)).toBe('mcp-server')
    expect(classifyProcess(main, 'Utility', 'Network Service')).toBe('network')
  })
})

describe('bundleReport', () => {
  test('splits code into startup, empty document and lazy', () => {
    const files = [
      { path: 'assets/main.js', bytes: 1024 * 1024 },
      { path: 'assets/editor.js', bytes: 512 * 1024 },
      { path: 'canvaskit.wasm', bytes: 2 * 1024 * 1024 }
    ]
    const report = bundleReport(files, ['assets/main.js'], ['assets/main.js', 'assets/editor.js'])
    expect(report.startup.js).toEqual({ files: 1, mib: 1 })
    expect(report.emptyDocument.js).toEqual({ files: 1, mib: 0.5 })
    expect(report.lazy.wasm).toEqual({ files: 1, mib: 2 })
  })
})

describe('generated documents', () => {
  test('hold the layers their spec promises', () => {
    const spec = { name: 'test', leaves: 95, artboards: 3 }
    const graph = buildGeneratedGraph(spec)
    const [page] = graph.getPages()
    const counts = countLayers(spec)
    expect(graph.getNode(page.id)?.childIds).toHaveLength(3)
    // Every layer, plus the document and its page.
    expect(graph.nodes.size).toBe(counts.total + 2)
  })
})

describe('slope', () => {
  test('is the cost of one more step', () => {
    expect(
      slope([
        { x: 1, y: 10 },
        { x: 5, y: 30 },
        { x: 10, y: 55 }
      ])
    ).toBe(5)
    expect(slope([{ x: 1, y: 1 }])).toBeNull()
  })
})
