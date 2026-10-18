import { describe, expect, test } from 'bun:test'
import { join } from 'node:path'

const MAIN = join(import.meta.dirname, '..', 'src', 'main.ts')

describe('main process bundle', () => {
  // The packaged app ships `dist/main.js` without node_modules, so a dependency whose bundled
  // build still requires its own files (a UMD `require('./impl/…')`) stops the app at launch.
  test('requires nothing but Node built-ins and Electron', async () => {
    const result = await Bun.build({
      entrypoints: [MAIN],
      target: 'node',
      format: 'esm',
      external: ['electron']
    })
    expect(result.success).toBe(true)
    const [output] = result.outputs
    if (!output) throw new Error('Bun.build produced no output')
    const code = await output.text()
    const relative = [...code.matchAll(/\brequire\d*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)].map(
      (match) => match[1]
    )
    expect(relative).toEqual([])
  }, 60_000)
})
