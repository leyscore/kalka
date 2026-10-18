import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { browserLayoutPage } from '@kalka/cli/layout'
import { BrowserLayoutEngine, installLayoutEngine } from '@kalka/core/layout'

import { buildDemoDocument } from './build'

/**
 * Bun entry that `ensureDemoDocument` runs: build the demo and write it to the given path, laid
 * out by Chromium in the desktop app's render host, as the canvas lays it out. Without the host
 * the CLI says so and the layers keep the geometry they were built with.
 *
 * The engine is installed in the Core the demo is built with: the CLI's own `useBrowserLayout`
 * would install it in the Core build the CLI resolves, which this build never asks.
 */
const [output] = process.argv.slice(2)
if (!output) throw new Error('Usage: bun write.ts <output.fig>')
const page = browserLayoutPage()
if (page) installLayoutEngine(new BrowserLayoutEngine(page))
const bytes = await buildDemoDocument()
await mkdir(dirname(output), { recursive: true })
await writeFile(`${output}.tmp`, bytes)
await rename(`${output}.tmp`, output)
