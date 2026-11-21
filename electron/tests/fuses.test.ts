import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const manifest: unknown = JSON.parse(
  readFileSync(join(import.meta.dir, '..', 'package.json'), 'utf8')
)
type AfterPack = (context: unknown) => Promise<void>
// A CommonJS hook, as electron-builder loads it: its `module.exports` is the import's default.
const hook = (await import(join(import.meta.dir, '..', 'scripts', 'after-pack.cjs'))) as {
  default: { default: AfterPack }
}
const afterPack = hook.default.default

/** The fuses `afterPack` flips for a platform, with packaging and signing stubbed out. */
async function fusesFor(electronPlatformName: string): Promise<Record<string, unknown>> {
  let asked: Record<string, unknown> = {}
  let flipped = false
  await afterPack({
    electronPlatformName,
    packager: {
      generateFuseConfig: async (options: Record<string, unknown>) => {
        asked = options
        return options
      },
      addElectronFuses: async () => {
        flipped = true
      }
    }
  })
  expect(flipped).toBe(true)
  return asked
}

describe('Electron fuses', () => {
  test('are flipped by the afterPack hook, before the bundle is signed', () => {
    expect(manifest).toMatchObject({ build: { afterPack: 'scripts/after-pack.cjs' } })
  })

  test('refuse NODE_OPTIONS and --inspect, and load the app only from its archive', async () => {
    const fuses = await fusesFor('linux')
    expect(fuses).toMatchObject({
      enableNodeOptionsEnvironmentVariable: false,
      enableNodeCliInspectArguments: false,
      onlyLoadAppFromAsar: true,
      enableCookieEncryption: true,
      enableEmbeddedAsarIntegrityValidation: false
    })
  })

  test('keep ELECTRON_RUN_AS_NODE, which the bundled MCP server runs with', async () => {
    expect((await fusesFor('win32')).runAsNode).toBe(true)
  })

  test('check the archive against its hash on macOS', async () => {
    // With a certificate named, the macOS signing step leaves the bundle to electron-builder.
    const named = process.env.CSC_NAME
    process.env.CSC_NAME = 'test'
    try {
      expect((await fusesFor('darwin')).enableEmbeddedAsarIntegrityValidation).toBe(true)
    } finally {
      if (named === undefined) delete process.env.CSC_NAME
      else process.env.CSC_NAME = named
    }
  })
})
