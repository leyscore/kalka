import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import { zipSync, type Zippable } from 'fflate'
import { lock } from 'proper-lockfile'
import type { Plugin } from 'vite'

import { resolveWorkspaceRoot } from '@kalka/package-artifacts-tools/workspace'

/** The landing page `/demo` opens, as a Kalka folder, relative to the repository root. */
const DEMO_SOURCE = 'assets/demo/kalka-design'
/** Where the app serves the demo from. */
const DEMO_OUTPUT = 'public/demo.kalka'
const CACHE = '.cache/demo'
/** The engine showcase the browser tests open; only the dev server serves it. */
const FIXTURE_OUTPUT = `${CACHE}/fixture.fig`
/** A fixed date for every entry, so the same folder always zips to the same bytes. */
const ENTRY_DATE = new Date(Date.UTC(2026, 0, 1))

/** Everything the demo's bytes depend on: its own sources and the engine that writes them. */
const INPUT_DIRECTORIES = [
  'tools/generate/demo/src',
  'packages/scene-graph/src',
  'packages/core/src',
  'packages/design-jsx/src',
  'packages/dom-css/src',
  'packages/emit/src',
  'packages/fig/src',
  'packages/kiwi/src'
]
const INPUT_FILES = ['tools/generate/demo/package.json', 'package.json', 'bun.lock']

async function filesIn(root: string, directory: string): Promise<string[]> {
  const result: string[] = []
  for (const item of await readdir(join(root, directory), { withFileTypes: true })) {
    const path = join(directory, item.name)
    if (item.isDirectory()) result.push(...(await filesIn(root, path)))
    else if (item.isFile()) result.push(path)
  }
  return result
}

/** The demo folder as a `.kalka` archive, as the app's Kalka reader opens it. */
async function zipDemo(root: string): Promise<void> {
  const entries: Zippable = {}
  for (const path of (await filesIn(root, DEMO_SOURCE)).sort()) {
    const name = path.slice(DEMO_SOURCE.length + 1)
    if (!name.split('/').some((part) => part.startsWith('.')))
      entries[name] = [await readFile(join(root, path)), { mtime: ENTRY_DATE }]
  }
  const output = join(root, DEMO_OUTPUT)
  await mkdir(join(root, 'public'), { recursive: true })
  await writeFile(`${output}.tmp`, zipSync(entries))
  await rename(`${output}.tmp`, output)
}

async function fingerprint(root: string): Promise<string> {
  const listed = await Promise.all(INPUT_DIRECTORIES.map((directory) => filesIn(root, directory)))
  return fingerprintFiles(root, [...listed.flat(), ...INPUT_FILES])
}

async function fingerprintFiles(root: string, files: string[]): Promise<string> {
  const paths = [...files].sort()
  const hash = createHash('sha256')
  for (const path of paths)
    hash
      .update(path)
      .update('\0')
      .update(await readFile(join(root, path)))
      .update('\0')
  return hash.digest('hex')
}

const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

/** Whether `output` is the one built from these inputs and nobody replaced it since. */
async function isCurrent(root: string, record: string, output: string, key: string) {
  try {
    const [recorded, bytes] = await Promise.all([
      readFile(join(root, CACHE, record), 'utf8'),
      readFile(join(root, output))
    ])
    return recorded === `${key}\n${digest(bytes)}`
  } catch {
    return false
  }
}

async function record(root: string, name: string, output: string, key: string) {
  await writeFile(join(root, CACHE, name), `${key}\n${digest(await readFile(join(root, output)))}`)
}

/**
 * Zip `public/demo.kalka` and build the test fixture unless the ones there were built from the
 * current sources; `fixture: false` skips the fixture, which only the dev server serves.
 * Build-time only: Vite's config calls it before serving or bundling, and `generate:demo`
 * forces it.
 */
export async function ensureDemoDocument(
  options: { root?: string; force?: boolean; fixture?: boolean } = {}
) {
  const root = options.root ?? (await resolveWorkspaceRoot(fileURLToPath(import.meta.url)))
  const cache = join(root, CACHE)
  await mkdir(cache, { recursive: true })
  // Dev, Storybook, and Playwright servers may start together; one of them builds.
  const release = await lock(cache, {
    realpath: false,
    retries: { retries: 120, minTimeout: 100, maxTimeout: 1000, randomize: false }
  })
  try {
    const demoKey = await fingerprintFiles(root, await filesIn(root, DEMO_SOURCE))
    if (options.force || !(await isCurrent(root, 'demo', DEMO_OUTPUT, demoKey))) {
      await zipDemo(root)
      await record(root, 'demo', DEMO_OUTPUT, demoKey)
      console.info('Zipped the demo document')
    }
    if (options.fixture === false) return
    const key = await fingerprint(root)
    if (!options.force && (await isCurrent(root, 'fingerprint', FIXTURE_OUTPUT, key))) return
    // Vite loads this module in Node; the build runs in Bun, like the repository's other
    // tools, and only when the sources changed, so a cached start never loads the engine.
    await promisify(execFile)(
      'bun',
      [fileURLToPath(new URL('write.ts', import.meta.url)), join(root, FIXTURE_OUTPUT)],
      { cwd: root }
    )
    await record(root, 'fingerprint', FIXTURE_OUTPUT, key)
    console.info('Generated the demo test fixture')
  } finally {
    await release()
  }
}

/** Serves the test fixture at `/demo-fixture.fig` on the dev server; bundles never carry it. */
export function demoFixturePlugin(root: string): Plugin {
  return {
    name: 'kalka-demo-fixture',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/demo-fixture.fig', (_request, response) => {
        readFile(join(root, FIXTURE_OUTPUT)).then(
          (bytes) => {
            response.setHeader('Content-Type', 'application/octet-stream')
            response.end(bytes)
          },
          () => {
            response.statusCode = 404
            response.end()
          }
        )
      })
    }
  }
}
